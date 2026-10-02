#!/usr/bin/env python3
"""
FIB-4 calculator check. Run before changing the calculator:

  python3 -m http.server 8765 &        (from the repo folder)
  python3 tests/test_fib4.py

Needs Python Playwright (pip install playwright).
"""
import asyncio, math, sys
from playwright.async_api import async_playwright

URL = "http://localhost:8765/academy.html"

def fib4(age, ast, alt, plt):
    return age * ast / (plt * math.sqrt(alt))

# (age, AST, ALT, platelets, expected label)
CASES = [
    (55, 40, 35, 200, "Indeterminate"),           # worked example on the method page, 1.86
    (50, 20, 25, 250, "Low risk"),                # 0.80
    (60, 80, 40, 120, "High risk"),               # 6.32
    (70, 30, 25, 250, "Low risk"),                # 1.68: low because the 65+ cut-off is 2.0
    (64, 30, 25, 250, "Indeterminate"),           # 1.54: under 65 uses 1.3
]
# edge values: platelets chosen so the score lands exactly on a cut-off
EDGES = [(1.29, "Low risk"), (1.30, "Indeterminate"), (2.66, "Indeterminate"), (2.67, "High risk")]

async def main():
    fails = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.goto(URL)
        await pg.click('label:has(input[data-consent="fib4-fields"])')
        async def run(age, ast, alt, plt):
            await pg.fill("#f-age", str(age)); await pg.fill("#f-ast", str(ast))
            await pg.fill("#f-alt", str(alt)); await pg.fill("#f-plt", repr(plt))
            await pg.click("#fib4-form button[type=submit]")
            return await pg.inner_text("#fib4-result")
        for age, ast, alt, plt, want in CASES:
            txt = await run(age, ast, alt, plt)
            ok = want.lower() in txt.lower()
            fails += not ok
            print("OK  " if ok else "FAIL", age, ast, alt, plt, "score %.2f" % fib4(age, ast, alt, plt), "->", want)
        for score, want in EDGES:
            age, ast, alt = 50, 30, 36            # sqrt(36) = 6
            plt = age * ast / (score * 6) * (1 - 1e-9)   # score lands a hair above the edge value
            txt = await run(age, ast, alt, plt)
            ok = want.lower() in txt.lower()
            fails += not ok
            print("OK  " if ok else "FAIL", "edge", score, "->", want)
        await b.close()
    print("FAILED" if fails else "ALL PASSED")
    sys.exit(1 if fails else 0)

asyncio.run(main())
