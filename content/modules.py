# -*- coding: utf-8 -*-
"""
Physician Portal teaching modules (English + Arabic).
Each module becomes modules/<slug>.html and ar/modules/<slug>.html.
Edit text here, then run:  python3 build.py

Blocks (all text as (English, Arabic) pairs):
  ("h2", pair, anchor)                     numbered section heading
  ("p", pair)                              paragraph; cite with [[key]] or [[key1,key2]]
  ("ul", [pairs])                          bullet list
  ("aside", pair)                          margin note (key number, tip)
  ("rec", pair, loe, strength, consensus, source_key)
                                           graded guideline recommendation (paraphrased)
  ("table", {"caption": pair, "head": [cells], "rows": [[cells]]})
  ("figure", name, caption_pair)           a figure from FIGURES below
  ("case", {"title": pair, "parts": [(label_pair, text_pair)]})
  ("mcq", [ {"q": pair, "options": [pairs], "answer": index, "why": pair} ])
Cells are a plain string (same in both languages) or a pair.
"""

UPDATED = "2026-10-03"
NEXT_REVIEW = "2027-10"
REVIEWED = {}
VERSIONS = {}

# Extra sources (checked on PubMed). Keys from learn.py and ref.py also work.
SOURCES = {
    "angulo2015": ("Angulo P, et al. Liver fibrosis, but no other histologic features, is associated with long-term outcomes of patients with NAFLD. Gastroenterology 2015;149(2):389–97.", "https://doi.org/10.1053/j.gastro.2015.04.043"),
    "dulai2017": ("Dulai PS, et al. Increased risk of mortality by fibrosis stage in NAFLD: systematic review and meta-analysis. Hepatology 2017;65(5):1557–65.", "https://doi.org/10.1002/hep.29085"),
    "sanyal2021": ("Sanyal AJ, et al. Prospective study of outcomes in adults with NAFLD. N Engl J Med 2021;385(17):1559–69.", "https://doi.org/10.1056/NEJMoa2029349"),
    "mozes2022": ("Mózes FE, et al. Diagnostic accuracy of non-invasive tests for advanced fibrosis in patients with NAFLD: an individual patient data meta-analysis. Gut 2022;71(5):1006–19.", "https://doi.org/10.1136/gutjnl-2021-324243"),
    "mozes2023": ("Mózes FE, et al. Performance of non-invasive tests and histology for the prediction of clinical outcomes in NAFLD: an individual participant data meta-analysis. Lancet Gastroenterol Hepatol 2023;8(8):704–13.", "https://doi.org/10.1016/S2468-1253(23)00141-3"),
    "eddowes2019": ("Eddowes PJ, et al. Accuracy of FibroScan controlled attenuation parameter and liver stiffness measurement in assessing steatosis and fibrosis in NAFLD. Gastroenterology 2019;156(6):1717–30.", "https://doi.org/10.1053/j.gastro.2019.01.042"),
    "srivastava2019": ("Srivastava A, et al. Prospective evaluation of a primary care referral pathway for patients with NAFLD. J Hepatol 2019;71(2):371–8.", "https://doi.org/10.1016/j.jhep.2019.03.033"),
}

MODULES = [
{
 "slug": "fibrosis-assessment",
 "number": 1,
 "title": {"en": "Assessing liver fibrosis in MASLD", "ar": "تقييم تليّف الكبد في MASLD"},
 "subtitle": {"en": "Why fibrosis is the target, how to stage it without a biopsy, and how to act on the result.",
              "ar": "لماذا يُعد التليّف الهدف، وكيف نحدد مرحلته دون خزعة، وكيف نتصرف بناءً على النتيجة."},
 "minutes": 25,
 "audience": {"en": "Primary care physicians, internists, endocrinologists, gastroenterologists, residents",
              "ar": "أطباء الرعاية الأولية، وأطباء الباطنة، وأطباء الغدد الصماء، وأطباء الجهاز الهضمي، والأطباء المقيمون"},
 "objectives": [
  ("Explain why fibrosis stage, rather than steatosis or ALT, predicts outcomes in MASLD.", "شرح لماذا تتنبأ مرحلة التليّف، لا التشحّم ولا ALT، بمآلات المرض في MASLD."),
  ("Select patients for fibrosis assessment and apply the two-step pathway (FIB-4, then elastography or ELF).", "اختيار المرضى الذين يحتاجون إلى تقييم التليّف، وتطبيق المسار ذي الخطوتين (FIB-4 ثم قياس المرونة أو ELF)."),
  ("Interpret FIB-4, NFS, liver stiffness and ELF results, including grey-zone values and common pitfalls.", "تفسير نتائج FIB-4 وNFS وصلابة الكبد وELF، بما في ذلك القيم الرمادية ومواطن الخطأ الشائعة."),
  ("Decide on follow-up interval and referral, and recognise the limits of non-invasive tests.", "تحديد موعد المتابعة والإحالة، ومعرفة حدود الفحوص غير الجراحية."),
 ],
 "blocks": [
  ("h2", ("Why fibrosis is the target", "لماذا يُعد التليّف هو الهدف"), "why"),
  ("p", ("Most people with MASLD will never develop liver complications. The task is to find the minority who will. Across long-term biopsy cohorts, fibrosis stage is the histological feature that best predicts death and liver events; steatosis grade, ballooning and inflammation add little once fibrosis is known [[angulo2015]].",
         "معظم المصابين بـ MASLD لن يصابوا أبدًا بمضاعفات كبدية، والمهمة هي العثور على القلة الذين سيصابون بها. وفي دراسات الخزعة طويلة المدى، تُعد مرحلة التليّف السمة النسيجية الأقوى في التنبؤ بالوفاة ومضاعفات الكبد، بينما لا يضيف التشحّم أو التضخّم الخلوي أو الالتهاب شيئًا يُذكر بعد معرفة مرحلة التليّف [[angulo2015]].")),
  ("aside", ("Liver-related mortality rises steeply with stage: about 10-fold at F2, 17-fold at F3 and 42-fold at F4, compared with F0 [[dulai2017]].",
             "ترتفع الوفيات المرتبطة بالكبد بشدة مع تقدّم المرحلة: نحو 10 أضعاف عند F2، و17 ضعفًا عند F3، و42 ضعفًا عند F4، مقارنة بـ F0 [[dulai2017]].")),
  ("p", ("A meta-analysis of 1,495 patients showed that all-cause mortality increases at every stage, and liver-related mortality rises exponentially from F2 onwards [[dulai2017]]. In the prospective NASH CRN cohort of 1,773 adults, deaths rose from 0.32 per 100 person-years at F0–F2 to 0.89 at F3 and 1.76 at F4, and decompensation events clustered in F3–F4 [[sanyal2021]].",
         "أظهر تحليل تجميعي شمل 1,495 مريضًا أن الوفيات لأي سبب تزداد مع كل مرحلة، وأن الوفيات المرتبطة بالكبد ترتفع ارتفاعًا أُسيًّا بدءًا من F2 [[dulai2017]]. وفي دراسة NASH CRN الاستباقية التي شملت 1,773 بالغًا، ارتفعت الوفيات من 0.32 لكل 100 شخص-سنة في F0–F2 إلى 0.89 في F3 و1.76 في F4، وتركّزت حالات عدم المعاوضة في F3–F4 [[sanyal2021]].")),
  ("p", ("In practice, this means that the clinical question is not \"does this patient have fatty liver?\" but \"does this patient have advanced fibrosis (F3–F4), or significant fibrosis (F2) that could progress?\". Liver enzymes cannot answer it: ALT is often normal in advanced disease.",
         "عمليًا، يعني ذلك أن السؤال السريري ليس \"هل لدى المريض كبد دهني؟\" بل \"هل لديه تليّف متقدّم (F3–F4)، أو تليّف ملحوظ (F2) قد يتطور؟\". ولا تستطيع إنزيمات الكبد الإجابة عن ذلك، فكثيرًا ما يكون ALT طبيعيًا في المرض المتقدّم.")),

  ("h2", ("Whom to assess", "مَن نقيّم"), "whom"),
  ("rec", ("An incidental finding of steatosis should lead to a search for its cause and a test for advanced fibrosis.", "يجب أن يؤدي اكتشاف التشحّم صدفةً إلى البحث عن سببه وإجراء فحص للتليّف المتقدّم."), 3, "strong", "strong", "easl2024"),
  ("rec", ("Population-wide screening for steatotic liver disease is not advised.", "لا يُنصح بالمسح السكاني الشامل لأمراض الكبد التشحّمي."), 3, "strong", "strong", "easl2024"),
  ("rec", ("Case-finding for MASLD with fibrosis can be considered in people with cardiometabolic risk factors, abnormal liver enzymes or steatosis on imaging.", "يمكن النظر في البحث عن حالات MASLD المصحوبة بتليّف لدى من لديهم عوامل خطر قلبية أيضية، أو إنزيمات كبد غير طبيعية، أو تشحّم في التصوير."), 3, "weak", "consensus", "easl2024"),
  ("p", ("The highest-yield groups are adults with type 2 diabetes, obesity with at least one other metabolic risk factor, persistently raised aminotransferases, or steatosis found on imaging [[easl2024,aasld2023]]. In the Middle East, where about 7 in 10 people with type 2 diabetes have MASLD, diabetes clinics are the natural starting point [[mena2024]].",
         "أعلى الفئات مردودًا هي البالغون المصابون بالسكري من النوع الثاني، أو السمنة مع عامل خطر أيضي آخر على الأقل، أو ارتفاع مستمر في إنزيمات الكبد، أو تشحّم ظاهر في التصوير [[easl2024,aasld2023]]. وفي الشرق الأوسط، حيث يصاب نحو 7 من كل 10 مرضى سكري بـ MASLD، تُعد عيادات السكري نقطة البداية الطبيعية [[mena2024]].")),

  ("h2", ("Step 1: blood-based scores", "الخطوة 1: مؤشرات الدم"), "step1"),
  ("rec", ("Use non-invasive scores, not ALT and AST alone, to detect fibrosis.", "استخدم المؤشرات غير الجراحية، لا ALT وAST وحدهما، لكشف التليّف."), 2, "strong", "strong", "easl2024"),
  ("rec", ("Use a multi-step approach: a non-patented blood score such as FIB-4 first, then elastography if fibrosis is still suspected or the patient is high risk.", "اتبع نهجًا متعدد الخطوات: مؤشر دم غير محمي ببراءة مثل FIB-4 أولًا، ثم قياس المرونة إذا ظل التليّف مشتبهًا أو كان المريض عالي الخطورة."), 2, "strong", "strong", "easl2024"),
  ("p", ("FIB-4 needs only age, AST, ALT and platelets, so it can be calculated for every patient in primary care. NFS adds BMI, glycaemic status and albumin. In an individual patient data meta-analysis of 5,735 biopsied patients, the AUROC for advanced fibrosis was 0.76 for FIB-4 and 0.73 for NFS [[mozes2022]]. Their strength is a high negative predictive value: a low score reliably rules out advanced fibrosis.",
         "يحتاج FIB-4 إلى العمر وAST وALT والصفائح فقط، لذا يمكن حسابه لكل مريض في الرعاية الأولية. ويضيف NFS مؤشر كتلة الجسم وحالة السكر والألبومين. وفي تحليل تجميعي لبيانات فردية شمل 5,735 مريضًا بخزعة، بلغت المساحة تحت المنحنى (AUROC) للتليّف المتقدّم 0.76 لـ FIB-4 و0.73 لـ NFS [[mozes2022]]. وقوتهما في القيمة التنبؤية السلبية المرتفعة: فالنتيجة المنخفضة تنفي التليّف المتقدّم بدرجة موثوقة.")),
  ("table", {"caption": ("Table 1. Blood-based scores: formulas and cut-offs for advanced fibrosis", "الجدول 1. مؤشرات الدم: المعادلات وحدود التليّف المتقدّم"),
             "head": [("Score", "المؤشر"), ("Formula", "المعادلة"), ("Rule out", "النفي"), ("Rule in", "الإثبات")],
             "rows": [
              ["FIB-4", ("(age × AST) ÷ (platelets × √ALT)", "(العمر × AST) ÷ (الصفائح × √ALT)"), ("<1.3; <2.0 if age ≥65", "<1.3؛ و<2.0 لمن ≥65 سنة"), "≥2.67"],
              ["NFS", ("−1.675 + 0.037×age + 0.094×BMI + 1.13×IFG/diabetes + 0.99×AST/ALT − 0.013×platelets − 0.66×albumin (g/dL)", "−1.675 + 0.037×العمر + 0.094×مؤشر الكتلة + 1.13×السكري + 0.99×AST/ALT − 0.013×الصفائح − 0.66×الألبومين (غ/دل)"), ("<−1.455; <0.12 if age ≥65", "<−1.455؛ و<0.12 لمن ≥65 سنة"), ">0.676"],
             ]}),
  ("aside", ("Both scores rise with age. Using the standard cut-off in people aged 65 or over cuts specificity to 35% for FIB-4 and 20% for NFS; the age-adjusted cut-offs restore it to about 70% [[mcpherson]].",
             "يرتفع المؤشران مع العمر. واستخدام الحد المعتاد لمن هم 65 سنة فأكثر يخفض النوعية إلى 35% لـ FIB-4 و20% لـ NFS، بينما تعيدها الحدود المعدّلة حسب العمر إلى نحو 70% [[mcpherson]].")),
  ("p", ("Two age limits matter. Under 35, both scores perform poorly and should not be relied upon; go directly to elastography if concerned. At 65 or over, use the higher rule-out cut-offs to avoid over-referral [[mcpherson]]. You can calculate both scores in the Physician Portal.",
         "هناك حدّان عمريان مهمان. تحت 35 سنة يكون أداء المؤشرين ضعيفًا ولا ينبغي الاعتماد عليهما، فانتقل مباشرة إلى قياس المرونة عند القلق. ومن عمر 65 فأكثر استخدم حدود النفي الأعلى لتجنّب الإحالات الزائدة [[mcpherson]]. ويمكنك حساب المؤشرين في بوابة الأطباء.")),

  ("h2", ("Step 2: elastography or ELF", "الخطوة 2: قياس المرونة أو ELF"), "step2"),
  ("rec", ("Blood scores and elastography should be used to exclude advanced fibrosis; elastography is better suited to confirm it.", "تُستخدم مؤشرات الدم وقياس المرونة لنفي التليّف المتقدّم، بينما قياس المرونة أنسب لإثباته."), 2, "strong", "consensus", "easl2024"),
  ("rec", ("Collagen-turnover blood tests such as ELF can be used instead of imaging to identify advanced fibrosis.", "يمكن استخدام فحوص الدم المرتبطة بتجدد الكولاجين مثل ELF بدلًا من التصوير لتحديد التليّف المتقدّم."), 2, "open", "consensus", "easl2024"),
  ("p", ("Vibration-controlled transient elastography (VCTE, FibroScan) measures liver stiffness in kPa. In a prospective study of 450 patients, liver stiffness identified F≥3 with an AUROC of 0.80 and cirrhosis with 0.89 [[eddowes2019]]. In the pooled IPD analysis its AUROC for advanced fibrosis was 0.85, clearly better than blood scores [[mozes2022]]. The guideline cut-offs are below 8 kPa (low risk), 8–12 kPa (grey zone) and 12 kPa or more (high risk) [[easl2024,aasld2023]].",
         "يقيس قياس المرونة العابر بالاهتزاز (VCTE، فيبروسكان) صلابة الكبد بالكيلوباسكال. وفي دراسة استباقية شملت 450 مريضًا، حددت الصلابة F≥3 بمساحة تحت المنحنى 0.80 والتشمّع بـ 0.89 [[eddowes2019]]. وفي التحليل التجميعي للبيانات الفردية بلغت مساحتها للتليّف المتقدّم 0.85، أي أفضل بوضوح من مؤشرات الدم [[mozes2022]]. والحدود في الإرشادات: أقل من 8 كيلوباسكال (خطر منخفض)، و8–12 (منطقة رمادية)، و12 فأكثر (خطر مرتفع) [[easl2024,aasld2023]].")),
  ("table", {"caption": ("Table 2. Second-line tests", "الجدول 2. فحوص الخط الثاني"),
             "head": [("Test", "الفحص"), ("Low risk", "خطر منخفض"), ("High risk", "خطر مرتفع"), ("Practical notes", "ملاحظات عملية")],
             "rows": [
              [("VCTE liver stiffness", "صلابة الكبد بـ VCTE"), "<8 kPa", "≥12 kPa", ("Fast 3 h; XL probe if obese; valid if IQR/median ≤30%; ≥15 kPa suggests compensated advanced chronic liver disease", "صيام 3 ساعات؛ المجس XL مع السمنة؛ صالح إذا كان IQR/الوسيط ≤30%؛ و≥15 يشير إلى مرض كبدي مزمن متقدّم معاوَض")],
              ["ELF", "<7.7", "≥9.8", ("Laboratory test; useful where elastography is unavailable; rises with age and other fibrotic diseases", "فحص مخبري؛ مفيد عند عدم توفر قياس المرونة؛ يرتفع مع العمر وأمراض تليّفية أخرى")],
              [("MR elastography", "المرونة بالرنين"), ("centre-specific", "حسب المركز"), ("centre-specific", "حسب المركز"), ("Most accurate imaging test; costly and less available", "أدق فحص تصويري؛ مكلف وأقل توفرًا")],
             ]}),
  ("aside", ("Liver stiffness is falsely raised by a recent meal, ALT above about five times normal, heart failure, cholestasis and recent heavy drinking. Repeat the scan when the cause has settled.",
             "ترتفع صلابة الكبد كذبًا بعد وجبة حديثة، أو مع ALT أعلى من نحو خمسة أضعاف الطبيعي، أو قصور القلب، أو الركود الصفراوي، أو تناول كحول كثير مؤخرًا. أعد الفحص بعد زوال السبب.")),

  ("h2", ("The pathway in practice", "المسار عمليًا"), "pathway"),
  ("figure", "pathway", ("Figure 1. Two-step fibrosis pathway for adults with MASLD, based on EASL–EASD–EASO 2024 and AASLD 2023.", "الشكل 1. مسار تقييم التليّف على خطوتين للبالغين المصابين بـ MASLD، وفق EASL–EASD–EASO 2024 وAASLD 2023.")),
  ("rec", ("Care pathways that apply blood scores and imaging in sequence can be adopted, since most adults with MASLD are seen outside hepatology.", "يمكن اعتماد مسارات رعاية تطبّق مؤشرات الدم ثم التصوير بالتتابع، لأن معظم البالغين المصابين بـ MASLD يُتابَعون خارج عيادات الكبد."), 2, "weak", "strong", "easl2024"),
  ("p", ("Sequencing works. In the IPD meta-analysis, FIB-4 followed by liver stiffness classified most patients, with about a third left indeterminate [[mozes2022]]. In a UK primary care pathway using FIB-4 then ELF, five times more cases of advanced fibrosis and cirrhosis were detected, while unnecessary referrals to hospital fell by 81% [[srivastava2019]].",
         "التطبيق المتتابع ناجح. ففي التحليل التجميعي للبيانات الفردية صنّف FIB-4 متبوعًا بقياس الصلابة معظم المرضى، وبقي نحو الثلث في المنطقة غير الحاسمة [[mozes2022]]. وفي مسار للرعاية الأولية في المملكة المتحدة استخدم FIB-4 ثم ELF، اكتُشف عدد أكبر بخمس مرات من حالات التليّف المتقدّم والتشمّع، وانخفضت الإحالات غير الضرورية إلى المستشفى بنسبة 81% [[srivastava2019]].")),

  ("h2", ("Limits of non-invasive tests", "حدود الفحوص غير الجراحية"), "limits"),
  ("rec", ("Non-invasive tests cannot assess ballooning or lobular inflammation.", "لا تستطيع الفحوص غير الجراحية تقييم التضخّم الخلوي أو الالتهاب الفصيصي."), 2, None, "strong", "easl2024"),
  ("rec", ("Most patients do not need a liver biopsy, but biopsy remains the only way to diagnose steatohepatitis with certainty and can rule out other liver diseases.", "معظم المرضى لا يحتاجون إلى خزعة كبد، لكنها تظل الوسيلة الوحيدة لتشخيص التهاب الكبد الدهني بيقين، ويمكنها استبعاد أمراض الكبد الأخرى."), 1, None, "strong", "easl2024"),
  ("p", ("Consider biopsy when non-invasive results disagree, when another or a second liver disease is suspected, or within a clinical trial. Remember that a low score in a patient with clinical, laboratory or imaging signs of cirrhosis does not exclude it.",
         "فكّر في الخزعة عند تعارض نتائج الفحوص غير الجراحية، أو عند الاشتباه في مرض كبدي آخر أو مصاحب، أو ضمن تجربة سريرية. وتذكّر أن النتيجة المنخفضة لدى مريض لديه علامات سريرية أو مخبرية أو تصويرية للتشمّع لا تنفيه.")),

  ("h2", ("Follow-up over time", "المتابعة عبر الزمن"), "followup"),
  ("rec", ("Non-invasive tests may be repeated in an individual to follow fibrosis progression, but tell you little about treatment response.", "يمكن تكرار الفحوص غير الجراحية لدى المريض لمتابعة تطور التليّف، لكنها لا تخبرك كثيرًا عن الاستجابة للعلاج."), 5, "weak", "strong", "easl2024"),
  ("p", ("Non-invasive tests also predict outcomes: over a median of almost five years, liver stiffness, FIB-4 and NFS predicted liver events about as well as biopsy [[mozes2023]]. Repeat a low-risk FIB-4 every 1–3 years (EASL); AASLD suggests every 1–2 years with diabetes or two or more metabolic risk factors, and every 2–3 years otherwise [[easl2024,aasld2023]]. Patients in the grey zone need a repeat second-line test in about a year or specialist review.",
         "تتنبأ الفحوص غير الجراحية أيضًا بالمآلات: فخلال متابعة وسيطها نحو خمس سنوات، تنبأت صلابة الكبد وFIB-4 وNFS بالمضاعفات الكبدية بدقة مقاربة للخزعة [[mozes2023]]. أعد FIB-4 منخفض الخطورة كل 1–3 سنوات (EASL)، وتقترح AASLD كل 1–2 سنة مع السكري أو وجود عاملين أيضيين أو أكثر، وكل 2–3 سنوات في غير ذلك [[easl2024,aasld2023]]. ويحتاج مرضى المنطقة الرمادية إلى إعادة فحص الخط الثاني بعد نحو سنة أو مراجعة لدى المختص.")),

  ("h2", ("Our region", "منطقتنا"), "region"),
  ("p", ("In a survey of 584 physicians from Saudi Arabia, Egypt and Türkiye, 81–84% of specialists but only 38–51% of non-specialists reported following society guidelines [[menaknow2025]]. With MASLD affecting about 4 in 10 adults in the region [[mena2024]], the biggest gain will come from making FIB-4 routine in primary care and diabetes clinics, with clear access to elastography.",
         "في استبيان شمل 584 طبيبًا من السعودية ومصر وتركيا، أفاد 81–84% من المختصين و38–51% فقط من غير المختصين باتباعهم إرشادات الجمعيات العلمية [[menaknow2025]]. ومع إصابة نحو 4 من كل 10 بالغين في المنطقة بـ MASLD [[mena2024]]، فإن المكسب الأكبر سيأتي من جعل FIB-4 روتينيًا في الرعاية الأولية وعيادات السكري، مع إتاحة واضحة لقياس المرونة.")),

  ("h2", ("Clinical case", "حالة سريرية"), "case"),
  ("case", {"title": ("A 52-year-old man with type 2 diabetes", "رجل عمره 52 عامًا مصاب بالسكري من النوع الثاني"),
            "parts": [
             (("Presentation", "العرض"), ("Seen in a diabetes clinic in Riyadh. BMI 33 kg/m², HbA1c 7.8%, on metformin. Ultrasound shows a bright liver. AST 42 U/L, ALT 48 U/L, platelets 210 ×10⁹/L. He drinks no alcohol; hepatitis B and C serology are negative.", "يُتابَع في عيادة سكري بالرياض. مؤشر الكتلة 33 كغ/م²، وHbA1c ‏7.8%، ويتناول الميتفورمين. تُظهر الأشعة الصوتية كبدًا ساطعًا. AST ‏42 وحدة/ل، وALT ‏48 وحدة/ل، والصفائح 210 ×10⁹/ل. لا يتناول الكحول، وفحوص التهاب الكبد B وC سلبية.")),
             (("Step 1", "الخطوة 1"), ("FIB-4 = (52 × 42) ÷ (210 × √48) = 1.50. This is indeterminate (1.3–2.67), so a second-line test is needed.", "FIB-4 = (52 × 42) ÷ (210 × √48) = 1.50، وهي نتيجة غير حاسمة (1.3–2.67)، لذا يلزم فحص من الخط الثاني.")),
             (("Step 2", "الخطوة 2"), ("VCTE (XL probe, fasting): liver stiffness 10.8 kPa, IQR/median 18%. This is in the grey zone (8–12 kPa).", "VCTE (بالمجس XL وبعد الصيام): الصلابة 10.8 كيلوباسكال، وIQR/الوسيط 18%، وهي في المنطقة الرمادية (8–12).")),
             (("Next step", "الخطوة التالية"), ("ELF is 10.1 (≥9.8, high risk). Together the results suggest at least significant fibrosis, probably F2–F3, without cirrhosis. He is referred to hepatology.", "نتيجة ELF ‏10.1 (≥9.8، خطر مرتفع). وتشير النتائج مجتمعة إلى تليّف ملحوظ على الأقل، غالبًا F2–F3، دون تشمّع. يُحال إلى طبيب الكبد.")),
             (("Teaching points", "نقاط تعليمية"), ("A normal-looking ALT and an \"only fatty\" ultrasound did not exclude significant fibrosis. If the hepatologist confirms at-risk MASH, semaglutide 2.4 mg could treat his obesity, diabetes and liver together where it is approved (AASLD 2025 guidance), alongside lifestyle change and a statin. Note that EASL 2024, written before the semaglutide phase 3 trial, did not yet recommend GLP-1 drugs as liver treatment. See Module 2.", "لم يستبعد ALT شبه الطبيعي ولا وصف الأشعة بأنه \"دهون فقط\" وجود تليّف ملحوظ. وإذا أكّد طبيب الكبد وجود MASH عالي الخطورة، فقد يعالج السيماغلوتايد 2.4 ملغ السمنة والسكري والكبد معًا حيث يكون معتمدًا (إرشادات AASLD لعام 2025)، إلى جانب تعديل نمط الحياة وستاتين. ولاحظ أن إرشادات EASL لعام 2024، التي صدرت قبل تجربة المرحلة الثالثة للسيماغلوتايد، لم توصِ بعدُ بأدوية GLP-1 علاجًا للكبد. راجع الوحدة 2.")),
            ]}),

  ("h2", ("Test yourself", "اختبر نفسك"), "quiz"),
  ("mcq", [
   {"q": ("A 70-year-old woman with MASLD has FIB-4 of 1.8. What is the best interpretation?", "امرأة عمرها 70 عامًا مصابة بـ MASLD ونتيجة FIB-4 لديها 1.8. ما أفضل تفسير؟"),
    "options": [("Indeterminate: arrange elastography", "غير حاسمة: رتّب لقياس المرونة"), ("Low risk: the age-adjusted cut-off of 2.0 applies", "خطر منخفض: ينطبق الحد المعدّل حسب العمر وهو 2.0"), ("High risk: refer to hepatology", "خطر مرتفع: أحِل إلى طبيب الكبد"), ("Not interpretable at this age", "لا يمكن تفسيرها في هذا العمر")],
    "answer": 1,
    "why": ("From age 65, the rule-out cut-off for FIB-4 is 2.0, which restores specificity without losing much sensitivity.", "من عمر 65 يصبح حد النفي لـ FIB-4 هو 2.0، وهذا يعيد النوعية دون فقدان كبير للحساسية.")},
   {"q": ("Which histological feature best predicts long-term outcomes in MASLD?", "أي سمة نسيجية تتنبأ بأفضل صورة بالمآلات طويلة المدى في MASLD؟"),
    "options": [("Steatosis grade", "درجة التشحّم"), ("Lobular inflammation", "الالتهاب الفصيصي"), ("Fibrosis stage", "مرحلة التليّف"), ("Hepatocyte ballooning", "التضخّم الخلوي")],
    "answer": 2,
    "why": ("In long-term biopsy cohorts, fibrosis stage was the only histological feature independently linked to death, transplant and liver events.", "في دراسات الخزعة طويلة المدى كانت مرحلة التليّف السمة النسيجية الوحيدة المرتبطة باستقلال بالوفاة والزراعة ومضاعفات الكبد.")},
   {"q": ("FIB-4 is 1.6 and liver stiffness is 9.5 kPa. What next?", "نتيجة FIB-4 هي 1.6 والصلابة 9.5 كيلوباسكال. ما الخطوة التالية؟"),
    "options": [("Reassure and repeat in 3 years", "طمأنة وإعادة الفحص بعد 3 سنوات"), ("Start resmetirom", "بدء الريسميتيروم"), ("Grey zone: ELF, MR elastography or specialist review", "منطقة رمادية: ELF أو المرونة بالرنين أو مراجعة لدى المختص"), ("Liver biopsy for everyone in this group", "خزعة كبد لكل من في هذه الفئة")],
    "answer": 2,
    "why": ("8–12 kPa is the grey zone. A further test or specialist review is needed before deciding on treatment or reassurance.", "تُعد 8–12 كيلوباسكال منطقة رمادية، ويلزم فحص إضافي أو مراجعة لدى المختص قبل تقرير العلاج أو الطمأنة.")},
   {"q": ("Which of these does NOT falsely raise liver stiffness?", "أيّ مما يلي لا يرفع صلابة الكبد كذبًا؟"),
    "options": [("Eating 30 minutes before the scan", "تناول الطعام قبل الفحص بـ 30 دقيقة"), ("ALT of 400 U/L", "ALT بقيمة 400 وحدة/ل"), ("Right heart failure", "قصور القلب الأيمن"), ("Using the XL probe in a patient with BMI 36", "استخدام المجس XL لمريض مؤشر كتلته 36")],
    "answer": 3,
    "why": ("The XL probe is the correct probe for obese patients. Food, acute hepatitis and congestion all raise stiffness.", "المجس XL هو الصحيح لمرضى السمنة، أما الطعام والتهاب الكبد الحاد والاحتقان فكلها ترفع الصلابة.")},
   {"q": ("Why is FIB-4 used as the first step rather than elastography?", "لماذا يُستخدم FIB-4 خطوةً أولى بدلًا من قياس المرونة؟"),
    "options": [("It is more accurate than elastography", "لأنه أدق من قياس المرونة"), ("It is cheap, available everywhere and reliably rules out advanced fibrosis", "لأنه رخيص ومتوفر في كل مكان وينفي التليّف المتقدّم بموثوقية"), ("It stages steatohepatitis", "لأنه يحدد مرحلة التهاب الكبد الدهني"), ("It replaces the need for follow-up", "لأنه يغني عن المتابعة")],
    "answer": 1,
    "why": ("FIB-4 is less accurate than elastography but costs almost nothing and has a high negative predictive value, so it filters out most low-risk patients.", "FIB-4 أقل دقة من قياس المرونة، لكنه لا يكلف شيئًا تقريبًا وقيمته التنبؤية السلبية مرتفعة، لذا يستبعد معظم المرضى منخفضي الخطورة.")},
  ]),

  ("h2", ("Key messages", "الرسائل الأساسية"), "summary"),
  ("ul", [
   ("Fibrosis stage, not steatosis or ALT, drives prognosis in MASLD.", "مرحلة التليّف، لا التشحّم ولا ALT، هي ما يحدد مآل MASLD."),
   ("Assess people with diabetes, obesity plus a metabolic risk factor, raised enzymes or steatosis on imaging. Do not screen everyone.", "قيّم المصابين بالسكري، أو السمنة مع عامل خطر أيضي، أو ارتفاع الإنزيمات، أو التشحّم في التصوير، ولا تفحص الجميع."),
   ("FIB-4 first (<1.3, or <2.0 at age 65+, is low risk), then elastography (<8 low, 8–12 grey, ≥12 kPa high) or ELF.", "FIB-4 أولًا (أقل من 1.3، أو أقل من 2.0 لمن 65 فأكثر، خطر منخفض)، ثم قياس المرونة (<8 منخفض، و8–12 رمادي، و≥12 مرتفع) أو ELF."),
   ("Do not use FIB-4 or NFS under age 35; beware of false-high stiffness.", "لا تستخدم FIB-4 أو NFS تحت سن 35، واحذر من الصلابة المرتفعة كذبًا."),
   ("Repeat low-risk tests every 1–3 years; refer high-risk patients.", "أعد الفحوص منخفضة الخطورة كل 1–3 سنوات، وأحِل المرضى عاليي الخطورة."),
  ]),
 ],
},
]

# ------------------------------------------------------------------ modules 2-5 (one file each)
import importlib as _il  # noqa: E402
for _name in ("modules_m2", "modules_m3", "modules_m4", "modules_m5"):
    _m = _il.import_module(_name)
    for _k, _v in _m.SOURCES.items():
        if _k in SOURCES and SOURCES[_k][1] != _v[1]:
            raise ValueError("source key clash: " + _k)
        SOURCES.setdefault(_k, _v)
    MODULES.append(_m.MODULE)

# ------------------------------------------------------------------ figures
# Language-neutral numbers sit outside the language groups.
FIGURES = {
"pathway": """<svg class="fig-svg" viewBox="0 0 760 470" role="img" aria-labelledby="fig1-title">
<title id="fig1-title"><tspan data-lang="en">Two-step fibrosis pathway</tspan><tspan data-lang="ar">مسار تقييم التليّف على خطوتين</tspan></title>
<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#0F2B2C"/></marker></defs>
<g fill="none" stroke="#0F2B2C" stroke-width="1.6">
 <rect x="230" y="12" width="300" height="56" rx="8" fill="#fff"/>
 <rect x="230" y="110" width="300" height="56" rx="8" fill="#E3EFEC" stroke="#155E5C"/>
 <rect x="20" y="214" width="290" height="70" rx="8" fill="#E2F2EB" stroke="#3E9C7B"/>
 <rect x="450" y="214" width="290" height="56" rx="8" fill="#E3EFEC" stroke="#155E5C"/>
 <rect x="20" y="370" width="230" height="84" rx="8" fill="#E2F2EB" stroke="#3E9C7B"/>
 <rect x="265" y="370" width="230" height="84" rx="8" fill="#FBF1D9" stroke="#E0B43C"/>
 <rect x="510" y="370" width="230" height="84" rx="8" fill="#F6E3E2" stroke="#A3423E"/>
 <path d="M380 68 V108" marker-end="url(#arr)"/>
 <path d="M300 166 V190 H165 V212" marker-end="url(#arr)"/>
 <path d="M460 166 V190 H595 V212" marker-end="url(#arr)"/>
 <path d="M595 270 V310"/>
 <path d="M135 310 H625"/>
 <path d="M135 310 V368" marker-end="url(#arr)"/>
 <path d="M380 310 V368" marker-end="url(#arr)"/>
 <path d="M625 310 V368" marker-end="url(#arr)"/>
</g>
<g font-size="13" fill="#0F2B2C" text-anchor="middle" font-weight="600" stroke="#FFFFFF" stroke-width="5" paint-order="stroke" style="direction:ltr;unicode-bidi:isolate">
 <text x="200" y="195">FIB-4 &lt;1.3 (≥65 y: &lt;2.0)</text>
 <text x="560" y="195">FIB-4 ≥1.3</text>
 <text x="135" y="344">&lt;8 kPa | ELF &lt;7.7</text>
 <text x="380" y="344">8–12 kPa</text>
 <text x="625" y="344">≥12 kPa | ELF ≥9.8</text>
</g>
<g data-lang="en" font-size="15" fill="#0F2B2C" text-anchor="middle">
 <text x="380" y="36" font-weight="600">Adult with MASLD</text><text x="380" y="56" font-size="13">or cardiometabolic risk factors</text>
 <text x="380" y="134" font-weight="600">Step 1: FIB-4</text><text x="380" y="154" font-size="13">(or NFS) from routine blood tests</text>
 <text x="165" y="240" font-weight="600">Low risk</text><text x="165" y="260" font-size="13">Primary care: treat risk factors</text><text x="165" y="276" font-size="13">Repeat FIB-4 in 1–3 years</text>
 <text x="595" y="238" font-weight="600">Step 2: liver stiffness</text><text x="595" y="258" font-size="13">VCTE, or ELF if unavailable</text>
 <text x="135" y="396" font-weight="600">Low risk</text><text x="135" y="416" font-size="13">Primary care follow-up</text><text x="135" y="434" font-size="13">Repeat in 1–3 years</text>
 <text x="380" y="396" font-weight="600">Grey zone</text><text x="380" y="416" font-size="13">ELF, MR elastography</text><text x="380" y="434" font-size="13">or specialist review</text>
 <text x="625" y="396" font-weight="600">High risk</text><text x="625" y="416" font-size="13">Refer to hepatology</text><text x="625" y="434" font-size="13">≥15 kPa: assess for cACLD</text>
</g>
<g data-lang="ar" font-size="16" fill="#0F2B2C" text-anchor="middle" direction="rtl">
 <text x="380" y="36" font-weight="600">بالغ مصاب بـ MASLD</text><text x="380" y="57" font-size="14">أو لديه عوامل خطر قلبية أيضية</text>
 <text x="380" y="134" font-weight="600">الخطوة 1: FIB-4</text><text x="380" y="155" font-size="14">(أو NFS) من تحاليل الدم الروتينية</text>
 <text x="165" y="240" font-weight="600">خطر منخفض</text><text x="165" y="261" font-size="14">الرعاية الأولية: علاج عوامل الخطر</text><text x="165" y="278" font-size="14">إعادة FIB-4 بعد 1–3 سنوات</text>
 <text x="595" y="238" font-weight="600">الخطوة 2: صلابة الكبد</text><text x="595" y="259" font-size="14">VCTE، أو ELF عند عدم توفره</text>
 <text x="135" y="396" font-weight="600">خطر منخفض</text><text x="135" y="417" font-size="14">متابعة في الرعاية الأولية</text><text x="135" y="436" font-size="14">إعادة بعد 1–3 سنوات</text>
 <text x="380" y="396" font-weight="600">منطقة رمادية</text><text x="380" y="417" font-size="14">ELF أو المرونة بالرنين</text><text x="380" y="436" font-size="14">أو مراجعة لدى المختص</text>
 <text x="625" y="396" font-weight="600">خطر مرتفع</text><text x="625" y="417" font-size="14">الإحالة إلى طبيب الكبد</text><text x="625" y="436" font-size="14">≥15: تقييم المرض المتقدّم</text>
</g>
</svg>""",
}
