"""
Site chrome: the header, main menu and footer that appear on every page.

build.py stamps these into each page before splitting it into English and
Arabic, so the menu is part of the page itself (it no longer pops in after
the page loads, which made the page jump).

To change the menu, edit MENU below and run:  python3 build.py
Each entry is  (English label, Arabic label, link)  or a group with "items".
"""
import os

# The founder's name as shown on the site. Change it here, then rebuild.
FOUNDER = {"en": "Dr. Mahmoud Al-Desoky", "ar": "د. محمود الدسوقي"}

CONTACT_EMAIL = "mdesoky15@gmail.com"
LINKEDIN = "https://www.linkedin.com/in/drmahmoudaldesoky"
YOUTUBE = "https://www.youtube.com/channel/UCNzyfqdKJP9BDp35L8eNxGA"
ORCID = "https://orcid.org/0000-0002-1422-0886"

MENU = [
    {"en": "Home", "ar": "الرئيسية", "href": "index.html", "key": "home"},
    {"en": "Patients", "ar": "المرضى", "key": "patients", "items": [
        ("Patient Portal", "بوابة المرضى", "patients.html"),
        ("Am I at risk?", "هل أنا معرّض للخطر؟", "patients.html#risk"),
        ("Questions and answers", "أسئلة وأجوبة", "learn.html"),
        ("Printable guides", "أدلة للطباعة", "guides.html"),
    ]},
    {"en": "Physicians", "ar": "الأطباء", "key": "physicians", "items": [
        ("Physician Portal", "بوابة الأطباء", "academy.html"),
        ("Teaching modules", "الوحدات التعليمية", "academy.html#modules"),
        ("Reference library", "المكتبة المرجعية", "ref.html"),
        ("Guidance", "الإرشادات", "guidance.html"),
        ("Calculators", "الحاسبات", "calculators.html"),
    ]},
    {"en": "Lectures", "ar": "المحاضرات", "href": "lectures.html", "key": "lectures"},
    {"en": "Meet the Expert", "ar": "لقاء مع خبير", "href": "experts.html", "key": "experts"},
    {"en": "Publication Radar", "ar": "رادار الأبحاث", "href": "radar.html", "key": "radar"},
    {"en": "News", "ar": "الأخبار", "href": "news.html", "key": "news"},
    {"en": "About", "ar": "من نحن", "key": "about", "items": [
        ("About the Academy", "عن الأكاديمية", "about.html"),
        ("Mission and values", "الرسالة والقيم", "about.html#mission"),
        ("Editorial policy", "السياسة التحريرية", "legal.html#governance"),
        ("Partners", "الشركاء", "partners.html"),
        ("Policies", "السياسات", "legal.html"),
    ]},
    {"en": "Contact", "ar": "تواصل معنا", "href": "contact.html", "key": "contact"},
]

# Which menu item is highlighted for each page (by file name or folder).
SECTION = {
    "index.html": "home",
    "patients.html": "patients", "learn.html": "patients", "learn/": "patients", "guides.html": "patients",
    "academy.html": "physicians", "modules/": "physicians", "ref.html": "physicians", "ref/": "physicians",
    "guidance.html": "physicians", "calculators.html": "physicians",
    "lectures.html": "lectures", "experts.html": "experts", "expert.html": "experts",
    "radar.html": "radar", "news.html": "news",
    "about.html": "about", "partners.html": "about", "legal.html": "about",
    "contact.html": "contact",
}


def bi(en, ar):
    return '<span data-lang="en">%s</span><span data-lang="ar">%s</span>' % (en, ar)


MARK = ('<svg class="brand-mark" viewBox="0 0 34 34" aria-hidden="true" focusable="false">'
        '<rect x="1" y="5" width="5.2" height="24" rx="2.6" fill="#3E9C7B"/>'
        '<rect x="7.7" y="5" width="5.2" height="24" rx="2.6" fill="#94B95A"/>'
        '<rect x="14.4" y="5" width="5.2" height="24" rx="2.6" fill="#E0B43C"/>'
        '<rect x="21.1" y="5" width="5.2" height="24" rx="2.6" fill="#D97B3A"/>'
        '<rect x="27.8" y="5" width="5.2" height="24" rx="2.6" fill="#A3423E"/></svg>')

ICON_MENU = ('<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" '
             'stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>')
ICON_CHEV = ('<svg class="nav-chev" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" '
             'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>')
# One button, two icons: CSS shows the moon in light mode and the sun in dark mode.
ICON_THEME = ('<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" '
              'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>'
              '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" '
              'stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/>'
              '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>')


def section_of(rel):
    if rel in SECTION:
        return SECTION[rel]
    folder = rel.split("/")[0] + "/" if "/" in rel else ""
    return SECTION.get(folder, "")


def header(rel):
    """Skip link, top bar (logo, theme switch, language switch) and main menu."""
    up = "../" * rel.count("/")
    here = section_of(rel)
    page = rel.split("#")[0]

    def link(en, ar, href, cls=""):
        cur = ' aria-current="page"' if href.split("#")[0] == page and "#" not in href else ""
        return '<a%s href="%s%s"%s>%s</a>' % (' class="%s"' % cls if cls else "", up, href, cur, bi(en, ar))

    items = []
    for i, m in enumerate(MENU):
        active = " is-active" if m["key"] == here else ""
        if "items" not in m:
            items.append('<li class="nav-item%s">%s</li>' % (active, link(m["en"], m["ar"], m["href"], "nav-top")))
            continue
        sub = "".join("<li>%s</li>" % link(en, ar, href) for en, ar, href in m["items"])
        items.append(
            '<li class="nav-item has-sub%s">'
            '<button type="button" class="nav-top nav-toggle" aria-expanded="false" aria-controls="nav-sub-%d">%s%s</button>'
            '<ul class="nav-sub" id="nav-sub-%d">%s</ul></li>' % (active, i, bi(m["en"], m["ar"]), ICON_CHEV, i, sub))

    lang_en = '<a class="lang-btn" href="%sar/%s" hreflang="ar" lang="ar">العربية</a>' % (up, rel)
    lang_ar = '<a class="lang-btn" href="%s../%s" hreflang="en" lang="en">English</a>' % (up, rel)
    return (
        '<a class="skip" href="#main">%s</a>\n'
        '<header class="site-header"><div class="bar">'
        '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">'
        '<span class="visually-hidden">%s</span>%s</button>'
        '<a class="brand" href="%sindex.html">%s<span class="brand-text">'
        '<span class="brand-name">%s</span><span class="brand-tag">%s</span></span></a>'
        '<div class="bar-tools">'
        '<button class="theme-btn" type="button" aria-pressed="false"><span class="visually-hidden">%s</span>%s</button>'
        '%s</div></div></header>\n'
        '<nav class="site-nav" id="site-nav" aria-label="%s">'
        '<button class="nav-close" type="button"><span class="visually-hidden">%s</span>'
        '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
        '<ul class="nav-list">%s</ul>'
        '<div class="side-install" hidden></div></nav>\n'
        '<div class="nav-shade" hidden></div>\n'
    ) % (
        bi("Skip to content", "انتقل إلى المحتوى"),
        bi("Menu", "القائمة"), ICON_MENU,
        up, MARK,
        bi("Metabolic Liver Academy", "أكاديمية الكبد والتمثيل الغذائي"),
        bi("Healthy liver. Healthy life.", "كبد سليم. حياة صحية."),
        bi("Dark mode", "الوضع الداكن"), ICON_THEME,
        bi(lang_en, lang_ar),
        "Main",
        bi("Close menu", "إغلاق القائمة"),
        "".join(items),
    )


def footer(rel):
    up = "../" * rel.count("/")

    def a(en, ar, href):
        return '<li><a href="%s%s">%s</a></li>' % (up, href, bi(en, ar))

    def ext(label, href):
        return '<li><a href="%s" target="_blank" rel="noopener">%s</a></li>' % (href, label)

    return (
        '<footer class="site-footer"><div class="wrap"><div class="foot-grid">'
        '<div class="foot-about"><p class="foot-brand">%s<strong>%s</strong></p>'
        '<p class="note">%s</p></div>'
        '<div><h2 class="foot-h">%s</h2><ul>%s%s%s%s%s</ul></div>'
        '<div><h2 class="foot-h">%s</h2><ul>%s%s%s%s</ul></div>'
        '<div><h2 class="foot-h">%s</h2><ul><li><a href="mailto:%s">%s</a></li>%s%s%s</ul></div>'
        '</div>'
        '<div class="bottom">© <span class="year">2026</span> %s</div>'
        '</div></footer>\n'
    ) % (
        MARK, bi("Metabolic Liver Academy", "أكاديمية الكبد والتمثيل الغذائي"),
        bi("Independent, free education on fatty liver disease (MASLD and MASH). Education only: this site does not give "
           "medical advice, diagnosis or treatment. Always talk to your own doctor about your health. In an emergency, "
           "call your local emergency number.",
           "تثقيف مستقل ومجاني عن مرض الكبد الدهني (MASLD وMASH). للتثقيف فقط: لا يقدّم هذا الموقع استشارة طبية أو "
           "تشخيصًا أو علاجًا. تحدّث دائمًا مع طبيبك عن صحتك. في الحالات الطارئة اتصل برقم الطوارئ المحلي."),
        bi("The Academy", "الأكاديمية"),
        a("About", "من نحن", "about.html"), a("Mission and values", "الرسالة والقيم", "about.html#mission"),
        a("Editorial policy", "السياسة التحريرية", "legal.html#governance"),
        a("Partners and independence", "الشركاء والاستقلالية", "partners.html"),
        a("Contact", "تواصل معنا", "contact.html"),
        bi("Policies", "السياسات"),
        a("Disclaimer", "إخلاء المسؤولية", "legal.html#disclaimer"), a("Privacy", "الخصوصية", "legal.html#privacy"),
        a("Conflicts of interest", "تضارب المصالح", "legal.html#conflicts"), a("Terms of use", "شروط الاستخدام", "legal.html#terms"),
        bi("Follow", "تابعنا"), CONTACT_EMAIL, bi("Email", "البريد الإلكتروني"),
        ext("LinkedIn", LINKEDIN), ext("YouTube", YOUTUBE), ext("ORCID", ORCID),
        bi("Metabolic Liver Academy (MLA). Founded by %s." % FOUNDER["en"],
           "أكاديمية الكبد والتمثيل الغذائي. أسسها %s." % FOUNDER["ar"]),
    )


# Runs before the page paints, so a visitor who chose dark mode never sees a white flash.
THEME_BOOT = ("(function(){try{var t=localStorage.getItem('mla-theme');"
              "if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();")


def add_chrome(src, rel):
    """Insert header + menu after <body ...> and the footer before </body>."""
    i = src.index("<body")
    j = src.index(">", i) + 1
    src = src[:j] + "\n" + header(rel) + src[j:]
    k = src.rindex("</main>") + len("</main>")
    return src[:k] + "\n" + footer(rel) + src[k:]
