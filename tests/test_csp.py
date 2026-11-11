#!/usr/bin/env python3
"""
Security regression check for every built page (no browser needed).

  python3 tests/test_csp.py

Checks that each HTML page:
  1. carries a Content-Security-Policy <meta> with a hash for every inline
     <script> and <style> it contains (so the browser will run them, and
     nothing else inline);
  2. loads scripts only from this site;
  3. has no inline event handlers (onclick=...), javascript: links or
     style="..." attributes (the policy would block them);
  4. has a referrer policy.
And that .well-known/security.txt has not expired.
"""
import base64
import hashlib
import os
import re
import sys
from datetime import datetime, timezone

from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "src", "content", "tests", "scripts", "node_modules", "__pycache__"}
EVENT_ATTR = re.compile(r"^on[a-z]+$", re.I)


def sha(text):
    return "'sha256-%s'" % base64.b64encode(hashlib.sha256(text.encode("utf-8")).digest()).decode("ascii")


def pages():
    for dirpath, dirnames, files in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for f in files:
            if f.endswith(".html"):
                yield os.path.relpath(os.path.join(dirpath, f), ROOT)


def check(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    errs = []
    meta = soup.find("meta", attrs={"http-equiv": re.compile("^Content-Security-Policy$", re.I)})
    if meta is None:
        return ["no Content-Security-Policy meta"]
    csp = meta.get("content", "")
    directives = {}
    for part in csp.split(";"):
        bits = part.strip().split()
        if bits:
            directives[bits[0]] = bits[1:]
    script_src = directives.get("script-src", [])
    style_src = directives.get("style-src", [])
    for bad in ("'unsafe-inline'", "'unsafe-eval'", "*", "http:", "https:"):
        if bad in script_src:
            errs.append("script-src allows %s" % bad)
        if bad in style_src:
            errs.append("style-src allows %s" % bad)
    if directives.get("object-src") != ["'none'"]:
        errs.append("object-src is not 'none'")
    base_ok = ["'self'"] if soup.find("base") is not None else ["'none'"]
    if directives.get("base-uri") != base_ok:
        errs.append("base-uri is not %s" % base_ok[0])
    for el in soup.find_all("script"):
        src = el.get("src")
        if src:
            if re.match(r"^(https?:)?//", src):
                errs.append("outside script: " + src)
            continue
        if el.get("type") and el["type"] != "text/javascript":
            continue
        if sha(el.string or "") not in script_src:
            errs.append("inline script without a matching hash: %s..." % (el.string or "")[:40].strip())
    for el in soup.find_all("style"):
        if sha(el.string or "") not in style_src:
            errs.append("inline style without a matching hash")
    for el in soup.find_all(True):
        for a, v in el.attrs.items():
            if EVENT_ATTR.match(a):
                errs.append("inline handler %s on <%s>" % (a, el.name))
            if a == "style":
                errs.append("style attribute on <%s>" % el.name)
            if a in ("href", "src", "action", "formaction") and isinstance(v, str) and v.strip().lower().startswith("javascript:"):
                errs.append("javascript: URL on <%s>" % el.name)
    if soup.find("meta", attrs={"name": "referrer"}) is None:
        errs.append("no referrer policy")
    return errs


def main():
    fails = 0
    n = 0
    for rel in sorted(pages()):
        n += 1
        for e in check(rel):
            fails += 1
            print("FAIL %s: %s" % (rel, e))
    txt = os.path.join(ROOT, ".well-known", "security.txt")
    if not os.path.exists(txt):
        fails += 1
        print("FAIL .well-known/security.txt is missing")
    else:
        with open(txt, encoding="utf-8") as f:
            m = re.search(r"^Expires:\s*(\S+)", f.read(), re.M)
        exp = datetime.fromisoformat(m.group(1).replace("Z", "+00:00")) if m else None
        if exp is None or exp < datetime.now(timezone.utc):
            fails += 1
            print("FAIL .well-known/security.txt has expired or has no Expires line: update SECURITY_TXT_EXPIRES in build.py")
    print("CSP checks: %d pages, %s" % (n, "all passed" if not fails else "%d problems" % fails))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
