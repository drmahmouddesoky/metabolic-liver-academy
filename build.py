#!/usr/bin/env python3
"""
Build the Metabolic Liver Academy site.

  src/*.html          bilingual page sources (English + Arabic side by side)
  content/learn.py    patient Q&A library (English + Arabic)
  content/ref.py      physician reference library (English + Arabic)

Output (what GitHub Pages serves):
  *.html, learn/*.html, ref/*.html     English pages
  ar/...                              Arabic pages (right-to-left)
  sitemap.xml, robots.txt

Run:  python3 build.py
"""
import html as H
import os
import re
import sys
from bs4 import BeautifulSoup, Comment

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://drmahmouddesoky.github.io/metabolic-liver-academy/"
sys.path.insert(0, os.path.join(ROOT, "content"))
import learn as L  # noqa: E402
import ref as R  # noqa: E402
import modules as M  # noqa: E402

LANGS = ("en", "ar")
OTHER = {"en": "ar", "ar": "en"}
SKIP = re.compile(r"^(https?:|mailto:|tel:|#|data:|//|javascript:)")


def bi(en, ar, tag="span"):
    return '<%s data-lang="en">%s</%s><%s data-lang="ar">%s</%s>' % (tag, en, tag, tag, ar, tag)


def esc(s):
    return H.escape(s, quote=False)


# ------------------------------------------------------------------ head
HEAD_T = """<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title data-title-en="{t_en}" data-title-ar="{t_ar}">{t_en}</title>
<meta name="description" content="{d_en}" data-ar="{d_ar}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34'%3E%3Crect x='1' y='5' width='5.2' height='24' rx='2.6' fill='%233E9C7B'/%3E%3Crect x='7.7' y='5' width='5.2' height='24' rx='2.6' fill='%2394B95A'/%3E%3Crect x='14.4' y='5' width='5.2' height='24' rx='2.6' fill='%23E0B43C'/%3E%3Crect x='21.1' y='5' width='5.2' height='24' rx='2.6' fill='%23D97B3A'/%3E%3Crect x='27.8' y='5' width='5.2' height='24' rx='2.6' fill='%23A3423E'/%3E%3C/svg%3E">
<link rel="stylesheet" href="{up}fonts/fonts.css">
<link rel="stylesheet" href="{up}style.css">
{extra_head}</head>
<body data-page="{page}" data-root="{up}">
<main id="main">
"""
class _Head(str):
    def format(self, **kw):
        kw.setdefault("extra_head", "")
        return str.format(self, **kw)


HEAD = _Head(HEAD_T)
FOOT = """
</main>
<script src="{up}main.js"></script>
</body>
</html>
"""


def cat_name(key):
    return dict(L.CATEGORIES)[key]


def item_by_slug():
    return {i["slug"]: i for i in L.ITEMS}


REPO = "https://github.com/drmahmouddesoky/metabolic-liver-academy"


def page_record(mod, slug, src_file):
    rev = mod.REVIEWED.get(slug)
    ver = mod.VERSIONS.get(slug, "1.0")
    rv_en = "Reviewed by Dr. Mahmoud Desoky on %s" % rev if rev else "Pending"
    rv_ar = "راجعها د. محمود الدسوقي بتاريخ %s" % rev if rev else "قيد الإنجاز"
    hist = "%s/commits/main/%s" % (REPO, src_file)
    rows = [
        (("Written by", "إعداد"), ("Dr. Mahmoud Desoky, Founder and Director", "د. محمود الدسوقي، المؤسس والمدير")),
        (("Medical review", "المراجعة الطبية"), (rv_en, rv_ar)),
        (("Version", "الإصدار"), (ver, ver)),
        (("Last updated", "آخر تحديث"), (mod.UPDATED, mod.UPDATED)),
        (("Next review due", "موعد المراجعة القادمة"), (mod.NEXT_REVIEW, mod.NEXT_REVIEW)),
    ]
    out = ['<aside class="record small" aria-label="Page record"><h2 class="h-small">%s</h2><dl>' % bi("Page record", "سجل الصفحة")]
    for k, v in rows:
        out.append("<dt>%s</dt><dd>%s</dd>" % (bi(*k), bi(esc(v[0]), esc(v[1]))))
    out.append("</dl><p>%s</p></aside>" % bi(
        '<a href="%s" target="_blank" rel="noopener">See every change to this content (public history)</a> · <a href="../legal.html#governance">How we review content</a>' % hist,
        '<a href="%s" target="_blank" rel="noopener">اطّلع على كل تعديل في هذا المحتوى (سجل علني)</a> · <a href="../legal.html#governance">كيف نراجع المحتوى</a>' % hist))
    return "".join(out)


# ------------------------------------------------------------------ Q&A pages
def learn_page(it):
    by = item_by_slug()
    c = cat_name(it["cat"])
    out = [HEAD.format(
        t_en=esc(it["q"]["en"]) + " | Metabolic Liver Academy",
        t_ar=esc(it["q"]["ar"]) + " | أكاديمية الكبد الأيضي",
        d_en=esc(it["short"]["en"]), d_ar=esc(it["short"]["ar"]), up="../", page="learn")]
    out.append('<header class="page-head"><div class="wrap read">')
    out.append('<nav class="crumbs small" aria-label="Breadcrumb"><a href="../learn.html">%s</a> › <a href="../learn.html#%s">%s</a></nav>'
               % (bi("Patient Q&amp;A", "أسئلة وأجوبة للمرضى"), it["cat"], bi(esc(c["en"]), esc(c["ar"]))))
    out.append("<h1>%s</h1>" % bi(esc(it["q"]["en"]), esc(it["q"]["ar"])))
    out.append("</div></header>")
    out.append('<article class="section"><div class="wrap read">')
    out.append('<div class="shortbox"><p class="small"><strong>%s</strong></p><p>%s</p></div>'
               % (bi("In short", "باختصار"), bi(esc(it["short"]["en"]), esc(it["short"]["ar"]))))
    for en, ar in zip(it["body"]["en"], it["body"]["ar"]):
        out.append("<p>%s</p>" % bi(esc(en), esc(ar)))
    if it.get("bullets"):
        out.append('<ul class="ticks">')
        for en, ar in zip(it["bullets"]["en"], it["bullets"]["ar"]):
            out.append("<li>%s</li>" % bi(esc(en), esc(ar)))
        out.append("</ul>")
    if it.get("see"):
        out.append('<h2 class="h-small">%s</h2><ul class="qlist">' % bi("Related questions", "أسئلة ذات صلة"))
        for s in it["see"]:
            r = by[s]
            out.append('<li><a href="%s.html">%s</a></li>' % (s, bi(esc(r["q"]["en"]), esc(r["q"]["ar"]))))
        out.append("</ul>")
    out.append('<h2 class="h-small">%s</h2><ol class="pubs small" lang="en" dir="ltr">' % bi("Sources", "المصادر"))
    for k in it["src"]:
        text, url = L.SOURCES[k]
        out.append('<li>%s <a href="%s" target="_blank" rel="noopener">Link</a></li>' % (esc(text), url))
    out.append("</ol>")
    out.append('<p class="fine">%s</p>' % bi(
        "Last updated %s. Based on international and Saudi guidelines. Education only: it does not replace your doctor. <a href=\"../legal.html#disclaimer\">Read the disclaimer</a>." % L.UPDATED,
        "آخر تحديث %s. مبني على الإرشادات الدولية والسعودية. للتثقيف فقط ولا يغني عن طبيبك. <a href=\"../legal.html#disclaimer\">اقرأ إخلاء المسؤولية</a>." % L.UPDATED))
    out.append(page_record(L, it["slug"], "content/learn.py"))
    out.append("</div></article>")
    out.append(FOOT.format(up="../"))
    return "".join(out)


def learn_index():
    out = [HEAD.format(
        t_en="Patient Q&amp;A on fatty liver | Metabolic Liver Academy",
        t_ar="أسئلة وأجوبة عن الكبد الدهني | أكاديمية الكبد الأيضي",
        d_en="Plain answers to %d common questions about fatty liver (MASLD and MASH), based on international and Saudi guidelines." % len(L.ITEMS),
        d_ar="إجابات مبسطة عن %d سؤالًا شائعًا حول الكبد الدهني، مبنية على الإرشادات الدولية والسعودية." % len(L.ITEMS),
        up="", page="learn")]
    out.append('<header class="page-head"><div class="wrap">')
    out.append("<h1>%s</h1>" % bi("Patient questions and answers", "أسئلة وأجوبة للمرضى"))
    out.append("<p>%s</p>" % bi(
        "%d short answers to the questions patients ask most, in plain words. Each answer lists the official guidelines it is based on." % len(L.ITEMS),
        "%d إجابة قصيرة عن أكثر الأسئلة التي يطرحها المرضى، بكلمات بسيطة، وتذكر كل إجابة الإرشادات الرسمية التي اعتمدت عليها." % len(L.ITEMS)))
    out.append("</div></header>")
    out.append('<section class="section"><div class="wrap">')
    out.append('<div class="field searchbox"><label for="q-search">%s</label><input id="q-search" type="search" autocomplete="off"></div>'
               % bi("Search the questions", "ابحث في الأسئلة"))
    out.append('<p id="q-none" class="empty" hidden>%s</p>' % bi("No question matches. Try another word.", "لا يوجد سؤال مطابق. جرّب كلمة أخرى."))
    out.append('<div class="qgrid">')
    for key, name in L.CATEGORIES:
        out.append('<section class="qcat" id="%s"><h2 class="h-small">%s</h2><ul class="qlist">' % (key, bi(esc(name["en"]), esc(name["ar"]))))
        for it in [i for i in L.ITEMS if i["cat"] == key]:
            out.append('<li><a href="learn/%s.html">%s</a></li>' % (it["slug"], bi(esc(it["q"]["en"]), esc(it["q"]["ar"]))))
        out.append("</ul></section>")
    out.append("</div>")
    out.append('<div class="panel" style="margin-top:32px"><h2 class="h-small">%s</h2><p class="muted small">%s</p><ul class="plain" lang="en" dir="ltr">'
               % (bi("Official organisations", "الجهات الرسمية"),
                  bi("Our answers follow guidance from these societies and patient charities. Visit them for more.",
                     "تتبع إجاباتنا إرشادات هذه الجمعيات والجمعيات الخيرية للمرضى. زرها لمزيد من المعلومات.")))
    for name, url in L.ORGS:
        out.append('<li><a href="%s" target="_blank" rel="noopener">%s</a></li>' % (url, esc(name)))
    out.append("</ul></div>")
    out.append("""<script>
(function () {
  var box = document.getElementById('q-search'), none = document.getElementById('q-none');
  box.addEventListener('input', function () {
    var q = box.value.trim().toLowerCase(), any = false;
    document.querySelectorAll('.qcat').forEach(function (cat) {
      var shown = 0;
      cat.querySelectorAll('li').forEach(function (li) {
        var ok = !q || li.textContent.toLowerCase().indexOf(q) > -1;
        li.hidden = !ok; if (ok) shown++;
      });
      cat.hidden = !shown; if (shown) any = true;
    });
    none.hidden = any;
  });
})();
</script>""")
    out.append("</div></section>")
    out.append(FOOT.format(up=""))
    return "".join(out)


# ------------------------------------------------------------------ physician reference library
def all_sources():
    d = dict(L.SOURCES)
    d.update(R.SOURCES)
    d.update(M.SOURCES)
    return d


def cell(c):
    if isinstance(c, tuple):
        return bi(esc(c[0]), esc(c[1]))
    return '<span dir="ltr">%s</span>' % esc(c)


def pair(p, tag="span"):
    return bi(esc(p[0]), esc(p[1]), tag)


def ref_page(pg):
    by = {p["slug"]: p for p in R.PAGES}
    g = dict(R.GROUPS)[pg["group"]]
    src = all_sources()
    out = [HEAD.format(
        t_en=esc(pg["title"]["en"]) + " | MLA Reference",
        t_ar=esc(pg["title"]["ar"]) + " | مرجع أكاديمية الكبد الأيضي",
        d_en=esc(pg["lead"]["en"]), d_ar=esc(pg["lead"]["ar"]), up="../", page="ref")]
    out.append('<header class="page-head"><div class="wrap read">')
    out.append('<nav class="crumbs small" aria-label="Breadcrumb"><a href="../ref.html">%s</a> › <a href="../ref.html#%s">%s</a></nav>'
               % (bi("Doctors&#39; reference", "مرجع الأطباء"), pg["group"], bi(esc(g["en"]), esc(g["ar"]))))
    out.append("<h1>%s</h1>" % bi(esc(pg["title"]["en"]), esc(pg["title"]["ar"])))
    out.append("<p>%s</p>" % bi(esc(pg["lead"]["en"]), esc(pg["lead"]["ar"])))
    out.append('<p class="tag pro">%s</p>' % bi("For healthcare professionals", "للعاملين في المجال الصحي"))
    out.append("</div></header>")
    out.append('<article class="section"><div class="wrap read">')
    out.append('<div class="shortbox"><p class="small"><strong>%s</strong></p><ul class="ticks">' % bi("Key points", "النقاط الأساسية"))
    for k in pg["key"]:
        out.append("<li>%s</li>" % pair(k))
    out.append("</ul></div>")
    for sec in pg["sections"]:
        out.append("<h2>%s</h2>" % pair(sec["h"]))
        for p in sec.get("p", []):
            out.append("<p>%s</p>" % pair(p))
        if sec.get("ul"):
            out.append('<ul class="ticks">' + "".join("<li>%s</li>" % pair(x) for x in sec["ul"]) + "</ul>")
        t = sec.get("table")
        if t:
            out.append('<div class="table-wrap"><table class="ref-table"><thead><tr>')
            out.append("".join('<th scope="col">%s</th>' % cell(c) for c in t["head"]))
            out.append("</tr></thead><tbody>")
            for row in t["rows"]:
                out.append("<tr>" + "".join(('<th scope="row">%s</th>' if i == 0 else "<td>%s</td>") % cell(c) for i, c in enumerate(row)) + "</tr>")
            out.append("</tbody></table></div>")
        if sec.get("note"):
            out.append('<p class="fine">%s</p>' % pair(sec["note"]))
    if pg.get("see"):
        out.append('<h2 class="h-small">%s</h2><ul class="qlist">' % bi("Related topics", "موضوعات ذات صلة"))
        for s_ in pg["see"]:
            out.append('<li><a href="%s.html">%s</a></li>' % (s_, bi(esc(by[s_]["title"]["en"]), esc(by[s_]["title"]["ar"]))))
        out.append("</ul>")
    out.append('<h2 class="h-small">%s</h2><ol class="pubs small" lang="en" dir="ltr">' % bi("References", "المراجع"))
    for k in pg["src"]:
        text, url = src[k]
        out.append('<li>%s <a href="%s" target="_blank" rel="noopener">Link</a></li>' % (esc(text), url))
    out.append("</ol>")
    out.append('<p class="fine">%s</p>' % bi(
        "Last updated %s. A summary of published guidelines for healthcare professionals. It does not replace clinical judgement, the full guidelines or local drug labels. <a href=\"../legal.html#disclaimer\">Read the disclaimer</a>." % R.UPDATED,
        "آخر تحديث %s. ملخص للإرشادات المنشورة موجّه للعاملين في المجال الصحي، ولا يغني عن التقدير السريري أو الإرشادات الكاملة أو نشرات الأدوية المحلية. <a href=\"../legal.html#disclaimer\">اقرأ إخلاء المسؤولية</a>." % R.UPDATED))
    out.append(page_record(R, pg["slug"], "content/ref.py"))
    out.append("</div></article>")
    out.append(FOOT.format(up="../"))
    return "".join(out)


def ref_index():
    out = [HEAD.format(
        t_en="Doctors&#39; reference library on MASLD and MASH | Metabolic Liver Academy",
        t_ar="مرجع الأطباء عن الكبد الدهني | أكاديمية الكبد الأيضي",
        d_en="Guideline-based summaries for clinicians: diagnosis, fibrosis tests, drugs, cirrhosis care, follow-up and special groups.",
        d_ar="ملخصات مبنية على الإرشادات للأطباء: التشخيص، وفحوص التليّف، والأدوية، ورعاية التشمّع، والمتابعة، والفئات الخاصة.",
        up="", page="ref")]
    out.append('<header class="page-head"><div class="wrap">')
    out.append("<h1>%s</h1>" % bi("Doctors&#39; reference library", "مرجع الأطباء"))
    out.append("<p>%s</p>" % bi(
        "Short, practical summaries of the main MASLD and MASH guidelines, with cut-offs, tables and references. For healthcare professionals.",
        "ملخصات قصيرة وعملية لأهم إرشادات الكبد الدهني والتهابه، مع الحدود والجداول والمراجع. للعاملين في المجال الصحي."))
    out.append("</div></header>")
    out.append('<section class="section"><div class="wrap"><div class="grid three">')
    for key, name in R.GROUPS:
        out.append('<section class="panel" id="%s"><h2 class="h-small">%s</h2><ul class="qlist">' % (key, pair((name["en"], name["ar"]))))
        for pg in [p for p in R.PAGES if p["group"] == key]:
            out.append('<li><a href="ref/%s.html">%s</a><br><span class="muted small">%s</span></li>'
                       % (pg["slug"], pair((pg["title"]["en"], pg["title"]["ar"])), pair((pg["lead"]["en"], pg["lead"]["ar"]))))
        out.append("</ul></section>")
    out.append("</div>")
    out.append('<div class="panel" style="margin-top:32px"><h2 class="h-small">%s</h2><p class="muted small">%s</p><ul class="plain" lang="en" dir="ltr">'
               % (bi("Guidelines we follow", "الإرشادات التي نعتمد عليها"),
                  bi("Read the full guidelines before making decisions. Links open the official publication.",
                     "اقرأ الإرشادات كاملة قبل اتخاذ القرار. تفتح الروابط النشر الرسمي.")))
    src = all_sources()
    for k in ("easl2024", "aasld2023", "resm2024", "aga2021", "aace2022", "apasl2025", "china2024", "egypt2022", "delphi2023", "global2025", "global2026", "saudi2026", "baveno7", "nit2021", "peds2025"):
        text, url = src[k]
        out.append('<li><a href="%s" target="_blank" rel="noopener">%s</a></li>' % (url, esc(text)))
    out.append("</ul></div>")
    out.append('<p class="fine">%s</p>' % bi(
        "Last updated %s. Summaries only; they do not replace clinical judgement or the full guidelines." % R.UPDATED,
        "آخر تحديث %s. ملخصات فقط، ولا تغني عن التقدير السريري أو الإرشادات الكاملة." % R.UPDATED))
    out.append("</div></section>")
    out.append(FOOT.format(up=""))
    return "".join(out)


# ------------------------------------------------------------------ teaching modules
CITE = re.compile(r"\[\[([\w,\s]+)\]\]")
GRADE = {
    "strong": ("Strong recommendation", "توصية قوية"),
    "weak": ("Weak recommendation", "توصية ضعيفة"),
    "open": ("Open recommendation", "توصية مفتوحة"),
}
CONS = {"strong": ("Strong consensus", "إجماع قوي"), "consensus": ("Consensus", "إجماع")}


def module_page(mod):
    src = all_sources()
    order = []

    def note(keys):
        for k in keys:
            k = k.strip()
            if k not in src:
                raise KeyError("unknown source " + k)
            if k not in order:
                order.append(k)

    for b in mod["blocks"]:
        for txt in [x for x in b[1:] if isinstance(x, tuple)]:
            for m in CITE.finditer(txt[0]):
                note(m.group(1).split(","))
        if b[0] == "rec":
            note([b[5]])

    def cites(txt):
        def sub(m):
            nums = [order.index(k.strip()) + 1 for k in m.group(1).split(",")]
            return '<sup class="cite">[%s]</sup>' % ",".join('<a href="#ref-%d">%d</a>' % (n, n) for n in nums)
        return CITE.sub(sub, esc(txt))

    def pc(p, tag="span"):
        return bi(cites(p[0]), cites(p[1]), tag)

    def cell(c):
        return bi(esc(c[0]), esc(c[1])) if isinstance(c, tuple) else '<span dir="ltr">%s</span>' % esc(c)

    toc, body = [], []
    n = 0
    for b in mod["blocks"]:
        kind = b[0]
        if kind == "h2":
            n += 1
            toc.append('<li><a href="#%s">%s</a></li>' % (b[2], bi(esc(b[1][0]), esc(b[1][1]))))
            body.append('<h2 id="%s"><span class="num">%d</span>%s</h2>' % (b[2], n, bi(esc(b[1][0]), esc(b[1][1]))))
        elif kind == "p":
            body.append("<p>%s</p>" % pc(b[1]))
        elif kind == "ul":
            body.append('<ul class="ticks">' + "".join("<li>%s</li>" % pc(x) for x in b[1]) + "</ul>")
        elif kind == "aside":
            body.append('<aside class="sidenote">%s</aside>' % pc(b[1]))
        elif kind == "rec":
            _, text, loe, strength, cons, key = b
            tags = ['<span class="g-loe">%s</span>' % bi("Evidence level %d" % loe, "مستوى الدليل %d" % loe)]
            if strength:
                tags.append("<span>%s</span>" % bi(*GRADE[strength]))
            tags.append("<span>%s</span>" % bi(*CONS[cons]))
            num = order.index(key) + 1
            body.append('<div class="rec"><p class="rec-tags"><a href="#grading">%s</a></p><p class="rec-text">%s <sup class="cite">[<a href="#ref-%d">%d</a>]</sup></p></div>'
                        % ("".join(tags), bi(esc(text[0]), esc(text[1])), num, num))
        elif kind == "table":
            t = b[1]
            body.append('<div class="table-wrap"><table class="ref-table"><caption>%s</caption><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (
                bi(esc(t["caption"][0]), esc(t["caption"][1])),
                "".join('<th scope="col">%s</th>' % cell(c) for c in t["head"]),
                "".join("<tr>" + "".join(('<th scope="row">%s</th>' if i == 0 else "<td>%s</td>") % cell(c) for i, c in enumerate(r)) + "</tr>" for r in t["rows"])))
        elif kind == "figure":
            body.append('<figure class="fig">%s<figcaption>%s</figcaption></figure>' % (M.FIGURES[b[1]], bi(esc(b[2][0]), esc(b[2][1]))))
        elif kind == "case":
            c = b[1]
            rows = "".join("<dt>%s</dt><dd>%s</dd>" % (bi(esc(l[0]), esc(l[1])), pc(t)) for l, t in c["parts"])
            body.append('<section class="case"><h3>%s</h3><dl>%s</dl></section>' % (bi(esc(c["title"][0]), esc(c["title"][1])), rows))
        elif kind == "mcq":
            items = []
            for i, q in enumerate(b[1], 1):
                opts = "".join('<button type="button" class="opt" data-i="%d">%s</button>' % (j, bi(esc(o[0]), esc(o[1]))) for j, o in enumerate(q["options"]))
                items.append('<div class="mcq" data-answer="%d"><p class="q"><span class="qn">%d.</span> %s</p><div class="opts">%s</div><p class="why" hidden>%s</p></div>'
                             % (q["answer"], i, bi(esc(q["q"][0]), esc(q["q"][1])), opts, bi(esc(q["why"][0]), esc(q["why"][1]))))
            body.append('<p class="muted small">%s</p>%s' % (bi("Choose an answer to see the explanation. Nothing is recorded.", "اختر إجابة لترى الشرح. لا يُسجَّل أي شيء."), "".join(items)))

    out = [HEAD.format(
        t_en=esc(mod["title"]["en"]) + " | MLA Teaching module",
        t_ar=esc(mod["title"]["ar"]) + " | وحدة تعليمية من أكاديمية الكبد الأيضي",
        d_en=esc(mod["subtitle"]["en"]), d_ar=esc(mod["subtitle"]["ar"]), up="../", page="academy",
        extra_head='<link rel="stylesheet" href="../fonts/serif.css">\n')]
    ver = M.VERSIONS.get(mod["slug"], "1.0")
    rev = M.REVIEWED.get(mod["slug"])
    out.append('<header class="mod-head"><div class="wrap">')
    out.append('<nav class="crumbs small" aria-label="Breadcrumb"><a href="../academy.html">%s</a> › <a href="../academy.html#modules">%s</a></nav>'
               % (bi("Physician Portal", "بوابة الأطباء"), bi("Teaching modules", "الوحدات التعليمية")))
    out.append('<p class="mod-no">%s</p>' % bi("Module %d" % mod["number"], "الوحدة %d" % mod["number"]))
    out.append("<h1>%s</h1>" % bi(esc(mod["title"]["en"]), esc(mod["title"]["ar"])))
    out.append('<p class="mod-sub">%s</p>' % bi(esc(mod["subtitle"]["en"]), esc(mod["subtitle"]["ar"])))
    meta = [
        (("Author", "المؤلف"), ("Mahmoud Desoky, MD", "د. محمود الدسوقي")),
        (("Medical review", "المراجعة الطبية"), ("Reviewed " + rev, "رُوجعت " + rev) if rev else ("Pending", "قيد الإنجاز")),
        (("For", "موجّهة إلى"), (mod["audience"]["en"], mod["audience"]["ar"])),
        (("Reading time", "مدة القراءة"), ("About %d minutes" % mod["minutes"], "نحو %d دقيقة" % mod["minutes"])),
        (("Version", "الإصدار"), ("%s, updated %s" % (ver, M.UPDATED), "%s، حُدّثت في %s" % (ver, M.UPDATED))),
    ]
    out.append('<dl class="mod-meta">' + "".join("<div><dt>%s</dt><dd>%s</dd></div>" % (bi(*k), bi(esc(v[0]), esc(v[1]))) for k, v in meta) + "</dl>")
    out.append("</div></header>")
    out.append('<div class="wrap mod-layout">')
    out.append('<nav class="mod-toc" aria-label="Contents"><p class="toc-title">%s</p><ol>%s<li><a href="#references">%s</a></li></ol></nav>'
               % (bi("Contents", "المحتويات"), "".join(toc), bi("References", "المراجع")))
    out.append('<article class="mod-body">')
    out.append('<section class="objectives"><h2 class="h-small">%s</h2><p>%s</p><ol>%s</ol>' % (
        bi("Learning objectives", "أهداف التعلّم"), bi("After this module you should be able to:", "بعد هذه الوحدة ستكون قادرًا على:"),
        "".join("<li>%s</li>" % bi(esc(o[0]), esc(o[1])) for o in mod["objectives"])))
    out.append('<p class="small" id="grading">%s</p></section>' % bi(
        "Boxed recommendations are paraphrased from the EASL–EASD–EASO 2024 guideline, with its grades: evidence level from 1 (strongest) to 5; recommendation strong, weak or open; consensus is the panel's agreement (strong means at least 95%).",
        "التوصيات المؤطّرة مُعاد صياغتها من إرشادات EASL–EASD–EASO لعام 2024 مع درجاتها: مستوى الدليل من 1 (الأقوى) إلى 5؛ والتوصية قوية أو ضعيفة أو مفتوحة؛ والإجماع هو مدى اتفاق اللجنة (القوي يعني 95% على الأقل)."))
    out.extend(body)
    out.append('<h2 id="references">%s</h2><ol class="pubs small refs" lang="en" dir="ltr">' % bi("References", "المراجع"))
    for i, k in enumerate(order, 1):
        text, url = src[k]
        out.append('<li id="ref-%d">%s <a href="%s" target="_blank" rel="noopener">%s</a></li>' % (i, esc(text), url, esc(url.replace("https://doi.org/", "doi:"))))
    out.append("</ol>")
    url = SITE + "modules/%s.html" % mod["slug"]
    out.append('<div class="cite-box"><h2 class="h-small">%s</h2><p lang="en" dir="ltr">Desoky M. %s. Metabolic Liver Academy, version %s. Updated %s. Available from: <a href="%s">%s</a></p></div>'
               % (bi("How to cite this module", "كيفية الاستشهاد بهذه الوحدة"), esc(mod["title"]["en"]), ver, M.UPDATED, url, url))
    out.append('<p class="fine">%s</p>' % bi(
        "For education only. This module summarises published evidence and guidelines; it does not replace clinical judgement, full guidelines or local drug labels. It is not accredited for CME credit. <a href=\"../legal.html#disclaimer\">Disclaimer</a>.",
        "للتعليم فقط. تلخّص هذه الوحدة الأدلة والإرشادات المنشورة، ولا تغني عن التقدير السريري أو الإرشادات الكاملة أو نشرات الأدوية المحلية، وهي غير معتمدة لساعات التعليم الطبي المستمر. <a href=\"../legal.html#disclaimer\">إخلاء المسؤولية</a>."))
    out.append(page_record(M, mod["slug"], "content/modules.py"))
    out.append("</article></div>")
    out.append(FOOT.format(up="../"))
    return "".join(out)


# ------------------------------------------------------------------ split one bilingual page
def split(src_html, rel, lang):
    """rel = output path relative to the language root, e.g. 'learn/biopsy.html'."""
    soup = BeautifulSoup(src_html, "html.parser")
    for el in soup.select('[data-lang="%s"]' % OTHER[lang]):
        el.decompose()
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    h = soup.html
    h["lang"] = lang
    h["dir"] = "rtl" if lang == "ar" else "ltr"
    t = soup.title
    if t is not None and t.get("data-title-" + lang):
        t.string = t["data-title-" + lang]
    if t is not None:
        for a in ("data-title-en", "data-title-ar"):
            if a in t.attrs:
                del t[a]
    d = soup.find("meta", attrs={"name": "description"})
    if d is not None:
        if lang == "ar" and d.get("data-ar"):
            d["content"] = d["data-ar"]
        if "data-ar" in d.attrs:
            del d["data-ar"]

    # Arabic pages live one folder deeper: shared files need "../"
    if lang == "ar":
        for tag, attr in (("link", "href"), ("script", "src"), ("img", "src"), ("a", "href")):
            for el in soup.find_all(tag):
                v = el.get(attr)
                if not v or SKIP.match(v):
                    continue
                path = v.split("#")[0].split("?")[0]
                if path.endswith(".html") or path == "":
                    continue  # page links stay inside the Arabic site
                el[attr] = "../" + v

    # language alternates + canonical
    head = soup.head
    url_en = SITE + rel
    url_ar = SITE + "ar/" + rel
    for hl, href in (("en", url_en), ("ar", url_ar)):
        head.append(soup.new_tag("link", rel="alternate", hreflang=hl, href=href))
    head.append(soup.new_tag("link", rel="alternate", hreflang="x-default", href=url_en))
    head.append(soup.new_tag("link", rel="canonical", href=url_ar if lang == "ar" else url_en))
    head.append(soup.new_tag("meta", property="og:locale", content="ar_SA" if lang == "ar" else "en_GB"))
    return str(soup)


def write(path, text):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full) or ROOT, exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(text)


def main():
    pages = {}
    for name in sorted(os.listdir(os.path.join(ROOT, "src"))):
        if name.endswith(".html"):
            with open(os.path.join(ROOT, "src", name), encoding="utf-8") as f:
                pages[name] = f.read()
    pages["learn.html"] = learn_index()
    for it in L.ITEMS:
        pages["learn/%s.html" % it["slug"]] = learn_page(it)
    for mod in M.MODULES:
        pages["modules/%s.html" % mod["slug"]] = module_page(mod)
    pages["ref.html"] = ref_index()
    for pg in R.PAGES:
        pages["ref/%s.html" % pg["slug"]] = ref_page(pg)

    for rel, src in pages.items():
        write(rel, split(src, rel, "en"))
        write("ar/" + rel, split(src, rel, "ar"))

    urls = []
    for rel in sorted(pages):
        loc = "" if rel == "index.html" else rel
        urls.append(
            "  <url><loc>%s%s</loc>"
            '<xhtml:link rel="alternate" hreflang="en" href="%s%s"/>'
            '<xhtml:link rel="alternate" hreflang="ar" href="%sar/%s"/></url>' % (SITE, loc, SITE, loc, SITE, loc))
        urls.append(
            "  <url><loc>%sar/%s</loc>"
            '<xhtml:link rel="alternate" hreflang="en" href="%s%s"/>'
            '<xhtml:link rel="alternate" hreflang="ar" href="%sar/%s"/></url>' % (SITE, loc, SITE, loc, SITE, loc))
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n'
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
          + "\n".join(urls) + "\n</urlset>\n")
    write("robots.txt", "User-agent: *\nAllow: /\nSitemap: %ssitemap.xml\n" % SITE)
    print("Built %d pages x 2 languages" % len(pages))


if __name__ == "__main__":
    main()
