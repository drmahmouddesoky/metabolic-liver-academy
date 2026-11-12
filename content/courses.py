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
        "live": True,
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
REVIEWED = {  # signed off by the author
    "lipids-language": "2026-11-12",
    "lipids-exogenous": "2026-11-12",
    "lipids-endogenous": "2026-11-12",
    "lipids-ldlr-pcsk9": "2026-11-12",
    "lipids-hdl-cetp": "2026-11-12",
    "lipids-lpa": "2026-11-12",
    "lipids-risk": "2026-11-12",
    "lipids-targets": "2026-11-12",
    "lipids-statins": "2026-11-12",
    "lipids-toolbox": "2026-11-12",
    "lipids-fh-special": "2026-11-12",
    "lipids-clinic": "2026-11-12",
}
VERSIONS = {}
PEER = {}

# Sources for the courses (each checked on PubMed on 12 November 2026; links go to the DOI or,
# where PubMed gives none, to the PubMed record). Locked modules cite these keys too.
SOURCES = {
    'acc2026': ('Blumenthal RS, Morris PB, et al. 2026 ACC/AHA/AACVPR/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the Management of Dyslipidemia. Circulation 2026;153(17):e1154–e1276.', 'https://doi.org/10.1161/CIR.0000000000001423'),
    'esc2025': ('Mach F, Koskinas KC, et al. 2025 Focused Update of the 2019 ESC/EAS Guidelines for the management of dyslipidaemias. Eur Heart J 2025;46(42):4359–4378.', 'https://doi.org/10.1093/eurheartj/ehaf190'),
    'esc2019': ('Mach F, Baigent C, et al. 2019 ESC/EAS Guidelines for the management of dyslipidaemias: lipid modification to reduce cardiovascular risk. Eur Heart J 2020;41(1):111–188.', 'https://doi.org/10.1093/eurheartj/ehz455'),
    'escnew2025': ('Guasti L, Gaudio GV, Lupi A. What is new in the 2025 Focused Update of the 2019 ESC/EAS Guidelines for the management of dyslipidaemias. ESC CardioPractice, 2 December 2025.', 'https://www.escardio.org/communities/councils/cardiology-practice/education/cardiopractice/what-is-new-in-the-2025-focused-update-of-the-2019-esc-eas-guidelines-for-the-m/'),
    'aha2018': ('Grundy SM, Stone NJ, et al. 2018 AHA/ACC/AACVPR/AAPA/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the Management of Blood Cholesterol. Circulation 2019;139(25):e1082–e1143.', 'https://doi.org/10.1161/CIR.0000000000000625'),
    'prevent2024': ("Khan SS, et al. Development and validation of the American Heart Association's PREVENT equations. Circulation 2024;149(6):430–449.", 'https://doi.org/10.1161/CIRCULATIONAHA.123.067626'),
    'score2': ('SCORE2 working group and ESC Cardiovascular risk collaboration. SCORE2 risk prediction algorithms. Eur Heart J 2021;42(25):2439–2454.', 'https://doi.org/10.1093/eurheartj/ehab309'),
    'score2op': ('SCORE2-OP working group and ESC Cardiovascular risk collaboration. SCORE2-OP risk prediction algorithms. Eur Heart J 2021;42(25):2455–2467.', 'https://doi.org/10.1093/eurheartj/ehab312'),
    'nhcsha2025': ('AlRahimi J, et al. National Heart Center/Saudi Heart Association 2025 Guidelines for Cardiovascular Diseases Prevention and Risk Assessment. Saudi Med J 2026;47(1):120–177.', 'https://doi.org/10.15537/smj.2026.47.1.20250578'),
    'shapcsk9': ('AlHabeeb W, et al. Advancing lipid management: Saudi Heart Association position statement on PCSK9-targeted therapies in the primary and secondary prevention of cardiovascular disease. J Saudi Heart Assoc 2026;38:16.', 'https://doi.org/10.37616/2212-5043.1488'),
    'life2026': ('Sabouret P, et al. The 2026 ACC/AHA dyslipidemia guideline: a critical and transatlantic perspective on personalized lipid management. Life (Basel) 2026;16(9):1470.', 'https://doi.org/10.3390/life16091470'),
    'siegel2026': ('Siegel PM, et al. A practical guide to the management of dyslipidaemia. Clin Res Cardiol 2026;115(2):185–197.', 'https://doi.org/10.1007/s00392-025-02833-y'),
    'miteva2026': ('Miteva K, Mach F. Bridging the Atlantic: a comparative review of the 2025 ESC/EAS focused update and the 2026 ACC/AHA guideline on dyslipidaemia management. Curr Opin Lipidol 2026;37(6):235–242.', 'https://doi.org/10.1097/MOL.0000000000001063'),
    'irannejad2026': ('Irannejad K, et al. Coronary artery calcium in ACC/AHA prevention guidelines: evolution from 2007 to 2026. JACC Cardiovasc Imaging 2026;19(10):1271–1275.', 'https://doi.org/10.1016/j.jcmg.2026.07.014'),
    'ference2017': ('Ference BA, et al. Low-density lipoproteins cause atherosclerotic cardiovascular disease. 1. Evidence from genetic, epidemiologic, and clinical studies. EAS consensus statement. Eur Heart J 2017;38(32):2459–2472.', 'https://doi.org/10.1093/eurheartj/ehx144'),
    'boren2020': ('Borén J, et al. Low-density lipoproteins cause atherosclerotic cardiovascular disease: pathophysiological, genetic, and therapeutic insights. EAS consensus statement. Eur Heart J 2020;41(24):2313–2330.', 'https://doi.org/10.1093/eurheartj/ehz962'),
    'eastrl2021': ('Ginsberg HN, et al. Triglyceride-rich lipoproteins and their remnants: metabolic insights, role in atherosclerotic cardiovascular disease, and emerging therapeutic strategies. EAS consensus statement. Eur Heart J 2021;42(47):4791–4806.', 'https://doi.org/10.1093/eurheartj/ehab551'),
    'easlpa2022': ('Kronenberg F, et al. Lipoprotein(a) in atherosclerotic cardiovascular disease and aortic stenosis: a European Atherosclerosis Society consensus statement. Eur Heart J 2022;43(39):3925–3946.', 'https://doi.org/10.1093/eurheartj/ehac361'),
    'easfh2013': ('Nordestgaard BG, et al. Familial hypercholesterolaemia is underdiagnosed and undertreated in the general population: guidance for clinicians to prevent coronary heart disease. EAS consensus statement. Eur Heart J 2013;34(45):3478–3490a.', 'https://doi.org/10.1093/eurheartj/eht273'),
    'easfhkids2015': ('Wiegman A, et al. Familial hypercholesterolaemia in children and adolescents: gaining decades of life by optimizing detection and treatment. EAS consensus statement. Eur Heart J 2015;36(36):2425–2437.', 'https://doi.org/10.1093/eurheartj/ehv157'),
    'eashofh2023': ('Cuchel M, et al. 2023 update on European Atherosclerosis Society consensus statement on homozygous familial hypercholesterolaemia. Eur Heart J 2023;44(25):2277–2291.', 'https://doi.org/10.1093/eurheartj/ehad197'),
    'eassams2015': ('Stroes ES, et al. Statin-associated muscle symptoms: impact on statin therapy. EAS consensus panel statement. Eur Heart J 2015;36(17):1012–1022.', 'https://doi.org/10.1093/eurheartj/ehv043'),
    'feingold': ('Feingold KR. Introduction to lipids and lipoproteins. In: Endotext. South Dartmouth (MA): MDText.com (updated edition).', 'https://pubmed.ncbi.nlm.nih.gov/26247089/'),
    'browngoldstein1986': ('Brown MS, Goldstein JL. A receptor-mediated pathway for cholesterol homeostasis. Science 1986;232(4746):34–47.', 'https://doi.org/10.1126/science.3513311'),
    'cohen2006': ('Cohen JC, et al. Sequence variations in PCSK9, low LDL, and protection against coronary heart disease. N Engl J Med 2006;354(12):1264–1272.', 'https://doi.org/10.1056/NEJMoa054013'),
    'voight2012': ('Voight BF, et al. Plasma HDL cholesterol and risk of myocardial infarction: a mendelian randomisation study. Lancet 2012;380(9841):572–580.', 'https://doi.org/10.1016/S0140-6736(12)60312-2'),
    'ctt2010': ("Cholesterol Treatment Trialists' (CTT) Collaboration. Efficacy and safety of more intensive lowering of LDL cholesterol: a meta-analysis of data from 170,000 participants in 26 randomised trials. Lancet 2010;376(9753):1670–1681.", 'https://doi.org/10.1016/S0140-6736(10)61350-5'),
    'ctt2019age': ("Cholesterol Treatment Trialists' Collaboration. Efficacy and safety of statin therapy in older people: a meta-analysis of individual participant data from 28 randomised controlled trials. Lancet 2019;393(10170):407–415.", 'https://doi.org/10.1016/S0140-6736(18)31942-1'),
    'cttmuscle2022': ("Cholesterol Treatment Trialists' Collaboration. Effect of statin therapy on muscle symptoms: an individual participant data meta-analysis of large-scale, randomised, double-blind trials. Lancet 2022;400(10355):832–845.", 'https://doi.org/10.1016/S0140-6736(22)01545-8'),
    'samson2020': ('Wood FA, et al. N-of-1 trial of a statin, placebo, or no treatment to assess side effects. N Engl J Med 2020;383(22):2182–2184.', 'https://doi.org/10.1056/NEJMc2031173'),
    'improveit': ('Cannon CP, et al. Ezetimibe added to statin therapy after acute coronary syndromes (IMPROVE-IT). N Engl J Med 2015;372(25):2387–2397.', 'https://doi.org/10.1056/NEJMoa1410489'),
    'fourier': ('Sabatine MS, et al. Evolocumab and clinical outcomes in patients with cardiovascular disease (FOURIER). N Engl J Med 2017;376(18):1713–1722.', 'https://doi.org/10.1056/NEJMoa1615664'),
    'odyssey': ('Schwartz GG, et al. Alirocumab and cardiovascular outcomes after acute coronary syndrome (ODYSSEY OUTCOMES). N Engl J Med 2018;379(22):2097–2107.', 'https://doi.org/10.1056/NEJMoa1801174'),
    'vesalius': ('Bohula EA, et al. Evolocumab in patients without a previous myocardial infarction or stroke (VESALIUS-CV). N Engl J Med 2026;394(2):117–127.', 'https://doi.org/10.1056/NEJMoa2514428'),
    'clear': ('Nissen SE, et al. Bempedoic acid and cardiovascular outcomes in statin-intolerant patients (CLEAR Outcomes). N Engl J Med 2023;388(15):1353–1364.', 'https://doi.org/10.1056/NEJMoa2215024'),
    'orion1011': ('Ray KK, et al. Two phase 3 trials of inclisiran in patients with elevated LDL cholesterol (ORION-10 and ORION-11). N Engl J Med 2020;382(16):1507–1519.', 'https://doi.org/10.1056/NEJMoa1912387'),
    'enlicitide': ('Navar AM, et al. A placebo-controlled trial of the oral PCSK9 inhibitor enlicitide (CORALreef Lipids). N Engl J Med 2026;394(6):529–539.', 'https://doi.org/10.1056/NEJMoa2511002'),
    'broadway': ('Nicholls SJ, et al. Safety and efficacy of obicetrapib in patients at high cardiovascular risk (BROADWAY). N Engl J Med 2025;393(1):51–61.', 'https://doi.org/10.1056/NEJMoa2415820'),
    'elipse': ('Raal FJ, et al. Evinacumab for homozygous familial hypercholesterolemia (ELIPSE HoFH). N Engl J Med 2020;383(8):711–720.', 'https://doi.org/10.1056/NEJMoa2004215'),
    'reduceit': ('Bhatt DL, et al. Cardiovascular risk reduction with icosapent ethyl for hypertriglyceridemia (REDUCE-IT). N Engl J Med 2019;380(1):11–22.', 'https://doi.org/10.1056/NEJMoa1812792'),
    'strength': ('Nicholls SJ, et al. Effect of high-dose omega-3 fatty acids vs corn oil on major adverse cardiovascular events (STRENGTH). JAMA 2020;324(22):2268–2280.', 'https://doi.org/10.1001/jama.2020.22258'),
    'prominent': ('Das Pradhan A, et al. Triglyceride lowering with pemafibrate to reduce cardiovascular risk (PROMINENT). N Engl J Med 2022;387(21):1923–1934.', 'https://doi.org/10.1056/NEJMoa2210645'),
    'accordlipid': ('ACCORD Study Group (Ginsberg HN, et al). Effects of combination lipid therapy in type 2 diabetes mellitus. N Engl J Med 2010;362(17):1563–1574.', 'https://doi.org/10.1056/NEJMoa1001282'),
    'balance': ('Stroes ESG, et al. Olezarsen, acute pancreatitis, and familial chylomicronemia syndrome (BALANCE). N Engl J Med 2024;390(19):1781–1792.', 'https://doi.org/10.1056/NEJMoa2400201'),
    'core': ('Marston NA, et al. Olezarsen for managing severe hypertriglyceridemia and pancreatitis risk (CORE-TIMI 72a and CORE2-TIMI 72b). N Engl J Med 2026;394(5):429–441.', 'https://doi.org/10.1056/NEJMoa2512761'),
    'essencetimi': ('Bergmark BA, et al. Targeting APOC3 with olezarsen in moderate hypertriglyceridemia (ESSENCE-TIMI 73b). N Engl J Med 2025;393(13):1279–1291.', 'https://doi.org/10.1056/NEJMoa2507227'),
    'palisade': ('Watts GF, et al. Plozasiran for managing persistent chylomicronemia and pancreatitis risk (PALISADE). N Engl J Med 2025;392(2):127–137.', 'https://doi.org/10.1056/NEJMoa2409368'),
    'shasta': ('Watts GF, et al. Plozasiran for severe hypertriglyceridemia and risk of pancreatitis (SHASTA-3 and SHASTA-4). N Engl J Med 2026;395(18):1805–1817.', 'https://doi.org/10.1056/NEJMoa2610014'),
    'horizon': ('Lp(a)HORIZON Investigators. Pelacarsen and cardiovascular outcomes in patients with high lipoprotein(a). N Engl J Med 2026.', 'https://doi.org/10.1056/NEJMoa2610159'),
    'alpaca': ('Nissen SE, et al. Lepodisiran – a long-duration small interfering RNA targeting lipoprotein(a) (ALPACA). N Engl J Med 2025;392(17):1673–1683.', 'https://doi.org/10.1056/NEJMoa2415818'),
    'reprieve': ('Grinspoon SK, et al. Pitavastatin to prevent cardiovascular disease in HIV infection (REPRIEVE). N Engl J Med 2023;389(8):687–699.', 'https://doi.org/10.1056/NEJMoa2304146'),
    'stopca': ('Neilan TG, et al. Atorvastatin for anthracycline-associated cardiac dysfunction (STOP-CA). JAMA 2023;330(6):528–536.', 'https://doi.org/10.1001/jama.2023.11887'),
    'ewtopia': ('Ouchi Y, et al. Ezetimibe lipid-lowering trial on prevention of atherosclerotic cardiovascular disease in 75 or older (EWTOPIA 75). Circulation 2019;140(12):992–1003.', 'https://doi.org/10.1161/CIRCULATIONAHA.118.039415'),
    'tst': ('Amarenco P, et al. A comparison of two LDL cholesterol targets after ischemic stroke (Treat Stroke to Target). N Engl J Med 2020;382(1):9–19.', 'https://doi.org/10.1056/NEJMoa1910355'),
    'sharp': ('Baigent C, et al. The effects of lowering LDL cholesterol with simvastatin plus ezetimibe in patients with chronic kidney disease (SHARP). Lancet 2011;377(9784):2181–2192.', 'https://doi.org/10.1016/S0140-6736(11)60739-3'),
    'cards': ('Colhoun HM, et al. Primary prevention of cardiovascular disease with atorvastatin in type 2 diabetes (CARDS). Lancet 2004;364(9435):685–696.', 'https://doi.org/10.1016/S0140-6736(04)16895-5'),
    'jupiter': ('Ridker PM, et al. Rosuvastatin to prevent vascular events in men and women with elevated C-reactive protein (JUPITER). N Engl J Med 2008;359(21):2195–2207.', 'https://doi.org/10.1056/NEJMoa0807646'),
    'reveal': ('HPS3/TIMI55–REVEAL Collaborative Group (Bowman L, et al). Effects of anacetrapib in patients with atherosclerotic vascular disease. N Engl J Med 2017;377(13):1217–1227.', 'https://doi.org/10.1056/NEJMoa1706444'),
    'hpsthrive': ('HPS2-THRIVE Collaborative Group (Landray MJ, et al). Effects of extended-release niacin with laropiprant in high-risk patients. N Engl J Med 2014;371(3):203–212.', 'https://doi.org/10.1056/NEJMoa1300955'),
    'pacmanami': ('Räber L, et al. Effect of alirocumab added to high-intensity statin therapy on coronary atherosclerosis in patients with acute myocardial infarction (PACMAN-AMI). JAMA 2022;327(18):1771–1781.', 'https://doi.org/10.1001/jama.2022.5218'),
    'krychtiuk2022': ('Krychtiuk KA, et al. Acute LDL-C reduction post ACS: strike early and strike strong. ACVC/EAPC clinical consensus statement. Eur Heart J Acute Cardiovasc Care 2022;11(12):939–949.', 'https://doi.org/10.1093/ehjacc/zuac123'),
    'orion4design': ('Mafham MM, Zayed MG, et al. HPS-4/TIMI 65/ORION-4: a double-blind randomized placebo-controlled trial assessing the effects of inclisiran on clinical outcomes among people with atherosclerotic cardiovascular disease: trial design, recruitment, and baseline characteristics. Am Heart J 2026;303:107546.', 'https://doi.org/10.1016/j.ahj.2026.107546'),
    'cttlabels2026': ("Cholesterol Treatment Trialists' Collaboration. Assessment of adverse effects attributed to statin therapy in product labels: a meta-analysis of double-blind randomised controlled trials. Lancet 2026;407(10529):689–703.", 'https://doi.org/10.1016/S0140-6736(25)01578-8'),
    'lomitapide2013': ('Cuchel M, Meagher EA, et al. Efficacy and safety of a microsomal triglyceride transfer protein inhibitor in patients with homozygous familial hypercholesterolaemia: a single-arm, open-label, phase 3 study. Lancet 2013;381(9860):40–46.', 'https://doi.org/10.1016/S0140-6736(12)61731-0'),
    'muvalaplin2025': ('Hooper AJ, Fernando PMS, Burnett JR. Assessing the clinical progress of muvalaplin for reducing lipoprotein(a). Expert Opin Investig Drugs 2025;34(11):825–830.', 'https://doi.org/10.1080/13543784.2025.2588651'),
    'olpasiran2026': ('Tweneboah C, Kaur G. Lowering of lipoprotein(a) with olpasiran. Cardiovasc Hematol Disord Drug Targets 2026;26(3):219–226.', 'https://doi.org/10.2174/011871529X428489260113103704'),
    'garba2026': ('Garba DL, Zahid S, Blumenthal RS, Barouch LA. Dyslipidemia management in athletes: a comparative commentary on the 2026 ACC/AHA/Multisociety Guideline and contemporary sports cardiology recommendations. Am J Prev Cardiol 2026;30:101735.', 'https://doi.org/10.1016/j.ajpc.2026.101735'),
    'carlson2026': ('Carlson A, Zayyad ZA, et al. Beyond LDL-C: modern lipid management for ASCVD prevention in primary care. Cardiol Ther 2026;15(3):481–501.', 'https://doi.org/10.1007/s40119-026-00473-5'),
    'gulfaction2026': ('Alhabib KF, et al. Demographics, clinical characteristics, and barriers to care in patients with dyslipidaemia in the Arabian Gulf region: the Gulf ACTION registry. Curr Vasc Pharmacol 2026.', 'https://doi.org/10.2174/0115701611397165260302054720'),
    'hicc2026': ('Schonck WAM, et al. Homozygous familial hypercholesterolaemia: insights from the Global HICC Registry. Eur Heart J 2026;47:5979–5990.', 'https://doi.org/10.1093/eurheartj/ehag357'),
}

# Drawings used by the courses (private modules may use these keys too).
from lipid_map import LIPID_MAP  # noqa: E402
FIGURES = {"lipidmap": LIPID_MAP}

# Module 1 of each course, in full (open to everyone).
from lipids_m1 import MODULE as _LIPIDS_1  # noqa: E402
PUBLIC_MODULES = [_LIPIDS_1]
