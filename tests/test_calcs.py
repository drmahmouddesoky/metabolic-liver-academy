#!/usr/bin/env python3
"""
Calculator hub check. Each formula is re-written here from the original
paper and compared with what the page shows. Run before changing calc.js:

  python3 -m http.server 8765 &        (from the repo folder)
  python3 tests/test_calcs.py

Needs Python Playwright (pip install playwright).
"""
import asyncio, math, os, sys
from playwright.async_api import async_playwright

URL = "http://localhost:8765/calculators.html"
lg = lambda x: 1 / (1 + math.exp(-x))
bmi = lambda w, h: w / (h / 100) ** 2

def agile3(lsm, ast, alt, plt, dm, sex, age):   # Sanyal 2023
    return lg(-3.92368 + 2.29714 * math.log(lsm) - 0.00902 * plt - 0.98633 * (alt / ast) + 1.08636 * dm - 0.38581 * sex + 0.03018 * age)

def agile4(lsm, ast, alt, plt, dm, sex):        # Sanyal 2023
    return lg(7.50139 - 15.42498 / math.sqrt(lsm) - 0.01378 * plt - 1.41149 * (alt / ast) - 0.53281 * sex + 0.41741 * dm)

def fast(lsm, cap, ast):                        # Newsome 2020
    return lg(-1.65 + 1.07 * math.log(lsm) + 2.66e-8 * cap ** 3 - 63.3 / ast)

def fli(w, h, waist, tg, ggt):                  # Bedogni 2006, TG in mg/dL
    return 100 * lg(0.953 * math.log(tg) + 0.139 * bmi(w, h) + 0.718 * math.log(ggt) + 0.053 * waist - 15.745)

def hsi(alt, ast, w, h, sex, dm):               # Lee 2010
    return 8 * alt / ast + bmi(w, h) + (2 if sex == 0 else 0) + (2 if dm == 1 else 0)

# (calculator id, {field: value or (value, unit)}, expected score text, expected words in result)
CASES = [
    ("agile3", dict(lsm=15, ast=50, alt=50, plt=180, dm="1", sex="0", age=60), "%.3f" % agile3(15, 50, 50, 180, 1, 0, 60), "likely"),
    ("agile3", dict(lsm=5.5, ast=25, alt=40, plt=260, dm="0", sex="1", age=45), "%.3f" % agile3(5.5, 25, 40, 260, 0, 1, 45), "unlikely"),
    ("agile4", dict(lsm=25, ast=60, alt=40, plt=110, dm="1", sex="1"), "%.3f" % agile4(25, 60, 40, 110, 1, 1), "likely"),
    ("fast", dict(lsm=12, cap=320, ast=45), "%.2f" % fast(12, 320, 45), ""),
    ("fli", dict(wt=95, ht=170, waist=105, tg=200, ggt=60), "%.0f" % fli(95, 170, 105, 200, 60), "likely"),
    ("fli", dict(wt=95, ht=170, waist=105, tg=(200 / 88.57, "mmol"), ggt=60), "%.0f" % fli(95, 170, 105, 200, 60), "likely"),
    ("hsi", dict(alt=60, ast=40, wt=90, ht=170, sex="0", dm="1"), "%.1f" % hsi(60, 40, 90, 170, 0, 1), "likely"),
    ("homa", dict(glu=6.0, ins=15), "4.0", "insulin resistance"),
    ("homa", dict(glu=(108, "mg"), ins=15), "4.0", "insulin resistance"),
    ("body", dict(wt=80, ht=175, waistOpt=95), "0.54", "increased"),
    ("scan", dict(lsm=9.5, capOpt=300), "9.5 kPa", "Grey zone"),
    ("scan", dict(lsm=17, pltOpt=170), "17.0 kPa", "can be avoided"),
]

async def main():
    fails = 0
    async with async_playwright() as p:
        exe = os.environ.get("CHROME")
        b = await (p.chromium.launch(executable_path=exe) if exe else p.chromium.launch())
        pg = await b.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL)
        await pg.check("#calc-ok")
        for cid, vals, want, words in CASES:
            await pg.reload(); await pg.check("#calc-ok")
            for k, v in vals.items():
                sel = "#%s-%s" % (cid, k)
                if isinstance(v, tuple):
                    await pg.fill(sel, str(v[0])); await pg.select_option(sel + "-u", v[1])
                elif isinstance(v, str):
                    await pg.select_option(sel, v)
                else:
                    await pg.fill(sel, str(v))
            await pg.click("#%s-form button[type=submit]" % cid)
            score = (await pg.inner_text("#%s-result .score" % cid)).strip()
            text = await pg.inner_text("#%s-result" % cid)
            ok = score == want and words.lower() in text.lower()
            fails += not ok
            print(("ok  " if ok else "FAIL"), cid, "shown", score, "expected", want)
        if errs:
            fails += 1; print("page errors:", errs)
        await b.close()
    print("all passed" if not fails else "%d failed" % fails)
    sys.exit(1 if fails else 0)

asyncio.run(main())
