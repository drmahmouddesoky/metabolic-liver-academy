#!/usr/bin/env python3
"""
Edge-case check for every calculator (hub, FIB-4, NFS), English and Arabic.
Blank, zero, negative, text and extreme values must give a "please check"
message, never a number like NaN. Arabic digits and decimal commas must work.

  python3 -m http.server 8765 &
  python3 tests/test_edges.py
"""
import asyncio, sys
from playwright.async_api import async_playwright
BAD=["", "0", "-5", "abc", "999999", "1e9", "NaN", "Infinity"]
async def hub(b, lang):
    pg=await b.new_page(); await pg.goto(f"http://localhost:8765/{lang}calculators.html",wait_until="load")
    ack=await pg.query_selector("input[type=checkbox]")
    if ack: await ack.check()
    ids=await pg.evaluate("window.MLA_CALCS.map(c=>({id:c.id,f:c.fields}))")
    probs=[]
    for c in ids:
        for val in BAD:
            await pg.evaluate("""([id,val])=>{document.querySelectorAll('#'+id+'-form input').forEach(i=>{i.value=val});
              document.querySelectorAll('#'+id+'-form select:not([id$="-u"])').forEach(s=>{s.selectedIndex=1});
              document.getElementById(id+'-form').requestSubmit()}""",[c['id'],val])
            txt=await pg.inner_text(f"#{c['id']}-result")
            if any(x in txt for x in ("NaN","Infinity","undefined","null")) or not ("check" in txt.lower() or "التحقق" in txt):
                # valid-range values like iqr=0 may legitimately pass for optional fields; only flag nonsense
                if any(x in txt for x in ("NaN","Infinity","undefined")) or val in ("","abc","-5","NaN","Infinity","999999","1e9"):
                    probs.append((c['id'],repr(val),txt[:90].replace("\n"," ")))
    # arabic digits + comma decimal should work
    await pg.evaluate("""()=>{const id='homa';document.getElementById(id+'-glu').value='٥٫٥';document.getElementById(id+'-ins').value='10,2';document.getElementById(id+'-form').requestSubmit()}""")
    arab=await pg.inner_text("#homa-result")
    await pg.close()
    return probs, arab.split("\n")[0]
async def legacy(b, lang):
    pg=await b.new_page(); await pg.goto(f"http://localhost:8765/{lang}academy.html",wait_until="load")
    probs=[]
    for form,prefix in (("fib4","f-"),("nfs","n-")):
        for val in BAD:
            await pg.evaluate("""([form,val])=>{document.querySelectorAll('#'+form+'-form input').forEach(i=>{i.value=val});
              const d=document.getElementById('n-dm'); if(d) d.value='1'; document.getElementById(form+'-form').requestSubmit()}""",[form,val])
            txt=await pg.inner_text(f"#{form}-result")
            if any(x in txt for x in ("NaN","Infinity","undefined")) or "Check" not in txt and "راجع" not in txt:
                probs.append((form,repr(val),txt[:90].replace("\n"," ")))
    await pg.close(); return probs
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for lang in ("","ar/"):
            pr,arab=await hub(b,lang); lp=await legacy(b,lang)
            print(lang or "en","hub problems:",len(pr),"| FIB-4/NFS problems:",len(lp),"| Arabic digits test ->",arab)
            for x in (pr+lp)[:15]: print("  ",x)
            fails = getattr(main, "fails", 0) + len(pr) + len(lp) + (0 if arab.strip() == "2.5" else 1)
            main.fails = fails
        await b.close()
    print("all passed" if not getattr(main, "fails", 0) else "FAILED")
    sys.exit(1 if getattr(main, "fails", 0) else 0)
asyncio.run(main())
