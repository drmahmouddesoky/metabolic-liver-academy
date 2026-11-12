# -*- coding: utf-8 -*-
"""
The newer physician courses (registry). See ROADMAP.md and "Locked courses" in README.md.

Each course is a series of modules. Module 1 of a course is open to everyone; its full
text lives here in PUBLIC_MODULES (same schema as content/gi_modules.py, English only,
with Arabic title and subtitle). The other modules are locked: their text lives in the
founder's PRIVATE repository and only their encrypted form is published, in
locked/<series>/ (written by scripts/lock_modules.py, which also writes the public
title list, locked/<series>/index.json).

A course stays hidden (no pages, no links, not in the sitemap) until "live" is True.
"""

SERIES = {
    "lipids": {
        "en": "Mastering Hyperlipidemia Management",
        "ar": "إتقان علاج فرط شحميات الدم",
        "anchor": "lipids-series",
        "lead_en": "A twelve-module preceptorship that follows lipid metabolism from the gut to the artery wall, "
                   "marks where every drug acts, and ends at the prescription.",
        "lead_ar": "برنامج تدريبي من اثنتي عشرة وحدة يتتبّع استقلاب الدهون من الأمعاء إلى جدار الشريان، "
                   "ويحدّد موضع عمل كل دواء، وينتهي بالوصفة العلاجية.",
        "live": False,
    },
    "bowel": {
        "en": "Bowel Health series",
        "ar": "سلسلة صحة الأمعاء",
        "anchor": "bowel-series",
        "lead_en": "Four courses: chronic constipation, IBS-C, refractory and evacuation disorders, "
                   "and neurogenic bowel with special populations.",
        "lead_ar": "أربع دورات: الإمساك المزمن، والقولون العصبي مع الإمساك، والإمساك المعنّد واضطرابات الإخراج، "
                   "والأمعاء العصبية والفئات الخاصة.",
        "live": False,
    },
    "obesity": {
        "en": "Obesity Medicine course",
        "ar": "دورة طب السمنة",
        "anchor": "obesity-series",
        "lead_en": "Fourteen modules mapped to the OMEC competencies, SCOPE, EASO, the SCFHS curriculum and NICE.",
        "lead_ar": "أربع عشرة وحدة مرتبطة بكفاءات OMEC وبرنامج SCOPE وEASO ومنهج الهيئة السعودية وإرشادات NICE.",
        "live": False,
    },
}

UPDATED = "2026-11-12"
NEXT_REVIEW = "2027-11"
REVIEWED = {}
VERSIONS = {}
PEER = {}

# Sources cited by the public modules below (each checked on PubMed before use).
SOURCES = {}

# Module 1 of each course, in full (open to everyone). Add each one when it is written:
#   {"slug": "lipids-biochemistry", "series": "lipids", "number": 1, "en_only": True, ...}
PUBLIC_MODULES = []
