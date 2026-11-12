# -*- coding: utf-8 -*-
"""Mastering Hyperlipidemia Management, Module 1 (open to everyone).

English text with an Arabic title, subtitle and summary. Citations use the keys in
content/courses.py SOURCES. Modules 2 to 12 live in the founder's private repository.
"""

MODULE = {
    "slug": "lipids-language",
    "series": "lipids",
    "number": 1,
    "en_only": True,
    "title": {"en": "The language of lipids: particles, proteins and the master map",
              "ar": "لغة الدهون: الجسيمات والبروتينات والخريطة الرئيسية"},
    "subtitle": {"en": "What cholesterol and triglyceride are, how lipoproteins carry them, why apoB particles cause atherosclerosis, and how to read a lipid report.",
                 "ar": "ما الكوليسترول والدهون الثلاثية، وكيف تنقلها البروتينات الدهنية، ولماذا تسبب جسيمات apoB تصلّب الشرايين، وكيف تُقرأ نتيجة تحليل الدهون."},
    "audience": {"en": "Residents, primary care physicians, clinical pharmacists and specialists",
                 "ar": "الأطباء المقيمون وأطباء الرعاية الأولية والصيادلة السريريون والاختصاصيون"},
    "minutes": 40,
    "objectives": [
        "Describe the three lipids that matter clinically and what each does in the body.",
        "Name the main lipoprotein classes, where each is made and which apolipoprotein defines it.",
        "Explain why one apoB molecule per particle makes apoB a count of atherogenic particles.",
        "Summarise the genetic, epidemiological and trial evidence that LDL and other apoB particles cause atherosclerosis.",
        "Read a standard lipid report, convert between mg/dL and mmol/L, and know when calculated LDL-C fails.",
        "Use the course's master map to place every lipid-lowering drug on the pathway it targets.",
    ],
    "blocks": [
        ("h2", "How this course works", "how"),
        ("p", "This preceptorship follows a molecule of cholesterol from the plate to the artery wall and back. Each module covers one stage of lipid metabolism, shows where medicines act on it, and then turns the biology into decisions at the bedside. The guidance comes from the 2025 ESC/EAS focused update, the 2026 ACC/AHA multisociety guideline and the 2025 Saudi NHC/SHA prevention guideline, set side by side where they differ. [[esc2025,acc2026,nhcsha2025]]"),
        ("ul", [
            "Week 1: the language of lipids (this module) and the exogenous pathway.",
            "Week 2: the endogenous pathway and triglyceride-rich lipoproteins; the LDL receptor and PCSK9.",
            "Week 3: HDL and reverse cholesterol transport; lipoprotein(a).",
            "Week 4: measuring lipids and estimating risk; targets and treatment strategy.",
            "Week 5: statins from A to Z; the modern non-statin toolbox and its trials.",
            "Week 6: familial hypercholesterolaemia and special populations; lipid care in the Middle East and worldwide, and how to run a lipid clinic.",
        ]),
        ("p", "Look out for four kinds of box. \"Where drugs act\" ties the biology to a medicine. \"For the pharmacist\" covers doses, interactions and monitoring. \"Advanced\" goes deeper, for specialists. \"Middle East and North Africa\" gives regional data. Guideline recommendations sit in shaded boxes that show the guideline, its class of recommendation and its level of evidence."),

        ("h2", "The three lipids that matter", "lipids"),
        ("p", "Cholesterol is a rigid four-ring sterol. Every cell uses it to build membranes, and specialised tissues turn it into bile acids (liver), steroid hormones (adrenal glands and gonads) and vitamin D (skin). In plasma about two-thirds of it is esterified to a fatty acid; cholesteryl ester is even less soluble in water and is the form packed into lipoprotein cores. [[feingold]]"),
        ("p", "Triglycerides are three fatty acids on a glycerol backbone. They are the body's energy store and fuel: after a meal they travel from the gut to muscle and fat, and between meals the liver exports them to the same tissues. [[feingold]]"),
        ("p", "Phospholipids have a water-loving head and two fatty-acid tails. With free cholesterol and proteins they form the single-layer surface of every lipoprotein, which lets an oily cargo travel in watery blood. [[feingold]]"),
        ("box", "pearl", "Cholesterol cannot be broken down for energy. The body can only use it, store it as ester, or excrete it, mainly in bile as cholesterol and bile acids. That is why the liver and the gut are the two control points every lipid drug works on."),

        ("h2", "The lipoprotein particle", "particle"),
        ("p", "A lipoprotein is a sphere with a core of triglyceride and cholesteryl ester and a surface of phospholipid, free cholesterol and apolipoproteins. Particles are named by density on ultracentrifugation: the more triglyceride, the larger and lighter the particle. [[feingold]]"),
        ("table", {
            "caption": "Main lipoprotein classes",
            "head": ["Particle", "Made in", "Defining protein", "Main core lipid", "Atherogenic?"],
            "rows": [
                ["Chylomicron", "Small intestine", "apoB-48", "Dietary triglyceride", "Too large to enter the artery wall; very high levels cause pancreatitis"],
                ["Chylomicron remnant", "From chylomicrons in plasma", "apoB-48, apoE", "Cholesterol-enriched", "Yes"],
                ["VLDL", "Liver", "apoB-100", "Triglyceride", "Smaller VLDL and remnants: yes"],
                ["IDL", "From VLDL in plasma", "apoB-100, apoE", "Triglyceride and cholesteryl ester", "Yes"],
                ["LDL", "From IDL in plasma", "apoB-100", "Cholesteryl ester", "Yes: the main driver"],
                ["Lp(a)", "Liver", "apoB-100 linked to apo(a)", "Cholesteryl ester", "Yes, with extra pro-inflammatory effects"],
                ["HDL", "Liver and intestine", "apoA-I", "Cholesteryl ester", "No; not a treatment target"],
            ],
        }),
        ("p", "Chylomicrons, VLDL and their remnants are grouped as triglyceride-rich lipoproteins. Particles smaller than about 70 nm (remnants, IDL, LDL and Lp(a)) can cross the endothelium and be trapped in the artery wall. The largest chylomicrons cannot; they cause harm a different way, through pancreatitis when triglycerides are very high. [[eastrl2021]]"),

        ("h2", "Apolipoproteins: the address labels", "apos"),
        ("p", "Apolipoproteins hold the particle together, switch enzymes on and off, and tell receptors where the particle should go. Six matter most in practice. [[feingold,eastrl2021]]"),
        ("table", {
            "caption": "Apolipoproteins you will meet in every module",
            "head": ["Protein", "Found on", "Job", "Drug link"],
            "rows": [
                ["apoB-100", "VLDL, IDL, LDL, Lp(a)", "Structural; binds the LDL receptor", "Every LDL-lowering drug lowers apoB"],
                ["apoB-48", "Chylomicrons and remnants", "Structural; lacks the LDL-receptor binding region", "Lomitapide (MTP) blocks its loading"],
                ["apoC-II", "Triglyceride-rich particles", "Switches on lipoprotein lipase", "Loss causes chylomicronaemia"],
                ["apoC-III", "Triglyceride-rich particles, HDL", "Slows lipoprotein lipase and remnant clearance", "Olezarsen, plozasiran, volanesorsen"],
                ["apoE", "Remnants, IDL, HDL", "Lets remnants bind liver receptors", "apoE2/E2 underlies dysbetalipoproteinaemia"],
                ["apoA-I", "HDL", "Takes up cell cholesterol; activates LCAT", "Raising HDL-C has not cut events"],
            ],
        }),
        ("p", "Each VLDL, IDL, LDL and Lp(a) particle carries exactly one apoB-100, and each chylomicron one apoB-48. So the apoB concentration counts the atherogenic particles, however much cholesterol each one carries. [[eastrl2021]]"),
        ("box", "adv", "Discordance. When triglycerides are high, as in diabetes, obesity or metabolic dysfunction-associated steatotic liver disease, LDL particles become smaller and carry less cholesterol each. LDL-C can then look acceptable while the particle count (apoB) is high. This is why guidelines prefer non-HDL-C or apoB in these patients. [[acc2026,nhcsha2025]]"),

        ("h2", "Why apoB particles cause atherosclerosis", "cause"),
        ("p", "Three independent lines of evidence agree: genes that raise LDL-C from birth raise coronary risk in proportion; populations with higher LDL-C have more disease; and every drug that lowers LDL-C through the LDL receptor cuts events in proportion to the absolute reduction. The European Atherosclerosis Society consensus calls LDL a cause of atherosclerotic cardiovascular disease, not a marker of it. [[ference2017,boren2020]]"),
        ("p", "The mechanism starts when apoB particles cross the endothelium and stick to proteoglycans in the intima. Retained particles are modified and oxidised, taken up by macrophages that become foam cells, and set off inflammation that builds the plaque. The more particles in the blood and the longer they are there, the more get trapped. [[boren2020]]"),
        ("p", "Exposure adds up over a lifetime. One estimate puts the threshold for a first myocardial infarction at about 5,000 mg-years of LDL-C; a person with LDL-C of 125 mg/dL reaches it around age 40. The same 1 mmol/L lower LDL-C is linked to a much larger fall in ischaemic heart disease death when it starts at 40–49 years than at 70–89 years. [[siegel2026]]"),
        ("p", "Nature ran the trial first. People with loss-of-function variants in PCSK9 have lifelong lower LDL-C and far fewer coronary events, which pointed straight to a drug target. [[cohen2006]] By contrast, genetic variants that raise HDL-C alone do not lower the risk of myocardial infarction, a warning that a lipid number is not always a cause. [[voight2012]]"),
        ("box", "pearl", "The 2026 ACC/AHA guideline builds its approach on this idea: risk depends on both the level of apoB-containing lipoproteins and how long a person is exposed to them, so earlier treatment matters. [[acc2026,life2026]]"),

        ("h2", "Reading a lipid report", "report"),
        ("p", "A standard panel measures total cholesterol, HDL-C and triglycerides. LDL-C is usually calculated, and non-HDL-C is simply total cholesterol minus HDL-C: all the cholesterol in apoB particles. Non-fasting samples are acceptable for most purposes. [[siegel2026]]"),
        ("table", {
            "caption": "Units and the classic LDL-C equation",
            "head": ["Item", "Rule"],
            "rows": [
                ["Cholesterol (total, LDL, HDL, non-HDL)", "mmol/L × 38.67 = mg/dL"],
                ["Triglycerides", "mmol/L × 88.6 = mg/dL"],
                ["Friedewald LDL-C (mg/dL)", "Total cholesterol − HDL-C − triglycerides/5"],
                ["When Friedewald fails", "Triglycerides above 400 mg/dL (4.5 mmol/L): use non-HDL-C, apoB or a directly measured LDL-C"],
                ["Non-HDL-C goal", "LDL-C goal + 30 mg/dL (ACC/AHA 2026)"],
            ],
        }),
        ("p", "Two more tests complete the picture. ApoB is the most direct count of atherogenic particles and is most useful when triglycerides are high or LDL-C is very low on treatment. Lipoprotein(a) is mostly set by genes, so one measurement in adult life is enough for most people; ESC/EAS, ACC/AHA and the Saudi guideline all now advise measuring it once. [[acc2026,escnew2025,nhcsha2025]]"),
        ("gl", "Measure lipoprotein(a) at least once in every adult's lifetime to identify people with very high inherited levels.", "ESC/EAS 2025", "IIa", "B", "escnew2025"),
        ("gl", "Measure lipoprotein(a) at least once in adulthood; ≥125 nmol/L or ≥50 mg/dL is a risk-enhancing factor (the two units are not interchangeable).", "ACC/AHA 2026", "I", "", "life2026"),
        ("box", "pharm", "Units cause real dosing errors. Before you compare a result with a goal, check whether the report is in mg/dL or mmol/L, and for Lp(a) whether it is in mg/dL (mass) or nmol/L (particle number). There is no exact conversion for Lp(a): about 2 to 2.5 nmol/L per mg/dL is only an approximation. [[easlpa2022]]"),

        ("h2", "The master map", "map"),
        ("p", "Every later module zooms into one part of this map. Read it from left to right: dietary fat leaves the gut in chylomicrons, lipoprotein lipase strips their triglyceride in the capillaries, remnants return to the liver, and the liver sends out VLDL, which becomes IDL and then LDL. The liver clears LDL through its LDL receptors, and whatever is not cleared can lodge in the artery wall."),
        ("figure", "lipidmap", ("Master map of lipid metabolism. Magenta pills mark where each medicine acts; the course returns to each one in turn.", "الخريطة الرئيسية لاستقلاب الدهون، وتشير العلامات الوردية إلى موضع عمل كل دواء.")),
        ("box", "drug", "Most LDL-lowering drugs end in the same place: more LDL receptors on the liver. Statins and bempedoic acid cut the liver's own cholesterol synthesis; ezetimibe and resins cut the cholesterol arriving from the gut; PCSK9 drugs stop the receptor being destroyed. Each time the liver senses less cholesterol, it makes more receptors and pulls more LDL out of the blood. Drugs for triglycerides and Lp(a) work elsewhere: on lipoprotein lipase and its brakes, or on the production of apo(a)."),

        ("h2", "Case: the report that does not add up", "case"),
        ("case", {
            "title": "A 46-year-old man with a 'normal' LDL-C",
            "parts": [
                ("Presentation", "A 46-year-old man with a BMI of 33 kg/m², type 2 diabetes and MASLD has a fasting panel: total cholesterol 220 mg/dL, HDL-C 32 mg/dL, triglycerides 430 mg/dL. The report gives no LDL-C."),
                ("Why no LDL-C?", "Triglycerides are above 400 mg/dL, so the Friedewald equation is not valid and the laboratory has rightly withheld it."),
                ("What to use instead", "Non-HDL-C is 220 − 32 = 188 mg/dL. Measuring apoB would show how many atherogenic particles he carries, which LDL-C would understate here. [[siegel2026,nhcsha2025]]"),
                ("What comes next", "Look for secondary causes (glucose control, alcohol, hypothyroidism, medicines), estimate his risk, and set a non-HDL-C goal. Modules 3, 7 and 8 complete this case."),
            ],
        }),

        ("h2", "Test yourself", "quiz"),
        ("mcq", [
            {"q": "Why does plasma apoB count atherogenic particles?",
             "options": ["apoB is the only protein on LDL", "Each VLDL, IDL, LDL and Lp(a) particle carries exactly one apoB molecule", "apoB is the enzyme that makes LDL", "apoB rises only when triglycerides are high"],
             "answer": 1, "why": "One apoB per particle means the apoB concentration is a particle count, whatever cholesterol each particle carries."},
            {"q": "Which particle is least able to enter the artery wall?",
             "options": ["LDL", "IDL", "Large chylomicron", "Lipoprotein(a)"],
             "answer": 2, "why": "Particles larger than about 70 nm cannot cross the endothelium. Very large chylomicrons cause pancreatitis rather than atheroma."},
            {"q": "A report shows total cholesterol 5.2 mmol/L. What is it in mg/dL?",
             "options": ["About 135 mg/dL", "About 201 mg/dL", "About 460 mg/dL", "About 52 mg/dL"],
             "answer": 1, "why": "Multiply cholesterol in mmol/L by 38.67: 5.2 × 38.67 ≈ 201 mg/dL."},
            {"q": "Genetic variants that raise HDL-C alone…",
             "options": ["Lower myocardial infarction risk in proportion", "Do not lower myocardial infarction risk", "Raise the risk of pancreatitis", "Lower Lp(a)"],
             "answer": 1, "why": "Mendelian randomisation found no protection from HDL-raising variants alone, one reason HDL-C is not a treatment target."},
            {"q": "Which statement about lipoprotein(a) testing is correct?",
             "options": ["It should be repeated every year", "It needs a fasting sample and is useless otherwise", "ESC/EAS, ACC/AHA and the Saudi guideline all advise measuring it at least once in adulthood", "mg/dL and nmol/L can be converted exactly"],
             "answer": 2, "why": "Lp(a) is mostly inherited and stable, so one measurement is enough for most adults. The units cannot be converted exactly."},
        ]),
        ("arsum", [
            "تبدأ هذه الدورة بلغة الدهون: الكوليسترول لبناء الأغشية والهرمونات والأحماض الصفراوية، والدهون الثلاثية للطاقة، والفوسفوليبيدات لسطح الجسيمات.",
            "تنقل البروتينات الدهنية هذه الدهون في الدم. وتحمل كل جسيمة VLDL وIDL وLDL وLp(a) جزيئًا واحدًا من apoB، لذا يعدّ قياس apoB عدًّا للجسيمات المسبّبة لتصلّب الشرايين.",
            "تؤكد الأدلة الوراثية والوبائية ونتائج التجارب أن LDL وجسيمات apoB الأخرى سبب لأمراض القلب والأوعية التصلّبية، وأن الضرر يتراكم مع مستوى التعرّض ومدّته.",
            "عند قراءة التحليل: حوّل الكوليسترول بضرب mmol/L في 38.67، والدهون الثلاثية في 88.6. لا تصلح معادلة Friedewald إذا تجاوزت الدهون الثلاثية 400 ملغ/دل، فاستعمل non-HDL-C أو apoB.",
            "قِس Lp(a) مرة واحدة على الأقل في العمر. وتنتهي معظم الأدوية الخافضة لـ LDL إلى زيادة مستقبلات LDL في الكبد، كما تُظهر الخريطة الرئيسية.",
        ]),
    ],
}
