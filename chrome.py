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
# Until the beehiiv sign-up link is set in main.js (NEWSLETTER_URL), the
# "Join our mailing list" button opens an email with this subject line.
SUBSCRIBE_MAILTO = "mailto:%s?subject=Subscribe%%20to%%20the%%20Metabolic%%20Liver%%20Academy%%20mailing%%20list" % CONTACT_EMAIL

MENU = [
    {"en": "Home", "ar": "الرئيسية", "href": "index.html", "key": "home", "icon": "home"},
    {"en": "Patients", "ar": "المرضى", "key": "patients", "icon": "heart", "items": [
        ("Patient Portal", "بوابة المرضى", "patients.html"),
        ("Am I at risk?", "هل أنا معرّض للخطر؟", "patients.html#risk"),
        ("Questions and answers", "أسئلة وأجوبة", "learn.html"),
        ("Printable guides", "أدلة للطباعة", "guides.html"),
    ]},
    {"en": "Physicians", "ar": "الأطباء", "key": "physicians", "icon": "steth", "items": [
        ("Physician Portal", "بوابة الأطباء", "academy.html"),
        ("Teaching modules", "الوحدات التعليمية", "academy.html#modules"),
        ("Reference library", "المكتبة المرجعية", "ref.html"),
        ("Guidance", "الإرشادات", "guidance.html"),
        ("Calculators", "الحاسبات", "calculators.html"),
    ]},
    {"en": "Lectures", "ar": "المحاضرات", "href": "lectures.html", "key": "lectures", "icon": "play"},
    {"en": "Meet the Expert", "ar": "لقاء مع خبير", "href": "experts.html", "key": "experts", "icon": "people"},
    {"en": "Publication Radar", "ar": "رادار الأبحاث", "href": "radar.html", "key": "radar", "icon": "radar"},
    {"en": "News", "ar": "الأخبار", "href": "news.html", "key": "news", "icon": "cal"},
    {"en": "About", "ar": "من نحن", "key": "about", "icon": "info", "items": [
        ("About the Academy", "عن الأكاديمية", "about.html"),
        ("Mission and values", "الرسالة والقيم", "about.html#mission"),
        ("Editorial policy", "السياسة التحريرية", "legal.html#governance"),
        ("Partners", "الشركاء", "partners.html"),
        ("Policies", "السياسات", "legal.html"),
    ]},
    {"en": "Contact", "ar": "تواصل معنا", "href": "contact.html", "key": "contact", "icon": "mail"},
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


def mark(up, dark_only=False):
    """The MLA logo. Two versions: blue letters for light pages, light letters
    for dark mode (and the always-dark footer). CSS shows the right one."""
    img = ('<img class="brand-mark %s" src="%simages/brand/%s-160.webp" alt="" width="79" height="46">')
    dark = img % ("logo-d", up, "mla-logo-dark")
    return dark if dark_only else img % ("logo-l", up, "mla-logo") + dark

ICON_MENU = ('<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" '
             'stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>')
# Side-menu icons (simple line drawings, 24 x 24)
ICONS = {
    "home": '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    "heart": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    "steth": '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    "play": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
    "people": '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.8-3.6 3.3-5.5 6-5.5s5.2 1.9 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2.4.2 4.2 1.9 5 5.4"/>',
    "radar": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6-6"/>',
    "cal": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
}


def icon(name):
    return ('<svg class="nav-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" '
            'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % ICONS[name])


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
            items.append('<li class="nav-item%s"><a class="nav-top" href="%s%s"%s>%s%s</a></li>' % (
                active, up, m["href"], ' aria-current="page"' if m["href"] == page else "", icon(m["icon"]), bi(m["en"], m["ar"])))
            continue
        sub = "".join("<li>%s</li>" % link(en, ar, href) for en, ar, href in m["items"])
        items.append(
            '<li class="nav-item has-sub%s">'
            # the section you are in starts open
            '<button type="button" class="nav-top nav-toggle" aria-expanded="%s" aria-controls="nav-sub-%d">%s%s%s</button>'
            '<ul class="nav-sub" id="nav-sub-%d">%s</ul></li>' % (active, "true" if active else "false", i, icon(m["icon"]),
                                                                  bi(m["en"], m["ar"]), ICON_CHEV, i, sub))

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
        up, mark(up),
        bi("Metabolic Liver Academy", "أكاديمية الكبد والتمثيل الغذائي"),
        bi("Healthy liver. Healthy life.", "كبد سليم. حياة صحية."),
        bi("Dark mode", "الوضع الداكن"), ICON_THEME,
        bi(lang_en, lang_ar),
        "Main",
        bi("Close menu", "إغلاق القائمة"),
        "".join(items),
    )


def stay_in_touch(up):
    """Band above the footer on every page: mailing list + contact."""
    return (
        '<section class="touch-band" aria-labelledby="touch-h"><div class="wrap touch-inner">'
        '<div><h2 class="touch-h" id="touch-h">%s</h2><p>%s</p></div>'
        '<div class="touch-actions">'
        '<a class="btn" data-newsletter href="%s" rel="noopener">%s</a>'
        '<a class="btn ghost" href="%scontact.html">%s</a>'
        '</div></div></section>\n'
    ) % (
        bi("Stay in touch", "ابقَ على تواصل"),
        bi('New patient guides, expert interviews and events, about once a month. No advertising; unsubscribe at any time. '
           'Your email is stored by our newsletter service, beehiiv, outside Saudi Arabia. See our <a href="%slegal.html#privacy">privacy notice</a>.' % up,
           'أدلة جديدة للمرضى ولقاءات مع خبراء وفعاليات، نحو مرة في الشهر. بلا إعلانات، ويمكنك إلغاء الاشتراك في أي وقت. '
           'تحفظ خدمة النشرة beehiiv بريدك الإلكتروني خارج المملكة. اطّلع على <a href="%slegal.html#privacy">بيان الخصوصية</a>.' % up),
        SUBSCRIBE_MAILTO, bi("Join our mailing list", "اشترك في قائمتنا البريدية"),
        up, bi("Contact us", "تواصل معنا"),
    )


def footer(rel):
    up = "../" * rel.count("/")

    def a(en, ar, href):
        return '<li><a href="%s%s">%s</a></li>' % (up, href, bi(en, ar))

    def ext(label, href):
        return '<li><a href="%s" target="_blank" rel="noopener">%s</a></li>' % (href, label)

    return stay_in_touch(up) + (
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
        mark(up, dark_only=True), bi("Metabolic Liver Academy", "أكاديمية الكبد والتمثيل الغذائي"),
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
