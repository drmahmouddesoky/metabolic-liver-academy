#!/usr/bin/env python3
"""
End-to-end check of locked course modules (scripts/lock_modules.py + unlock.js).

Builds a throw-away "demo" course in a temporary folder (nothing in the repository
changes), encrypts it, serves it on port 8766 and drives a real browser:
  - the readable text never appears in the published files or the locked page
  - a wrong code and a withdrawn code are refused
  - a valid code (typed in lower case with spaces) opens the module; the quiz and
    contents work; reloading opens it again without the code; the Arabic page too
  - the request-access form checks its fields and prepares the email
  - withdrawing another code changes the course key: the stored key stops working
    and the learner's own code opens the module again
  - re-running the tool on unchanged text gives byte-identical files
  - no Content Security Policy violations and no script errors

  python3 tests/test_locked.py
"""
import asyncio
import functools
import http.server
import json
import os
import shutil
import sys
import tempfile
import threading

from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import lock_modules as LM  # noqa: E402
import build  # noqa: E402
import chrome  # noqa: E402

MARKER = "Secret teaching text 7Q4ZX"
PORT = 8766
COURSE = '''
SOURCES = {}
UPDATED = "2026-11-12"
MODULES = [{
    "slug": "demo-locked", "series": "demo", "number": 2, "en_only": True,
    "title": {"en": "Demo locked module", "ar": "وحدة تجريبية مقفلة"},
    "subtitle": {"en": "A test module.", "ar": "وحدة اختبار."},
    "audience": {"en": "Testers", "ar": "المختبرون"}, "minutes": 5,
    "objectives": ["Open a locked module."],
    "blocks": [
        ("h2", "First section", "first"),
        ("p", "%s with a citation [[easl2024]]."),
        ("h2", "Test yourself", "quiz"),
        ("mcq", [{"q": "Two plus two?", "options": ["Three", "Four"], "answer": 1, "why": "Arithmetic."}]),
    ],
}]
''' % MARKER

fails = []


def check(ok, what):
    print(("ok   " if ok else "FAIL ") + what)
    if not ok:
        fails.append(what)


def serve(folder):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    handler = functools.partial(Quiet, directory=folder)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


async def poll(pg, expr, timeout=20.0):
    """Wait until a JavaScript expression is true. (Playwright's own waiting helper runs
    eval inside the page, which the site's security policy rightly forbids.)"""
    waited = 0.0
    while waited < timeout:
        if await pg.evaluate(expr):
            return True
        await asyncio.sleep(0.2)
        waited += 0.2
    raise TimeoutError(expr)


def tool(private, site, *args):
    LM.main(["--source", private, "--out", site, "--no-build"] + list(args))


def snapshot(folder):
    out = {}
    for f in sorted(os.listdir(folder)):
        with open(os.path.join(folder, f), "rb") as fh:
            out[f] = fh.read()
    return out


async def run(site, private, codes):
    good, revoked, other = codes
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        await pg.add_init_script("window.__v=[];document.addEventListener('securitypolicyviolation',e=>window.__v.push(e.violatedDirective+' '+e.blockedURI))")
        url = "http://127.0.0.1:%d/modules/demo-locked.html" % PORT

        await pg.goto(url, wait_until="load")
        check(await pg.is_visible("#lock-form"), "locked page shows the code form")
        check(MARKER not in await pg.content(), "locked page does not contain the text")

        async def try_code(code):
            await pg.fill("#lock-code", code)
            await pg.click("#lock-form button")
            await poll(pg, "(() => { const m = document.getElementById('lock-msg'); return !m || /valid|withdrawn/.test(m.textContent) || !document.getElementById('lock-form'); })()")

        await try_code("ZZZZ-ZZZZ-ZZZZ")
        check("not valid" in await pg.inner_text("#lock-msg"), "a wrong code is refused")
        await try_code(revoked)
        check("not valid" in await pg.inner_text("#lock-msg"), "a withdrawn code is refused")
        await try_code("  " + good.lower().replace("-", " ") + " ")
        check(await pg.is_visible("text=" + MARKER), "a valid code (lower case, spaces) opens the module")
        check(await pg.locator(".mod-toc a").count() >= 2, "contents list is present")
        await pg.click(".mcq .opt[data-i='1']")
        check(await pg.is_visible(".mcq .why") and "Correct" in await pg.inner_text(".mcq .why"), "quiz works after unlocking")

        await pg.reload(wait_until="load")
        await pg.wait_for_selector("text=" + MARKER, timeout=20000)
        check(True, "reload opens the module without the code")
        await pg.goto("http://127.0.0.1:%d/ar/modules/demo-locked.html" % PORT, wait_until="load")
        await pg.wait_for_selector("text=" + MARKER, timeout=20000)
        check(await pg.evaluate("document.documentElement.lang") == "ar", "Arabic page opens with the same access")

        # request form, on a fresh browser profile so the module stays locked
        ctx2 = await b.new_context()
        p2 = await ctx2.new_page()
        await p2.goto(url, wait_until="load")
        await p2.click(".lock-request summary")
        await p2.click("#request-form button")
        check("Please add" in await p2.inner_text("#request-msg"), "request form asks for missing details")
        await p2.evaluate("document.getElementById('request-send').click = function () { window.__mailto = this.href; }")
        await p2.fill("#rq-name", "Dr Test Person")
        await p2.fill("#rq-email", "test@example.org")
        await p2.select_option("#rq-role", "Pharmacist")
        await p2.fill("#rq-place", "Test Hospital, Riyadh")
        await p2.check("#rq-consent")
        await p2.click("#request-form button")
        mailto = await p2.evaluate("window.__mailto || ''")
        check(mailto.startswith("mailto:info@metabolicliveracademy.org?subject=") and "Dr%20Test%20Person" in mailto and "Pharmacist" in mailto,
              "request form prepares the email to the Academy")
        await ctx2.close()

        # withdraw another code: the course key changes
        before = snapshot(os.path.join(site, "locked", "demo"))
        tool(private, site, "--revoke", other)
        await pg.goto(url, wait_until="load")
        await poll(pg, "/again/.test((document.getElementById('lock-msg')||{}).textContent||'')")
        check(True, "after the key changes, the stored key is refused and the learner is asked again")
        await try_code(good)
        check(await pg.is_visible("text=" + MARKER), "the learner's own code still opens the module after the change")
        after = snapshot(os.path.join(site, "locked", "demo"))
        check(before["index.json"] == after["index.json"] and before["demo-locked.en.json"] != after["demo-locked.en.json"],
              "withdrawing a code re-encrypts the module with a new key")

        v = await pg.evaluate("window.__v")
        check(not v and not errors, "no policy violations or script errors (%s %s)" % (v, errors))
        await b.close()


def main():
    tmp = tempfile.mkdtemp(prefix="mla-lock-test-")
    private, site = os.path.join(tmp, "private"), os.path.join(tmp, "site")
    try:
        os.makedirs(os.path.join(private, "courses"))
        with open(os.path.join(private, "courses", "demo.py"), "w", encoding="utf-8") as f:
            f.write(COURSE)
        build.C.SERIES["demo"] = {"en": "Demo course", "ar": "دورة تجريبية", "anchor": "demo-series",
                                  "lead_en": "Test.", "lead_ar": "اختبار.", "live": False}
        LM.ITERATIONS = 600_000
        tool(private, site, "--new-codes", "demo", "3", "--label", "test")
        acc = LM.load_access(private, "demo")
        codes = [c["code"] for c in acc["codes"]]
        tool(private, site, "--revoke", codes[1])
        acc = LM.load_access(private, "demo")
        codes_left = [c for c in acc["codes"] if c["status"] == "active"]
        check(len(codes_left) == 2, "two codes active after withdrawing one")

        folder = os.path.join(site, "locked", "demo")
        published = b"".join(snapshot(folder).values())
        check(MARKER.encode() not in published, "published files contain no readable module text")
        check(all(c["code"].encode() not in published for c in acc["codes"]), "published files contain no access code")
        first = snapshot(folder)
        tool(private, site)
        check(first == snapshot(folder), "re-running on unchanged text gives identical files")

        # the public locked pages, built exactly as build.py does
        with open(os.path.join(folder, "index.json"), encoding="utf-8") as f:
            entry = json.load(f)["modules"][0]
        entry["objectives"] = [tuple(o) for o in entry["objectives"]]
        rel = "modules/demo-locked.html"
        page = chrome.add_chrome(build.module_page(dict(entry, locked=True), locked=True), rel)
        for lang, prefix in (("en", ""), ("ar", "ar/")):
            os.makedirs(os.path.join(site, prefix, "modules"), exist_ok=True)
            with open(os.path.join(site, prefix, rel), "w", encoding="utf-8") as f:
                f.write(build.split(page, rel, lang))
        for f in ("main.js", "unlock.js", "style.css"):
            shutil.copy(os.path.join(ROOT, f), site)

        httpd = serve(site)
        try:
            asyncio.run(run(site, private, (codes[0], codes[1], codes[2])))
        finally:
            httpd.shutdown()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print("Locked modules: " + ("all passed" if not fails else "%d FAILED" % len(fails)))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
