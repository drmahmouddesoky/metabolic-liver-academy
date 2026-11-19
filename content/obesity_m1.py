# -*- coding: utf-8 -*-
"""Obesity Medicine course, Module 1 (open to everyone).

English text with an Arabic title, subtitle and summary. Citations use the keys in
content/courses.py SOURCES. Modules 2 to 14 live in the founder's private repository.
"""

MODULE = {
    "slug": "obesity-disease",
    "series": "obesity",
    "number": 1,
    "en_only": True,
    "title": {"en": "Obesity as a chronic disease: definitions, diagnosis and the global picture",
              "ar": "السمنة مرض مزمن: التعريفات والتشخيص والصورة العالمية"},
    "subtitle": {"en": "Why obesity is a disease and not a choice, how to diagnose it beyond BMI, clinical versus preclinical obesity, staging, and why the Middle East needs its own thresholds.",
                 "ar": "لماذا السمنة مرض وليست خيارًا، وكيف تُشخَّص بما يتجاوز مؤشر كتلة الجسم، والفرق بين السمنة السريرية وما قبل السريرية، والتصنيف المرحلي، ولماذا يحتاج الشرق الأوسط إلى حدود خاصة."},
    "audience": {"en": "Physicians, residents, nurses, pharmacists and dietitians",
                 "ar": "الأطباء والمقيمون والممرضون والصيادلة وأخصائيو التغذية"},
    "minutes": 40,
    "objectives": [
        "Explain why obesity is managed as a chronic, relapsing disease, using the language and framing of current consensus statements.",
        "Classify weight with BMI, including the lower thresholds recommended for people of Middle Eastern, South Asian, other Asian and Black ancestry.",
        "Measure and interpret waist-to-height ratio.",
        "Apply the Lancet Commission's definitions of clinical and preclinical obesity, including how to confirm excess adiposity.",
        "Describe the EASO framework and the Edmonton Obesity Staging System.",
        "Summarise the global and regional burden of obesity, and the harm caused by weight stigma.",
    ],
    "blocks": [
        ("h2", "How this course works", "how"),
        ("p", "This course has 14 modules in four parts: foundations (Modules 1–4), assessment and the conversation (5–7), treatment (8–12), and populations and services (13–14). Each module is mapped to the Obesity Medicine Education Collaborative (OMEC) competencies, the SCOPE core curriculum of the World Obesity Federation, the Saudi Commission for Health Specialties obesity medicine fellowship, the EASO framework, NICE NG246 and the Saudi guideline. [[omec2019,scope2026,easo2024,nice2025,saudiobesity2016]]"),
        ("table", {
            "caption": "What each part covers and the frameworks it serves",
            "head": ["Part", "Modules", "Main OMEC domains", "SCOPE core topics"],
            "rows": [
                ["A. Foundations", "1–4: disease, weight regulation, causes, complications", "Medical knowledge", "Causes, regulation of body weight, complications"],
                ["B. Assessment and the conversation", "5–7: first consultation, investigations, goals", "Patient care; communication; professionalism", "Raising the issue; history and examination"],
                ["C. Treatment", "8–12: nutrition, activity and behaviour, medicines, surgery, maintenance", "Patient care; medical knowledge", "Achieving long-lasting weight loss"],
                ["D. Populations and services", "13–14: children, pregnancy, older adults; building a service", "Systems-based practice; practice-based learning", "Children and adolescents"],
            ],
        }),
        ("box", "pearl", "OMEC defined 32 obesity competencies across the six ACGME domains, each with five benchmarks, for use in medical training. SCOPE certification requires 12 SCOPE points (including the 4-point Core Learning Path), six months of practical experience in obesity management, and passing the core exam plus one supplementary exam; it is renewed yearly. [[omec2019,scope2026]] This course is planned for SCOPE accreditation once all modules are complete."),

        ("h2", "A disease, not a choice", "disease"),
        ("p", "Obesity arises from interactions between genes, biology and an environment that makes energy-dense food abundant and movement optional. Treating it as a simple failure of willpower is scientifically wrong and clinically harmful. A joint international consensus statement concluded that weight stigma causes physical and psychological harm, that people affected by it receive worse care, and that it is unacceptable in modern societies. [[stigma2020]]"),
        ("p", "Calling obesity a chronic disease has practical consequences: it should be diagnosed with care, treated with evidence-based options, and followed up long term, as with diabetes or hypertension. Weight regain after stopping effective treatment (Module 12) is a feature of the disease, not a personal failure. [[canada2020,step1ext]]"),
        ("box", "pearl", "Use people-first language: 'a person with obesity' or 'living with obesity', not 'an obese patient'. Ask permission before discussing weight. NICE recommends asking each time before discussing weight or taking measurements, and warns against attributing every symptom to weight (diagnostic overshadowing). [[nice2025,stigma2020]]"),

        ("h2", "BMI: useful, but only a screen", "bmi"),
        ("p", "Body mass index (weight in kilograms divided by height in metres squared) is a practical first measure, but it does not measure fat directly or show where fat is stored. NICE asks clinicians to interpret it with caution in people with high muscle mass and in people aged 65 and over. [[nice2025]]"),
        ("table", {
            "caption": "BMI classes in adults (NICE NG246)",
            "head": ["Class", "Most adults", "People of Middle Eastern, South Asian, Chinese, other Asian, Black African or African-Caribbean background"],
            "rows": [
                ["Healthy weight", "18.5–24.9", "18.5–22.9"],
                ["Overweight", "25–29.9", "23–27.4"],
                ["Obesity", "30 or more (class 1: 30–34.9; class 2: 35–39.9; class 3: 40 or more)", "27.5 or more"],
            ],
        }),
        ("p", "These groups develop central fat and cardiometabolic risk at lower BMI. NICE therefore recommends lower thresholds and, for referral to bariatric surgery and for weight-management medicines, thresholds usually lowered by 2.5 kg/m². [[nice2025]]"),
        ("box", "mena", "NICE explicitly names people of Middle Eastern background among those who should be assessed with lower BMI thresholds. Many MENA patients with a BMI of 28 already carry the cardiometabolic risk that a European patient carries at 30. [[nice2025]]"),

        ("h2", "Waist-to-height ratio", "whtr"),
        ("p", "In adults with a BMI below 35, NICE recommends measuring waist circumference and calculating the waist-to-height ratio as a practical estimate of central fat. The message for patients is simple: keep your waist to less than half your height. [[nice2025]]"),
        ("table", {
            "caption": "Waist-to-height ratio (adults, and children from age 5)",
            "head": ["Ratio", "Meaning"],
            "rows": [
                ["0.4–0.49", "Healthy central adiposity"],
                ["0.5–0.59", "Increased central adiposity: increased health risk"],
                ["0.6 or more", "High central adiposity: further increased health risk"],
            ],
        }),
        ("box", "pharm", "Measuring waist correctly: midway between the lowest rib and the top of the hip bone, after breathing out normally, with the tape horizontal and snug but not compressing the skin. Bioimpedance scales are not a substitute for BMI in clinical classification, according to NICE. [[nice2025]]"),

        ("h2", "Clinical and preclinical obesity", "commission"),
        ("p", "In 2025, a Lancet Diabetes & Endocrinology Commission of 58 experts, including people with lived experience, redefined the diagnosis. Obesity is excess adiposity, with or without abnormal fat distribution or function. Clinical obesity is a chronic, systemic illness in which excess adiposity alters the function of tissues and organs, or limits a person's daily activities. Preclinical obesity is excess adiposity with organs still working normally, but with a higher risk of future disease. [[lancetcomm2025]]"),
        ("figure", "obesitydx", ("Diagnosing obesity in three steps. Clinical obesity is treated as a disease; preclinical obesity is managed to reduce risk.", "تشخيص السمنة في ثلاث خطوات.")),
        ("ul", [
            "Confirm excess adiposity: because BMI can over- or underestimate fat, the Commission recommends at least one additional anthropometric measure (waist circumference, waist-to-hip ratio or waist-to-height ratio) or direct fat measurement, such as DEXA or bioimpedance. Excess adiposity can reasonably be assumed when BMI is very high. [[lancetcomm2025]]",
            "Look for dysfunction: the Commission defined 18 diagnostic criteria for clinical obesity in adults (and 13 in children), covering effects such as obstructive sleep apnoea, breathlessness, heart failure, knee and hip osteoarthritis, and limits on basic activities of daily living. [[lancetcomm2025]]",
            "Match the plan to the diagnosis: clinical obesity calls for treatment aimed at improving or reversing the dysfunction; preclinical obesity calls for evidence-based advice, monitoring and risk reduction. [[lancetcomm2025]]",
        ]),
        ("box", "adv", "The EASO framework (2024) moves in the same direction from a different angle. It proposes that obesity can be diagnosed below a BMI of 30 when abdominal fat is increased (waist-to-height ratio above 0.5) and obesity-related medical, functional or psychological impairments are present, and that treatment success should be judged by improvement in these complications rather than by kilograms alone. [[easo2024]]"),

        ("h2", "Staging: how ill is this person?", "staging"),
        ("p", "BMI says little about how much obesity is harming an individual. The Edmonton Obesity Staging System grades the impact from stage 0 (no risk factors, symptoms or limitations) through stage 1 (subclinical risk factors or mild symptoms), stage 2 (established obesity-related disease such as type 2 diabetes, hypertension or sleep apnoea), stage 3 (end-organ damage) to stage 4 (severe, potentially end-stage disability). It helps set priorities: a person at stage 2 with a BMI of 32 may need treatment more urgently than a person at stage 0 with a BMI of 38. [[eoss2009]]"),

        ("h2", "The global and regional picture", "burden"),
        ("p", "In 2021 an estimated 1.00 billion men and 1.11 billion women aged 25 and over were living with overweight or obesity. Since 1990, overweight and obesity have risen in every country, and global obesity prevalence has increased by 155% in men and 105% in women; by 2050 more than half of all adults are forecast to have overweight or obesity. [[gbdobesity2025]]"),
        ("box", "mena", "North Africa and the Middle East had the fastest rise of any world region: age-standardised obesity prevalence more than tripled in men and more than doubled in women between 1990 and 2021, and several countries in the region now have overweight or obesity in more than 80% of adults. [[gbdobesity2025]] The NCD Risk Factor Collaboration also places the Middle East and North Africa among the regions with the highest combined burden of underweight and obesity, with Qatar among the countries with the highest combined burden in boys. [[ncdrisc2024]]"),

        ("h2", "Case: what the BMI missed", "case"),
        ("case", {
            "title": "A 42-year-old man of Middle Eastern background",
            "parts": [
                ("Findings", "BMI 28.6 kg/m², waist 104 cm, height 172 cm. Loud snoring, daytime sleepiness, morning headaches. Blood pressure 146/92 mmHg."),
                ("Step 1", "With the lower threshold recommended for people of Middle Eastern background (27.5), his BMI is in the obesity range. Waist-to-height ratio 104 ÷ 172 = 0.60: high central adiposity. [[nice2025]]"),
                ("Step 2", "Excess adiposity is confirmed by a second measure (waist-to-height ratio). [[lancetcomm2025]]"),
                ("Step 3", "Symptoms suggest obstructive sleep apnoea, one of the Commission's criteria for clinical obesity; sleep testing confirms moderate apnoea. Diagnosis: clinical obesity, Edmonton stage 2. [[lancetcomm2025,eoss2009]]"),
                ("Teaching point", "With a European BMI threshold he would have been told he was 'only overweight'. He has a disease that needs treatment (Modules 8–11)."),
            ],
        }),

        ("h2", "Test yourself", "quiz"),
        ("mcq", [
            {"q": "According to NICE, what BMI marks obesity for people of Middle Eastern background?",
             "options": ["25", "27.5", "30", "32.5"],
             "answer": 1, "why": "NICE recommends lower thresholds for people of Middle Eastern, South Asian, Chinese, other Asian, Black African or African-Caribbean background: obesity from 27.5."},
            {"q": "A waist-to-height ratio of 0.55 indicates…",
             "options": ["Healthy central adiposity", "High central adiposity", "Increased central adiposity and increased health risk", "Underweight"],
             "answer": 2, "why": "0.5–0.59 is increased central adiposity; 0.6 or more is high."},
            {"q": "In the Lancet Commission's framework, clinical obesity means…",
             "options": ["Excess adiposity causing organ dysfunction or limits on daily activities", "BMI above 35", "Any weight gain after age 40", "Obesity with diabetes only"],
             "answer": 0, "why": "Clinical obesity is a chronic illness defined by the effects of excess adiposity on organ function or daily activities."},
            {"q": "How should excess adiposity be confirmed when BMI is near the obesity threshold?",
             "options": ["Repeat BMI", "Blood glucose", "It cannot be confirmed", "At least one more anthropometric measure or direct fat measurement"],
             "answer": 3, "why": "Waist circumference, waist-to-hip or waist-to-height ratio, or DEXA/bioimpedance."},
            {"q": "Which world region had the fastest rise in obesity prevalence between 1990 and 2021?",
             "options": ["Western Europe", "North Africa and the Middle East", "East Asia", "North America"],
             "answer": 1, "why": "Obesity prevalence more than tripled in men and more than doubled in women in North Africa and the Middle East."},
        ]),
        ("arsum", [
            "السمنة مرض مزمن ينتج عن تفاعل الجينات والبيولوجيا مع بيئة تشجع على الأكل والخمول، وليست ضعفًا في الإرادة. والوصمة بسبب الوزن تضر الصحة وتسوء بسببها الرعاية، فاستخدم لغة تضع الإنسان أولًا واستأذن قبل الحديث عن الوزن.",
            "مؤشر كتلة الجسم أداة فحص فقط. وتوصي NICE بحدود أدنى لذوي الأصول الشرق أوسطية والآسيوية والأفريقية: الوزن الزائد من 23، والسمنة من 27.5 كغ/م². ونسبة محيط الخصر إلى الطول 0.5 فأكثر تعني زيادة الدهون المركزية.",
            "تعرّف لجنة لانسيت (2025) السمنة السريرية بأنها زيادة الدهون التي تسبب خللًا في وظائف الأعضاء أو تحدّ من الأنشطة اليومية، وتُعالج كمرض. أما السمنة ما قبل السريرية فتعني زيادة الدهون مع سلامة الوظائف، وهدفها تقليل الخطر.",
            "أكّد زيادة الدهون بقياس إضافي (محيط الخصر أو نسبته إلى الطول أو الورك) أو بقياس مباشر للدهون، ثم قيّم وظائف الأعضاء. ويساعد تصنيف إدمونتون في تحديد شدة تأثر المريض.",
            "شهدت منطقة شمال أفريقيا والشرق الأوسط أسرع ارتفاع في معدلات السمنة عالميًا بين 1990 و2021، وتتجاوز نسبة زيادة الوزن والسمنة 80% من البالغين في عدة دول بالمنطقة.",
        ]),
    ],
}
