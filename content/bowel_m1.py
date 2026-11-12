# -*- coding: utf-8 -*-
"""Bowel Health series, Course 1 (chronic constipation in adults), Module 1 (open to everyone).

English text with an Arabic title, subtitle and summary. Citations use the keys in
content/courses.py SOURCES. Modules 2 to 6 live in the founder's private repository.
"""

MODULE = {
    "slug": "bowel-understanding",
    "series": "bowel",
    "number": 1,
    "en_only": True,
    "title": {"en": "Understanding chronic constipation: definitions, physiology and burden",
              "ar": "فهم الإمساك المزمن: التعريفات ووظائف الأعضاء والعبء"},
    "subtitle": {"en": "What counts as constipation, how normal defecation works and fails, the three patterns behind most cases, and why a common symptom deserves careful medicine.",
                 "ar": "ما الذي يُعدّ إمساكًا، وكيف يعمل التبرّز الطبيعي وكيف يختلّ، والأنماط الثلاثة وراء معظم الحالات، ولماذا يستحق عرض شائع رعاية طبية دقيقة."},
    "audience": {"en": "Primary care physicians, internists, residents and pharmacists",
                 "ar": "أطباء الرعاية الأولية والباطنة والأطباء المقيمون والصيادلة"},
    "minutes": 35,
    "objectives": [
        "Apply the Rome IV criteria for functional constipation and distinguish it from IBS with constipation and opioid-induced constipation.",
        "Describe how colonic transit, rectal sensation and the pelvic floor work together in normal defecation.",
        "Recognise the three main patterns: normal-transit constipation, slow-transit constipation and defecation disorders.",
        "Use the Bristol Stool Form Scale in clinic.",
        "Summarise the prevalence, cost and quality-of-life burden of chronic constipation worldwide and in the Middle East.",
        "Navigate the stepwise care pathway used throughout this course.",
    ],
    "blocks": [
        ("h2", "How this course works", "how"),
        ("p", "This is the first of four courses in the Bowel Health series. It is written for the clinicians who see most people with constipation: primary care physicians, internists, residents and pharmacists. Six modules follow one path: understand the problem (this module), make the diagnosis safely (Module 2), use diet and over-the-counter laxatives well (Module 3), choose prescription drugs (Module 4), handle constipation alongside other conditions and medicines (Module 5), and know when and how to refer (Module 6)."),
        ("p", "The evidence base is the 2023 American Gastroenterological Association–American College of Gastroenterology guideline on drug treatment, the 2025 British Dietetic Association guideline on diet, the European Society of Neurogastroenterology and Motility guideline, and the Rome IV criteria. [[agaacg2023,bda2025,esnm2020,romeiv2016]]"),
        ("figure", "careladder", ("The care pathway used throughout the course. Each later module expands one part of it.", "مسار الرعاية المستخدم في الدورة.")),

        ("h2", "What patients mean, and what doctors mean", "meaning"),
        ("p", "When patients say they are constipated, they may mean infrequent stools, hard stools, straining, a feeling of incomplete emptying, bloating or discomfort. Only a minority mean frequency alone. Asking which symptom troubles them most guides both diagnosis and treatment. [[agatech2013]]"),
        ("p", "Doctors use the Rome IV criteria. Functional constipation needs at least two of the following, present for the last 3 months with symptom onset at least 6 months before diagnosis: straining in more than a quarter of defecations; lumpy or hard stools (Bristol types 1–2) in more than a quarter; a sensation of incomplete evacuation in more than a quarter; a sensation of anorectal blockage in more than a quarter; manual manoeuvres to help in more than a quarter; and fewer than three spontaneous bowel movements a week. Loose stools are rarely present without laxatives, and the criteria for irritable bowel syndrome are not met. [[romeiv2016]]"),
        ("table", {
            "caption": "Three labels that overlap",
            "head": ["Label", "Key feature", "Practical point"],
            "rows": [
                ["Functional constipation (chronic idiopathic constipation)", "Bowel symptoms without prominent pain", "Most patients in primary care; the main subject of this course"],
                ["IBS with constipation (IBS-C)", "Recurrent abdominal pain linked to defecation, at least one day a week", "A spectrum with functional constipation; many drugs help both (Course 2)"],
                ["Opioid-induced constipation", "New or worse constipation after starting or increasing opioids", "Prevent with a laxative when opioids start; specific drugs exist (Course 3)"],
            ],
        }),
        ("box", "pearl", "Functional constipation and IBS-C are best seen as two ends of one spectrum rather than separate diseases. Patients move between them over time, and the AGA–ACG guideline notes that the two often cannot be told apart in practice. Pain is the main difference, and it matters for drug choice. [[romeiv2016,agaacg2023]]"),

        ("h2", "How normal defecation works", "physiology"),
        ("p", "The colon mixes and stores its contents for most of the day. A few times a day, often after waking and after meals, high-amplitude propagated contractions sweep contents towards the rectum. As the rectum fills, stretch receptors create the urge to defecate. To pass stool, the person raises abdominal pressure while the puborectalis muscle and external anal sphincter relax, straightening the anorectal angle and opening the canal. [[agatech2013]]"),
        ("p", "Constipation can therefore arise from three main problems: the colon moves contents too slowly; the pelvic floor and sphincter fail to relax, or even contract, during straining; or the rectum senses filling poorly. These may coexist, and many patients have normal measurements despite real symptoms. [[agatech2013,acganorectal2021]]"),
        ("table", {
            "caption": "The three main patterns",
            "head": ["Pattern", "What happens", "Clues", "Fits which treatment"],
            "rows": [
                ["Normal-transit constipation", "Transit and evacuation are normal on testing; symptoms are real", "Commonest; often overlaps with IBS-C", "Diet, laxatives, secretagogues"],
                ["Slow-transit constipation", "Fewer propulsive contractions; fewer nerves and pacemaker cells in some", "Infrequent urge; little response to fibre", "Osmotic and stimulant laxatives, prucalopride"],
                ["Defecation disorder (dyssynergia)", "Pelvic floor fails to relax or contracts when straining", "Prolonged straining, digital help, abnormal rectal exam", "Biofeedback therapy; laxatives alone often fail"],
            ],
        }),
        ("box", "adv", "In slow-transit constipation, several small studies have found fewer intrinsic colonic nerves and interstitial cells of Cajal, the pacemaker cells of the gut. In other words, some cases are not strictly 'functional'. In defecation disorders, dyssynergia can also be found in people without symptoms, which is why testing must be interpreted in context. [[agatech2013]]"),

        ("h2", "The Bristol Stool Form Scale", "bristol"),
        ("p", "Stool form reflects transit time better than stool frequency, and patients find the picture-based scale easy to use. Ask them to record it in a one- to two-week diary along with frequency, straining and laxative use. [[agatech2013]]"),
        ("table", {
            "caption": "Bristol Stool Form Scale",
            "head": ["Type", "Description", "Meaning"],
            "rows": [
                ["1", "Separate hard lumps, like nuts", "Slow transit"],
                ["2", "Sausage-shaped but lumpy", "Slow transit"],
                ["3", "Like a sausage with cracks on the surface", "Normal"],
                ["4", "Like a sausage or snake, smooth and soft", "Normal"],
                ["5", "Soft blobs with clear-cut edges", "Tending to fast"],
                ["6", "Fluffy pieces with ragged edges, mushy", "Fast transit"],
                ["7", "Watery, no solid pieces", "Fast transit"],
            ],
        }),

        ("h2", "A common problem with real costs", "burden"),
        ("p", "A meta-analysis of population studies found functional constipation in about 10% of adults using the Rome IV criteria (15% with the older Rome I criteria), roughly twice as common in women, with wide variation between countries. [[barberio2021]] The Rome Foundation Global Study of more than 73,000 adults in 33 countries found that disorders of gut–brain interaction as a group affect about 40% of internet respondents and are linked to poorer quality of life and more doctor visits. [[sperber2021]]"),
        ("p", "Quality of life in chronic constipation can be as impaired as in chronic obstructive pulmonary disease, diabetes or depression, and medical costs in the US have been estimated at about 2,000–7,500 dollars per patient per year. Many patients are dissatisfied with treatment and try several over-the-counter products before seeing a doctor. [[agaacg2023]]"),
        ("p", "Constipation is not always benign. In the US, deaths with constipation listed as a contributing cause doubled between 1999 and 2024, mostly among older people and in care institutions, where impaction can lead to stercoral colitis, perforation and sepsis. Protocol-based bowel care in high-risk settings is the response. [[usmortality2026]]"),
        ("box", "mena", "Regional data are growing. In a 2026 Saudi online survey of 1,553 adults, 24% met Rome IV symptom criteria for IBS, and about a third of them had the constipation subtype; symptoms were linked to depression, anxiety and stress. [[saudiibs2026]] After bariatric surgery in a Saudi cohort, new constipation was reported by 46% after sleeve gastrectomy. [[saudibariatric2026]] In a Saudi haemodialysis unit, 32% were constipated, and every patient ate too little fibre. [[saudihd2025]] Constipation in the region often travels with obesity, diabetes, kidney disease and their treatments, which is the thread of Module 5."),

        ("h2", "Case: what does she mean?", "case"),
        ("case", {
            "title": "A 38-year-old teacher who 'has always been constipated'",
            "parts": [
                ("Story", "Bowel movement every 2–3 days for years, hard pellets (Bristol type 1–2), straining most times and a feeling of incomplete emptying. No pain between bowel movements. She uses senna at weekends. No weight loss or bleeding."),
                ("Labels", "She meets Rome IV criteria for functional constipation (hard stools, straining, incomplete evacuation, fewer than three bowel movements a week, for years) and not IBS-C, because pain is not a feature. [[romeiv2016]]"),
                ("What next", "Her symptoms point mainly to the stool itself (hard, infrequent), but straining and incomplete emptying mean a careful rectal examination is needed to look for a defecation disorder. Module 2 continues her assessment."),
            ],
        }),

        ("h2", "Test yourself", "quiz"),
        ("mcq", [
            {"q": "Under Rome IV, which feature is part of the criteria for functional constipation?",
             "options": ["Abdominal pain at least weekly", "Manual manoeuvres to help defecation in more than a quarter of defecations", "Nocturnal diarrhoea", "Weight loss"],
             "answer": 1, "why": "Manual manoeuvres are one of the six Rome IV items; prominent pain points instead to IBS-C."},
            {"q": "Which pattern is best treated with biofeedback?",
             "options": ["Slow-transit constipation", "Normal-transit constipation", "Dyssynergic defecation", "Opioid-induced constipation"],
             "answer": 2, "why": "In dyssynergia the pelvic floor fails to relax; biofeedback retrains it, and laxatives alone often fail."},
            {"q": "Bristol type 1 stools suggest…",
             "options": ["Fast transit", "Normal transit", "Slow transit", "Malabsorption"],
             "answer": 2, "why": "Separate hard lumps reflect slow colonic transit."},
            {"q": "About what share of adults meet Rome IV criteria for functional constipation worldwide?",
             "options": ["1%", "10%", "30%", "50%"],
             "answer": 1, "why": "About 10% (pooled prevalence 10.1%), with wide variation between countries."},
            {"q": "Constipation-associated deaths in the US are concentrated in…",
             "options": ["Young athletes", "Older adults and people in care institutions", "Children", "Pregnant women"],
             "answer": 1, "why": "Most occur in older people and institutional settings, through impaction and its complications."},
        ]),
        ("arsum", [
            "يعني الإمساك للمرضى أشياء مختلفة: قلة عدد مرات التبرّز، أو صلابة البراز، أو الحاجة إلى الحزق، أو الإحساس بعدم الإفراغ التام. اسأل المريض عن أكثر عرض يزعجه.",
            "معايير روما الرابعة للإمساك الوظيفي: عرضان على الأقل (الحزق، البراز الصلب، الإحساس بعدم الإفراغ أو بالانسداد، المساعدة اليدوية في أكثر من ربع المرات، أو أقل من ثلاث مرات أسبوعيًا) لمدة ثلاثة أشهر مع بداية قبل ستة أشهر على الأقل، دون معايير القولون العصبي.",
            "هناك ثلاثة أنماط رئيسية: إمساك بعبور طبيعي، وإمساك بطيء العبور، واضطراب الإخراج (عدم تناسق عضلات قاع الحوض) الذي يُعالج بالارتجاع البيولوجي.",
            "يصيب الإمساك الوظيفي نحو 10% من البالغين، وضعف ذلك لدى النساء، ويؤثر في جودة الحياة بقدر أمراض مزمنة كبرى. وفي السعودية يرتبط كثيرًا بالقولون العصبي والسمنة وجراحاتها وأمراض الكلى.",
            "تتبع الدورة مسار رعاية متدرّجًا: التقييم والعلامات المنذرة، ثم الغذاء والعادات، فالملينات الأسموزية، فالمنبّهة، فالأدوية الموصوفة، ثم الإحالة في الحالات المعنّدة.",
        ]),
    ],
}
