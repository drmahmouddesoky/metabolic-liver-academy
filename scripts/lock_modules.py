#!/usr/bin/env python3
"""
Locked course modules: encrypt them and manage access codes.

The readable text of locked modules lives ONLY in the founder's private repository
(for example ../mla-courses). This tool reads it, renders each module with the same
engine as build.py, encrypts it, and writes the encrypted files into this public
repository under locked/<course>/. Nothing readable is written here except each
module's title, subtitle, audience, reading time and objectives (index.json), which
the public "locked" page shows as a teaser.

Private repository layout:
    courses/<course>.py     MODULES = [...]  (same schema as content/gi_modules.py,
                            plus "series": "<course>"); optional SOURCES = {...},
                            UPDATED = "YYYY-MM-DD"
    access/<course>.json    the course key and the access codes (SECRET: never copy
                            this file into the public repository)

Commands (run from this repository):
    python3 scripts/lock_modules.py --source ../mla-courses
        encrypt every locked module of every course, then rebuild the site
    python3 scripts/lock_modules.py --source ../mla-courses --new-codes lipids 10 --label "Cohort 1, Jan 2027"
        make 10 new access codes for the course and print them
    python3 scripts/lock_modules.py --source ../mla-courses --revoke ABCD-EFGH-JKMN
        withdraw one code; the course key is changed so the code stops working
        everywhere (other learners simply enter their own code again once)
    python3 scripts/lock_modules.py --source ../mla-courses --list lipids
        show the codes of a course, who they were given to, and their status

Cryptography (matches unlock.js):
    course key      32 random bytes per course, AES-256-GCM
    per code        PBKDF2-HMAC-SHA256(code, course salt, 600 000 rounds) -> 48 bytes:
                    first 16 = public code id, last 32 = key that wraps the course key
    module file     AES-GCM(course key, nonce, aad = "mla-mod:<course>/<slug>/<lang>")
    wrapped key     AES-GCM(code key,  nonce, aad = "mla-key:<course>")
    Nonces are derived with HMAC-SHA256 from the key and the content (synthetic IV),
    so re-running the tool on unchanged text gives byte-identical files.
"""
import argparse
import base64
import datetime
import hashlib
import hmac
import importlib.util
import json
import os
import re
import secrets
import subprocess
import sys

from bs4 import BeautifulSoup
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import build  # noqa: E402
import chrome  # noqa: E402

ITERATIONS = 600_000
ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # no 0/O, 1/I/L
LANGS = ("en", "ar")


def b64(b):
    return base64.b64encode(b).decode("ascii")


def unb64(s):
    return base64.b64decode(s)


def clean_code(code):
    return re.sub(r"[^A-Z0-9]", "", str(code).upper())


def new_code():
    raw = "".join(secrets.choice(ALPHABET) for _ in range(12))
    return "-".join(raw[i:i + 4] for i in range(0, 12, 4))


def seal(key, plain, aad):
    """AES-256-GCM with a synthetic nonce: deterministic for the same key, text and aad."""
    nonce = hmac.new(key, aad + b"\x00" + plain, hashlib.sha256).digest()[:12]
    return nonce + AESGCM(key).encrypt(nonce, plain, aad)


def open_sealed(key, packed, aad):
    return AESGCM(key).decrypt(packed[:12], packed[12:], aad)


def derive(code, salt, iterations=ITERATIONS):
    bits = hashlib.pbkdf2_hmac("sha256", clean_code(code).encode("utf-8"), salt, iterations, dklen=48)
    return bits[:16], bits[16:]


# ------------------------------------------------------------------ access files (private)
def access_path(source, series):
    return os.path.join(source, "access", "%s.json" % series)


def load_access(source, series):
    path = access_path(source, series)
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return {"course": series, "key": b64(secrets.token_bytes(32)), "salt": b64(secrets.token_bytes(16)), "codes": []}


def save_access(source, series, acc):
    path = access_path(source, series)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(acc, f, ensure_ascii=False, indent=2)
        f.write("\n")


def rotate(acc):
    acc["key"] = b64(secrets.token_bytes(32))


# ------------------------------------------------------------------ private course files
def load_course(source, series):
    path = os.path.join(source, "courses", "%s.py" % series)
    if not os.path.exists(path):
        return None
    spec = importlib.util.spec_from_file_location("private_course_%s" % series, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def courses_in(source):
    folder = os.path.join(source, "courses")
    if not os.path.isdir(folder):
        return []
    return sorted(f[:-3] for f in os.listdir(folder) if f.endswith(".py") and not f.startswith("_"))


def pair(x):
    return list(x) if isinstance(x, (tuple, list)) else [x, x]


def index_entry(m, updated):
    return {
        "slug": m["slug"], "series": m["series"], "number": m["number"],
        "title": m["title"], "subtitle": m["subtitle"], "audience": m["audience"], "minutes": m["minutes"],
        "objectives": [pair(o) for o in m["objectives"]], "en_only": bool(m.get("en_only")),
        "version": m.get("version", "1.0"), "updated": m.get("updated", updated),
    }


def render_layout(m, lang):
    """The module's contents and body, exactly as build.py would publish them, for one language."""
    rel = "modules/%s.html" % m["slug"]
    page = chrome.add_chrome(build.module_page(m), rel)
    soup = BeautifulSoup(build.split(page, rel, lang), "html.parser")
    layout = soup.select_one("div.mod-layout")
    return layout.decode_contents()


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write("\n")


def publish(source, series, out=ROOT, quiet=False):
    """Encrypt every locked module of one course and write keys.json and index.json."""
    course = load_course(source, series)
    if course is None:
        raise SystemExit("No private course file: %s" % os.path.join(source, "courses", series + ".py"))
    acc = load_access(source, series)
    save_access(source, series, acc)  # creates the course key on first use
    key, salt = unb64(acc["key"]), unb64(acc["salt"])
    build.EXTRA_SOURCES.update(getattr(course, "SOURCES", {}))
    build.EXTRA_FIGURES.update(getattr(course, "FIGURES", {}))
    updated = getattr(course, "UPDATED", datetime.date.today().isoformat())
    mods = sorted(course.MODULES, key=lambda m: m["number"])
    for m in mods:
        if m.get("series") != series:
            raise SystemExit("Module %s: set \"series\": \"%s\"" % (m.get("slug"), series))
    folder = os.path.join(out, "locked", series)
    os.makedirs(folder, exist_ok=True)
    # titles first: the page header counts the modules of the course
    write_json(os.path.join(folder, "index.json"), {"course": series, "modules": [index_entry(m, updated) for m in mods]})
    keep = {"index.json", "keys.json"}
    for m in mods:
        m = dict(m, updated=m.get("updated", updated))
        for lang in LANGS:
            plain = render_layout(m, lang).encode("utf-8")
            aad = ("mla-mod:%s/%s/%s" % (series, m["slug"], lang)).encode("utf-8")
            name = "%s.%s.json" % (m["slug"], lang)
            write_json(os.path.join(folder, name), {"v": 1, "data": b64(seal(key, plain, aad))})
            keep.add(name)
    for f in os.listdir(folder):  # modules removed from the private file disappear from the site too
        if f not in keep:
            os.remove(os.path.join(folder, f))
    entries = []
    for c in acc["codes"]:
        if c.get("status") != "active":
            continue
        cid, ckey = derive(c["code"], salt)
        entries.append({"id": b64(cid), "w": b64(seal(ckey, key, ("mla-key:%s" % series).encode("utf-8")))})
    entries.sort(key=lambda e: e["id"])  # order says nothing about who received which code
    write_json(os.path.join(folder, "keys.json"), {"v": 1, "course": series, "iter": ITERATIONS, "salt": acc["salt"], "codes": entries})
    if not quiet:
        print("%s: %d locked modules, %d active codes" % (series, len(mods), len(entries)))


def find_code(source, code):
    target = clean_code(code)
    for series in courses_in(source):
        acc = load_access(source, series)
        for c in acc["codes"]:
            if clean_code(c["code"]) == target:
                return series, acc, c
    return None, None, None


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--source", required=True, help="the private repository folder")
    ap.add_argument("--new-codes", nargs=2, metavar=("COURSE", "N"))
    ap.add_argument("--label", default="", help="who the new codes are for (name, email or cohort)")
    ap.add_argument("--revoke", metavar="CODE")
    ap.add_argument("--list", metavar="COURSE")
    ap.add_argument("--no-build", action="store_true", help="do not run build.py afterwards")
    ap.add_argument("--out", default=ROOT, help=argparse.SUPPRESS)  # tests write elsewhere
    a = ap.parse_args(argv)
    source = os.path.abspath(os.path.expanduser(a.source))
    if source == ROOT or source.startswith(ROOT + os.sep):
        raise SystemExit("--source must be the PRIVATE repository, outside this public one.")
    today = datetime.date.today().isoformat()

    if a.list:
        acc = load_access(source, a.list)
        for c in acc["codes"]:
            print("%-16s %-8s %-11s %s" % (c["code"], c["status"], c.get("issued", ""), c.get("label", "")))
        return
    if a.new_codes:
        series, n = a.new_codes[0], int(a.new_codes[1])
        acc = load_access(source, series)
        made = [new_code() for _ in range(n)]
        acc["codes"] += [{"code": c, "label": a.label, "issued": today, "status": "active"} for c in made]
        save_access(source, series, acc)
        print("New codes for %s%s:" % (series, " (%s)" % a.label if a.label else ""))
        for c in made:
            print("  " + c)
    if a.revoke:
        series, acc, c = find_code(source, a.revoke)
        if c is None:
            raise SystemExit("Code not found: " + a.revoke)
        c["status"], c["revoked"] = "revoked", today
        rotate(acc)  # browsers that already hold the old course key lose access too
        save_access(source, series, acc)
        print("Withdrawn: %s (%s). The %s course key was changed." % (c["code"], c.get("label", ""), series))
    for series in courses_in(source):
        publish(source, series, out=a.out)
    if not a.no_build and os.path.abspath(a.out) == ROOT:
        subprocess.run([sys.executable, os.path.join(ROOT, "build.py")], check=True)


if __name__ == "__main__":
    main()
