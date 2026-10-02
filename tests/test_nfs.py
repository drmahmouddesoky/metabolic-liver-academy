#!/usr/bin/env python3
"""
NFS calculator check. Run before changing the calculator:

  python3 -m http.server 8765 &        (from the repo folder)
  python3 tests/test_nfs.py
"""
import asyncio, sys
from playwright.async_api import async_playwright

URL = "http://localhost:8765/academy.html"

def nfs(age, wt, ht, dm, ast, alt, plt, alb_gdl):
    bmi = wt / (ht / 100) ** 2
    return -1.675 + 0.037 * age + 0.094 * bmi + 1.13 * dm + 0.99 * ast / alt - 0.013 * plt - 0.66 * alb_gdl

# (age, kg, cm, diabetes, AST, ALT, platelets, albumin value, unit, expected label)
CASES = [
    (55, 90, 170, 1, 40, 35, 200, 4.2, "gdL", "Indeterminate"),   # worked example, 0.18
    (55, 90, 170, 1, 40, 35, 200, 42, "gL", "Indeterminate"),     # same, albumin in g/L
    (40, 70, 175, 0, 25, 30, 280, 4.6, "gdL", "Low risk"),        # -3.90
    (62, 105, 165, 1, 70, 40, 110, 3.5, "gdL", "High risk"),      # 3.37
    (70, 80, 170, 0, 30, 30, 220, 4.2, "gdL", "Low risk"),        # -1.12: low (65+ cut-off 0.12)
    (64, 80, 170, 0, 30, 30, 220, 4.2, "gdL", "Indeterminate"),   # -1.34: under 65 uses -1.455
    (60, 80, 170, 0, 30, 30, 220, 4.2, "gdL", "Low risk"),        # -1.49: just under -1.455
]

async def main():
    fails = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(URL)
        await pg.click('label:has(input[data-consent="nfs-fields"])')
        for age, wt, ht, dm, ast, alt, plt, alb, unit, want in CASES:
            for k, v in (("n-age", age), ("n-wt", wt), ("n-ht", ht), ("n-ast", ast), ("n-alt", alt), ("n-plt", plt), ("n-alb", alb)):
                await pg.fill("#" + k, str(v))
            await pg.select_option("#n-dm", str(dm)); await pg.select_option("#n-alb-unit", unit)
            await pg.click("#nfs-form button[type=submit]")
            txt = await pg.inner_text("#nfs-result")
            expect = nfs(age, wt, ht, dm, ast, alt, plt, alb / 10 if unit == "gL" else alb)
            ok = want.lower() in txt.lower() and ("%.2f" % expect) in txt
            fails += not ok
            print("OK  " if ok else "FAIL", age, wt, ht, dm, ast, alt, plt, alb, unit, "score %.2f" % expect, "->", want)
        await b.close()
    print("FAILED" if fails else "ALL PASSED"); sys.exit(1 if fails else 0)

asyncio.run(main())
