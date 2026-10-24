/* ============================================================
   Metabolic Liver Academy – calculator hub (calculators.html)
   Every formula below is copied from its original paper; the
   source is printed under each calculator. Nothing typed is
   stored or sent. Checked by tests/test_calcs.py.
   ============================================================ */
(function () {
  'use strict';
  var AR = document.documentElement.lang === 'ar';
  function t(en, ar) { return AR ? ar : en; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fx(n, d) { return Number(n).toFixed(d); }
  function logistic(x) { return 1 / (1 + Math.exp(-x)); }
  var YESNO = [['1', 'Yes', 'نعم'], ['0', 'No', 'لا']];
  var SEX = [['1', 'Male', 'ذكر'], ['0', 'Female', 'أنثى']];

  /* Field kinds: n = number (optional units [code, label, factor to base unit]), s = select.
     opt: true = may be left empty. */
  var F = {
    age: { k: 'n', en: 'Age', ar: 'العمر', unit: 'years', unitAr: 'سنة', min: 18, max: 100 },
    sex: { k: 's', en: 'Sex', ar: 'الجنس', opts: SEX },
    dm: { k: 's', en: 'Type 2 diabetes', ar: 'السكري من النوع الثاني', opts: YESNO },
    wt: { k: 'n', en: 'Weight', ar: 'الوزن', unit: 'kg', unitAr: 'كغ', min: 25, max: 350 },
    ht: { k: 'n', en: 'Height', ar: 'الطول', unit: 'cm', unitAr: 'سم', min: 100, max: 230 },
    waist: { k: 'n', en: 'Waist', ar: 'محيط الخصر', unit: 'cm', unitAr: 'سم', min: 40, max: 250 },
    ast: { k: 'n', en: 'AST', ar: 'AST', unit: 'U/L', min: 3, max: 2000 },
    alt: { k: 'n', en: 'ALT', ar: 'ALT', unit: 'U/L', min: 3, max: 2000 },
    ggt: { k: 'n', en: 'GGT', ar: 'GGT', unit: 'U/L', min: 3, max: 3000 },
    plt: { k: 'n', en: 'Platelets', ar: 'الصفائح الدموية', unit: '×10⁹/L', min: 10, max: 1000 },
    tg: { k: 'n', en: 'Triglycerides', ar: 'الدهون الثلاثية', units: [['mg', 'mg/dL', 1], ['mmol', 'mmol/L', 88.57]], min: 20, max: 3000 },
    glu: { k: 'n', en: 'Fasting glucose', ar: 'سكر الصيام', units: [['mmol', 'mmol/L', 1], ['mg', 'mg/dL', 1 / 18]], min: 2, max: 40 },
    ins: { k: 'n', en: 'Fasting insulin', ar: 'إنسولين الصيام', unit: 'µU/mL', min: 0.5, max: 300 },
    lsm: { k: 'n', en: 'Liver stiffness (LSM)', ar: 'صلابة الكبد (LSM)', unit: 'kPa', min: 1.5, max: 75 },
    cap: { k: 'n', en: 'CAP', ar: 'CAP', unit: 'dB/m', min: 100, max: 400 },
    capOpt: { k: 'n', en: 'CAP (optional)', ar: 'CAP (اختياري)', unit: 'dB/m', min: 100, max: 400, opt: true, key: 'cap' },
    iqr: { k: 'n', en: 'IQR/median (optional)', ar: 'IQR/الوسيط (اختياري)', unit: '%', min: 0, max: 100, opt: true },
    pltOpt: { k: 'n', en: 'Platelets (optional)', ar: 'الصفائح (اختياري)', unit: '×10⁹/L', min: 10, max: 1000, opt: true, key: 'plt' },
    waistOpt: { k: 'n', en: 'Waist (optional)', ar: 'محيط الخصر (اختياري)', unit: 'cm', unitAr: 'سم', min: 40, max: 250, opt: true, key: 'waist' }
  };
  function bmiOf(v) { return v.wt / Math.pow(v.ht / 100, 2); }
  function band3(x, lowBelow, highFrom, lowIncl) {
    if (lowIncl ? x <= lowBelow : x < lowBelow) return 'low';
    return x >= highFrom ? 'high' : 'mid';
  }

  var GROUPS = [
    ['fib', 'Fibrosis: blood tests', 'التليّف: تحاليل الدم'],
    ['scan', 'Fibrosis: with FibroScan', 'التليّف: مع الفيبروسكان'],
    ['fat', 'Fat in the liver', 'الدهون في الكبد'],
    ['met', 'Metabolic health', 'الصحة الأيضية']
  ];

  /* Calculators shown elsewhere (kept where they are, linked from the hub) */
  var LINKED = [
    { g: 'fib', href: 'academy.html#fib4', en: 'FIB-4 index', ar: 'مؤشر FIB-4', kind: ['First-line test', 'الفحص الأول'],
      one: ['Age, AST, ALT and platelets. The first step for every adult at risk.', 'العمر وAST وALT والصفائح. الخطوة الأولى لكل بالغ معرّض للخطر.'],
      src: 'Sterling RK et al. Hepatology 2006;43:1317–25' },
    { g: 'fib', href: 'academy.html#nfs', en: 'NAFLD fibrosis score (NFS)', ar: 'مؤشر التليّف NFS', kind: ['First-line test', 'الفحص الأول'],
      one: ['An alternative to FIB-4 when BMI and albumin are at hand.', 'بديل لـ FIB-4 عند توفر مؤشر كتلة الجسم والألبومين.'],
      src: 'Angulo P et al. Hepatology 2007;45:846–54' }
  ];

  var CALCS = [
    {
      id: 'agile3', g: 'scan', en: 'Agile 3+', ar: 'Agile 3+', kind: ['Advanced fibrosis (F3–F4)', 'التليّف المتقدّم (F3–F4)'],
      one: ['FibroScan stiffness plus routine bloods. Fewer "grey zone" results than stiffness alone.', 'صلابة الفيبروسكان مع تحاليل روتينية، ونتائج رمادية أقل من الصلابة وحدها.'],
      fields: ['lsm', 'ast', 'alt', 'plt', 'dm', 'sex', 'age'],
      calc: function (v) {
        var p = logistic(-3.92368 + 2.29714 * Math.log(v.lsm) - 0.00902 * v.plt - 0.98633 * (v.alt / v.ast) +
          1.08636 * v.dm - 0.38581 * v.sex + 0.03018 * v.age);
        var b = band3(p, 0.451, 0.679);
        return {
          score: fx(p, 3), cls: b,
          head: b === 'low' ? t('Advanced fibrosis unlikely', 'التليّف المتقدّم غير مرجّح') : b === 'high' ? t('Advanced fibrosis likely', 'التليّف المتقدّم مرجّح') : t('Indeterminate', 'نتيجة غير حاسمة'),
          body: b === 'low' ? t('Guidelines suggest managing metabolic risk and reassessing in 1 to 3 years.', 'توصي الإرشادات بعلاج عوامل الخطر الأيضية وإعادة التقييم خلال سنة إلى ثلاث سنوات.') :
            b === 'high' ? t('Guidelines suggest follow-up in a liver clinic, review of eligibility for MASH treatment, and assessment for cirrhosis (Agile 4).', 'توصي الإرشادات بالمتابعة في عيادة الكبد، ومراجعة الأهلية لعلاج MASH، وتقييم التليّف الكامل (Agile 4).') :
            t('Guidelines suggest a further test (for example ELF or MR elastography) or specialist review.', 'توصي الإرشادات بفحص إضافي (مثل ELF أو مرونة الكبد بالرنين) أو مراجعة اختصاصي.'),
          cut: t('Rule out below 0.451; rule in at 0.679 or above.', 'الاستبعاد تحت 0.451، والتأكيد عند 0.679 فأكثر.')
        };
      },
      notes: function (v) { return v.age < 35 ? [t('Developed in adults seen in liver clinics; few patients were under 35.', 'طُوّر لدى بالغين في عيادات الكبد، وقلّة منهم دون 35 سنة.')] : []; },
      src: ['Sanyal AJ et al. J Hepatol 2023;78:247–59', 'https://doi.org/10.1016/j.jhep.2022.10.034']
    },
    {
      id: 'agile4', g: 'scan', en: 'Agile 4', ar: 'Agile 4', kind: ['Cirrhosis (F4)', 'التليّف الكامل (F4)'],
      one: ['FibroScan stiffness plus routine bloods, built to pick out cirrhosis.', 'صلابة الفيبروسكان مع تحاليل روتينية، صُمّم لاكتشاف التليّف الكامل.'],
      fields: ['lsm', 'ast', 'alt', 'plt', 'dm', 'sex'],
      calc: function (v) {
        var p = logistic(7.50139 - 15.42498 / Math.sqrt(v.lsm) - 0.01378 * v.plt - 1.41149 * (v.alt / v.ast) -
          0.53281 * v.sex + 0.41741 * v.dm);
        var b = band3(p, 0.251, 0.565);
        return {
          score: fx(p, 3), cls: b,
          head: b === 'low' ? t('Cirrhosis unlikely', 'التليّف الكامل غير مرجّح') : b === 'high' ? t('Cirrhosis likely', 'التليّف الكامل مرجّح') : t('Indeterminate', 'نتيجة غير حاسمة'),
          body: b === 'high' ? t('Guidelines suggest cirrhosis care: liver cancer surveillance every 6 months and portal hypertension assessment (Baveno VII).', 'توصي الإرشادات برعاية التليّف الكامل: مراقبة سرطان الكبد كل 6 أشهر وتقييم ارتفاع ضغط الوريد البابي (Baveno VII).') :
            b === 'low' ? t('Cirrhosis is unlikely. Use Agile 3+ to judge advanced fibrosis.', 'التليّف الكامل غير مرجّح. استخدم Agile 3+ لتقييم التليّف المتقدّم.') :
            t('Guidelines suggest specialist review, with MR elastography or biopsy only if it would change management.', 'توصي الإرشادات بمراجعة اختصاصي، مع مرونة الكبد بالرنين أو الخزعة فقط إن كانت ستغيّر الخطة.'),
          cut: t('Rule out below 0.251; rule in at 0.565 or above.', 'الاستبعاد تحت 0.251، والتأكيد عند 0.565 فأكثر.')
        };
      },
      src: ['Sanyal AJ et al. J Hepatol 2023;78:247–59', 'https://doi.org/10.1016/j.jhep.2022.10.034']
    },
    {
      id: 'fast', g: 'scan', en: 'FAST score', ar: 'مؤشر FAST', kind: ['At-risk MASH', 'MASH عالي الخطورة'],
      one: ['FibroScan stiffness, CAP and AST. Finds MASH with significant fibrosis (F2 or more).', 'الصلابة وCAP وAST. يكشف MASH مع تليّف ملحوظ (F2 فأكثر).'],
      fields: ['lsm', 'cap', 'ast'],
      calc: function (v) {
        var p = logistic(-1.65 + 1.07 * Math.log(v.lsm) + 2.66e-8 * Math.pow(v.cap, 3) - 63.3 / v.ast);
        var b = band3(p, 0.35, 0.67, true);
        return {
          score: fx(p, 2), cls: b,
          head: b === 'low' ? t('At-risk MASH unlikely', 'MASH عالي الخطورة غير مرجّح') : b === 'high' ? t('At-risk MASH likely', 'MASH عالي الخطورة مرجّح') : t('Indeterminate', 'نتيجة غير حاسمة'),
          body: b === 'high' ? t('Likely MASH with activity and fibrosis F2 or more. Guidelines suggest liver clinic review and assessment of treatment eligibility.', 'يُرجّح وجود MASH نشط مع تليّف F2 فأكثر. توصي الإرشادات بالمراجعة في عيادة الكبد وتقييم الأهلية للعلاج.') :
            b === 'low' ? t('Guidelines suggest treating metabolic risk and following the fibrosis pathway.', 'توصي الإرشادات بعلاج عوامل الخطر الأيضية واتباع مسار تقييم التليّف.') :
            t('Interpret with the other tests and the clinical picture.', 'فسّر النتيجة مع بقية الفحوص والصورة السريرية.'),
          cut: t('Rule out at 0.35 or below; rule in at 0.67 or above.', 'الاستبعاد عند 0.35 أو أقل، والتأكيد عند 0.67 فأكثر.')
        };
      },
      src: ['Newsome PN et al. Lancet Gastroenterol Hepatol 2020;5:362–73', 'https://doi.org/10.1016/S2468-1253(19)30383-8']
    },
    {
      id: 'scan', g: 'scan', en: 'FibroScan result explainer', ar: 'شرح نتيجة الفيبروسكان', kind: ['Interpretation', 'تفسير'],
      one: ['Explains stiffness (kPa) and CAP (dB/m) against published guideline cut-offs.', 'يشرح الصلابة (kPa) وCAP (dB/m) مقارنةً بالحدود المنشورة في الإرشادات.'],
      fields: ['lsm', 'capOpt', 'iqr', 'pltOpt'],
      calc: function (v) {
        var L = v.lsm, cls, head, body;
        if (L < 8) { cls = 'low'; head = t('Advanced fibrosis unlikely', 'التليّف المتقدّم غير مرجّح'); body = t('Below 8 kPa. Guidelines suggest managing metabolic risk and repeating in about 3 years.', 'أقل من 8 كيلوباسكال. توصي الإرشادات بعلاج عوامل الخطر الأيضية وإعادة الفحص بعد نحو 3 سنوات.'); }
        else if (L < 12) { cls = 'mid'; head = t('Grey zone', 'منطقة رمادية'); body = t('8 to 12 kPa. Guidelines suggest a second test (Agile 3+ or ELF) or liver specialist review.', 'من 8 إلى 12 كيلوباسكال. توصي الإرشادات بفحص ثانٍ (Agile 3+ أو ELF) أو مراجعة اختصاصي كبد.'); }
        else if (L < 15) { cls = 'high'; head = t('Advanced fibrosis likely', 'التليّف المتقدّم مرجّح'); body = t('12 kPa or more. Guidelines suggest follow-up in a liver clinic.', '12 كيلوباسكال فأكثر. توصي الإرشادات بالمتابعة في عيادة الكبد.'); }
        else if (L < 25) { cls = 'high'; head = t('Advanced chronic liver disease likely (cACLD)', 'مرض كبدي مزمن متقدّم مرجّح (cACLD)'); body = t('15 kPa or more. Guidelines suggest liver cancer surveillance and portal hypertension assessment.', '15 كيلوباسكال فأكثر. توصي الإرشادات بمراقبة سرطان الكبد وتقييم ضغط الوريد البابي.'); }
        else { cls = 'high'; head = t('Portal hypertension likely', 'ارتفاع ضغط الوريد البابي مرجّح'); body = t('25 kPa or more: clinically significant portal hypertension is likely (Baveno VII). Guidelines suggest specialist care.', '25 كيلوباسكال فأكثر: يُرجّح ارتفاع ضغط بابي ملحوظ سريريًا (Baveno VII). توصي الإرشادات بالرعاية الاختصاصية.'); }
        return { score: fx(L, 1) + ' kPa', cls: cls, head: head, body: body,
          cut: t('Cut-offs: below 8 low, 8–12 grey, 12 or more high, 15 or more cACLD likely, 25 or more portal hypertension likely.', 'الحدود: أقل من 8 منخفض، 8–12 رمادي، 12 فأكثر مرتفع، 15 فأكثر مرض متقدّم مرجّح، 25 فأكثر ارتفاع ضغط بابي مرجّح.') };
      },
      notes: function (v) {
        var n = [];
        if (v.cap != null) n.push(v.cap >= 275 ? t('CAP ' + v.cap + ' dB/m: fat in the liver is likely (about 275 or more). CAP does not stage fibrosis.', 'CAP ‏' + v.cap + ' dB/m: يُرجّح وجود دهون في الكبد (نحو 275 فأكثر). لا يقيس CAP درجة التليّف.')
          : t('CAP ' + v.cap + ' dB/m: below about 275, so fat is less likely by CAP. Ultrasound or MRI-PDFF can help.', 'CAP ‏' + v.cap + ' dB/m: أقل من نحو 275، فالدهون أقل ترجيحًا حسب CAP. يمكن أن يساعد الموجات فوق الصوتية أو MRI-PDFF.'));
        if (v.iqr != null && v.iqr > 30 && v.lsm >= 7.1) n.push(t('IQR/median above 30%: the reading is less reliable. Repeat it.', 'نسبة IQR/الوسيط أعلى من 30%: القراءة أقل موثوقية، فأعدها.'));
        if (v.plt != null && v.lsm >= 15) n.push(v.lsm < 20 && v.plt >= 150
          ? t('Stiffness below 20 kPa and platelets 150 or more: Baveno VII says screening endoscopy for varices can be avoided.', 'صلابة أقل من 20 وصفائح 150 فأكثر: حسب Baveno VII يمكن تجنّب منظار الكشف عن الدوالي.')
          : t('Stiffness 20 kPa or more, or platelets below 150: Baveno VII recommends varices screening (or a beta-blocker).', 'صلابة 20 فأكثر أو صفائح أقل من 150: توصي Baveno VII بالكشف عن الدوالي (أو حاصر بيتا).'));
        n.push(t('Fast for at least 3 hours before the scan. Hepatitis flares, heart failure and cholestasis raise stiffness.', 'يجب الصيام 3 ساعات على الأقل قبل الفحص. نوبات التهاب الكبد وقصور القلب والركود الصفراوي ترفع الصلابة.'));
        return n;
      },
      src: ['EASL–EASD–EASO MASLD guideline. J Hepatol 2024;81:492–542 · Baveno VII. J Hepatol 2022;76:959–74', 'https://doi.org/10.1016/j.jhep.2024.04.031']
    },
    {
      id: 'fli', g: 'fat', en: 'Fatty Liver Index (FLI)', ar: 'مؤشر الكبد الدهني (FLI)', kind: ['Steatosis', 'التشحّم'],
      one: ['BMI, waist, triglycerides and GGT. Screens for fat in the liver without a scan.', 'مؤشر الكتلة والخصر والدهون الثلاثية وGGT. يكشف دهون الكبد دون تصوير.'],
      fields: ['wt', 'ht', 'waist', 'tg', 'ggt'],
      calc: function (v) {
        var y = 0.953 * Math.log(v.tg) + 0.139 * bmiOf(v) + 0.718 * Math.log(v.ggt) + 0.053 * v.waist - 15.745;
        var s = 100 * logistic(y), b = band3(s, 30, 60);
        return { score: fx(s, 0), cls: b,
          head: b === 'low' ? t('Fatty liver unlikely', 'الكبد الدهني غير مرجّح') : b === 'high' ? t('Fatty liver likely', 'الكبد الدهني مرجّح') : t('Indeterminate', 'نتيجة غير حاسمة'),
          body: b === 'high' ? t('Guidelines suggest checking fibrosis next, with FIB-4.', 'توصي الإرشادات بتقييم التليّف بعد ذلك بمؤشر FIB-4.') : b === 'low' ? t('Fat in the liver is unlikely.', 'وجود دهون في الكبد غير مرجّح.') : t('An ultrasound may help if it would change care.', 'قد تفيد الموجات فوق الصوتية إن كانت ستغيّر الخطة.'),
          cut: t('Below 30 rules out; 60 or above rules in.', 'أقل من 30 يستبعد، و60 فأكثر يؤكد.') };
      },
      src: ['Bedogni G et al. BMC Gastroenterol 2006;6:33', 'https://doi.org/10.1186/1471-230X-6-33']
    },
    {
      id: 'hsi', g: 'fat', en: 'Hepatic Steatosis Index (HSI)', ar: 'مؤشر التشحّم الكبدي (HSI)', kind: ['Steatosis', 'التشحّم'],
      one: ['ALT, AST, BMI, sex and diabetes. Validated in Asian adults.', 'ALT وAST ومؤشر الكتلة والجنس والسكري. مُعتمد لدى البالغين الآسيويين.'],
      fields: ['alt', 'ast', 'wt', 'ht', 'sex', 'dm'],
      calc: function (v) {
        var s = 8 * v.alt / v.ast + bmiOf(v) + (v.sex === 0 ? 2 : 0) + (v.dm === 1 ? 2 : 0);
        var b = s < 30 ? 'low' : s > 36 ? 'high' : 'mid';
        return { score: fx(s, 1), cls: b,
          head: b === 'low' ? t('Fatty liver unlikely', 'الكبد الدهني غير مرجّح') : b === 'high' ? t('Fatty liver likely', 'الكبد الدهني مرجّح') : t('Indeterminate', 'نتيجة غير حاسمة'),
          body: b === 'high' ? t('Guidelines suggest checking fibrosis next, with FIB-4.', 'توصي الإرشادات بتقييم التليّف بعد ذلك بمؤشر FIB-4.') : b === 'low' ? t('Fat in the liver is unlikely.', 'وجود دهون في الكبد غير مرجّح.') : t('An ultrasound may help if it would change care.', 'قد تفيد الموجات فوق الصوتية إن كانت ستغيّر الخطة.'),
          cut: t('Below 30 rules out; above 36 rules in.', 'أقل من 30 يستبعد، وأعلى من 36 يؤكد.') };
      },
      src: ['Lee JH et al. Dig Liver Dis 2010;42:503–8', 'https://doi.org/10.1016/j.dld.2009.08.002']
    },
    {
      id: 'homa', g: 'met', en: 'HOMA-IR', ar: 'مؤشر HOMA-IR', kind: ['Insulin resistance', 'مقاومة الإنسولين'],
      one: ['Fasting glucose and insulin. A simple measure of insulin resistance.', 'سكر وإنسولين الصيام. مقياس بسيط لمقاومة الإنسولين.'],
      fields: ['glu', 'ins'],
      calc: function (v) {
        var s = v.glu * v.ins / 22.5, b = s >= 2.5 ? 'mid' : 'low';
        return { score: fx(s, 1), cls: b,
          head: b === 'mid' ? t('Suggests insulin resistance', 'يشير إلى مقاومة الإنسولين') : t('No clear insulin resistance', 'لا مقاومة واضحة للإنسولين'),
          body: t('A HOMA-IR of about 2.5 or more is often used, but cut-offs differ by laboratory and population.', 'تُستخدم قيمة نحو 2.5 فأكثر غالبًا، لكن الحدود تختلف حسب المختبر والسكان.'),
          cut: t('HOMA-IR = glucose (mmol/L) × insulin (µU/mL) ÷ 22.5.', 'HOMA-IR = السكر (mmol/L) × الإنسولين (µU/mL) ÷ 22.5.') };
      },
      notes: function () { return [t('Not valid in people taking insulin. Both samples must be fasting.', 'غير صالح لمن يتناولون الإنسولين، ويجب أن تكون العينتان صائمتين.')]; },
      src: ['Matthews DR et al. Diabetologia 1985;28:412–9', 'https://doi.org/10.1007/BF00280883']
    },
    {
      id: 'body', g: 'met', en: 'BMI and waist-to-height ratio', ar: 'مؤشر كتلة الجسم ونسبة الخصر إلى الطول', kind: ['Body measures', 'قياسات الجسم'],
      one: ['Weight, height and waist. Waist-to-height shows belly fat, which matters most for the liver.', 'الوزن والطول والخصر. نسبة الخصر إلى الطول تُظهر دهون البطن، وهي الأهم للكبد.'],
      fields: ['wt', 'ht', 'waistOpt'],
      calc: function (v) {
        var bmi = bmiOf(v), cls, head;
        var cat = bmi < 18.5 ? t('underweight', 'نقص الوزن') : bmi < 25 ? t('healthy weight', 'وزن صحي') : bmi < 30 ? t('overweight', 'وزن زائد') : t('obesity', 'سمنة');
        cls = bmi < 25 && bmi >= 18.5 ? 'low' : bmi >= 30 ? 'high' : 'mid';
        head = t('BMI ' + fx(bmi, 1) + ': ' + cat, 'مؤشر الكتلة ' + fx(bmi, 1) + ': ' + cat);
        var body = t('Losing 7 to 10% of body weight can reduce liver fat and inflammation.', 'خسارة 7 إلى 10% من الوزن قد تقلّل دهون الكبد والتهابه.');
        var score = fx(bmi, 1);
        if (v.waist != null) {
          var r = v.waist / v.ht;
          var rc = r < 0.5 ? 'low' : r < 0.6 ? 'mid' : 'high';
          cls = rc;
          score = fx(r, 2);
          head = r < 0.5 ? t('Waist-to-height ' + fx(r, 2) + ': healthy', 'الخصر إلى الطول ' + fx(r, 2) + ': صحي') :
            r < 0.6 ? t('Waist-to-height ' + fx(r, 2) + ': increased risk', 'الخصر إلى الطول ' + fx(r, 2) + ': خطر مرتفع') :
            t('Waist-to-height ' + fx(r, 2) + ': high risk', 'الخصر إلى الطول ' + fx(r, 2) + ': خطر مرتفع جدًا');
          body = t('BMI ' + fx(bmi, 1) + ' (' + cat + '). Keep your waist to less than half your height.', 'مؤشر الكتلة ' + fx(bmi, 1) + ' (' + cat + '). حافظ على محيط خصرك أقل من نصف طولك.') + ' ' + body;
        }
        return { score: score, cls: cls, head: head, body: body,
          cut: t('BMI: 25 overweight, 30 obesity (WHO). Waist-to-height: 0.5 increased, 0.6 high risk (NICE).', 'مؤشر الكتلة: 25 وزن زائد، 30 سمنة (منظمة الصحة العالمية). الخصر إلى الطول: 0.5 خطر مرتفع، 0.6 خطر مرتفع جدًا (NICE).') };
      },
      src: ['WHO obesity classification · NICE guideline NG246 on overweight and obesity (2025)', 'https://www.nice.org.uk/guidance/ng246']
    }
  ];

  /* ---------- render ---------- */
  var hub = document.getElementById('calc-hub');
  if (!hub) return;
  var ROOT = document.body.getAttribute('data-root') || '';

  function fieldHtml(id, key) {
    var f = F[key], fid = id + '-' + key, lab = t(f.en, f.ar), inner;
    if (f.k === 's') {
      inner = '<select id="' + fid + '"><option value="">' + t('Choose', 'اختر') + '</option>' +
        f.opts.map(function (o) { return '<option value="' + o[0] + '">' + t(o[1], o[2]) + '</option>'; }).join('') + '</select>';
    } else if (f.units) {
      inner = '<div class="unit-row"><input id="' + fid + '" inputmode="decimal" autocomplete="off"><select id="' + fid + '-u" aria-label="' + t('Unit', 'الوحدة') + '">' +
        f.units.map(function (u) { return '<option value="' + u[0] + '">' + u[1] + '</option>'; }).join('') + '</select></div>';
    } else {
      inner = '<input id="' + fid + '" inputmode="decimal" autocomplete="off">';
    }
    var unit = f.unit ? ' <small>(' + (AR && f.unitAr ? f.unitAr : f.unit) + ')</small>' : '';
    return '<div class="field"><label for="' + fid + '">' + lab + unit + '</label>' + inner + '</div>';
  }
  function card(c, linked) {
    var href = linked ? ROOT + c.href : '#' + c.id;
    return '<a class="calc-card" data-g="' + c.g + '" href="' + href + '">' +
      '<span class="tag">' + t(c.kind[0], c.kind[1]) + '</span>' +
      '<strong>' + t(c.en, c.ar) + '</strong>' +
      '<span class="small muted">' + t(c.one[0], c.one[1]) + '</span>' +
      '<span class="calc-src">' + esc(linked ? c.src : c.src[0]) + '</span></a>';
  }

  var all = LINKED.map(function (c) { return { c: c, l: true }; }).concat(CALCS.map(function (c) { return { c: c, l: false }; }));
  var filt = '<div class="filters" role="group" aria-label="' + t('Filter calculators', 'تصفية الحاسبات') + '">' +
    '<button type="button" data-f="all" aria-pressed="true">' + t('All', 'الكل') + ' (' + all.length + ')</button>' +
    GROUPS.map(function (g) {
      var n = all.filter(function (x) { return x.c.g === g[0]; }).length;
      return '<button type="button" data-f="' + g[0] + '" aria-pressed="false">' + t(g[1], g[2]) + ' (' + n + ')</button>';
    }).join('') + '</div>';
  var grid = '<div class="calc-grid">' + all.map(function (x) { return card(x.c, x.l); }).join('') + '</div>';

  var tools = CALCS.map(function (c) {
    return '<section class="calc-tool" id="' + c.id + '" data-g="' + c.g + '">' +
      '<div class="tool"><span class="tag">' + t(c.kind[0], c.kind[1]) + '</span>' +
      '<h3>' + t(c.en, c.ar) + '</h3><p class="muted small">' + t(c.one[0], c.one[1]) + '</p>' +
      '<form id="' + c.id + '-form" novalidate><fieldset class="calc-fields" disabled>' +
      '<div class="fields">' + c.fields.map(function (k) { return fieldHtml(c.id, k); }).join('') + '</div>' +
      '<button class="btn" type="submit">' + t('Calculate', 'احسب') + '</button></fieldset></form>' +
      '<div class="result" id="' + c.id + '-result" hidden tabindex="-1" aria-live="polite"></div>' +
      '<p class="fine">' + t('Original source', 'المصدر الأصلي') + ': <a href="' + c.src[1] + '" target="_blank" rel="noopener" lang="en" dir="ltr">' + esc(c.src[0]) + '</a></p>' +
      '</div></section>';
  }).join('');

  hub.innerHTML = filt + grid +
    '<div class="consent" id="calc-consent"><label><input type="checkbox" id="calc-ok"><span>' +
    t('I am a healthcare professional. I understand these tools support, but do not replace, clinical judgement. Nothing I type is saved or sent.',
      'أنا من العاملين في المجال الصحي، وأفهم أن هذه الأدوات تساعد ولا تغني عن التقييم السريري. لا يُحفظ أو يُرسل أي شيء أكتبه.') +
    '</span></label></div>' +
    '<h2 class="visually-hidden">' + t('The calculators', 'الحاسبات') + '</h2>' + tools;

  var ok = document.getElementById('calc-ok');
  ok.addEventListener('change', function () {
    hub.querySelectorAll('.calc-fields').forEach(function (fs) { fs.disabled = !ok.checked; });
  });

  hub.querySelectorAll('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      hub.querySelectorAll('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      hub.querySelectorAll('.calc-card, .calc-tool').forEach(function (el) {
        el.hidden = f !== 'all' && el.getAttribute('data-g') !== f;
      });
    });
  });

  /* Arabic-Indic (٠-٩) and Persian (۰-۹) digits, "," or "٫" as decimal mark */
  function num(s) {
    return parseFloat(String(s).trim()
      .replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x0660; })
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 0x06F0; })
      .replace(/[٫,]/g, '.'));
  }

  CALCS.forEach(function (c) {
    var form = document.getElementById(c.id + '-form'), out = document.getElementById(c.id + '-result');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = {}, bad = [];
      c.fields.forEach(function (k) {
        var f = F[k], key = f.key || k, el = document.getElementById(c.id + '-' + k), raw = el.value.trim();
        if (f.k === 's') { if (raw === '') bad.push(t(f.en, f.ar)); else v[key] = +raw; return; }
        if (raw === '') { if (f.opt) { v[key] = null; return; } bad.push(t(f.en, f.ar)); return; }
        var x = num(raw);
        if (f.units) {
          var u = document.getElementById(c.id + '-' + k + '-u').value;
          f.units.forEach(function (uu) { if (uu[0] === u) x = x * uu[2]; });
        }
        if (!isFinite(x) || x < f.min || x > f.max) { bad.push(t(f.en, f.ar)); return; }
        v[key] = x;
      });
      out.hidden = false;
      if (bad.length) {
        out.className = 'result mid';
        out.innerHTML = '<p><strong>' + t('Please check: ', 'يرجى التحقق من: ') + '</strong>' + esc(bad.join(t(', ', '، '))) + '</p>';
        out.focus();
        return;
      }
      var r = c.calc(v), notes = c.notes ? c.notes(v) : [];
      out.className = 'result ' + r.cls;
      out.innerHTML = '<div class="score" dir="ltr">' + esc(r.score) + '</div>' +
        '<h4>' + esc(r.head) + '</h4><p>' + esc(r.body) + '</p>' +
        (notes.length ? '<ul class="calc-notes">' + notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' : '') +
        '<p class="fine">' + esc(r.cut) + ' ' + t('A summary of published guidelines, not a decision for an individual patient. Supports, but never replaces, clinical judgement.', 'ملخص للإرشادات المنشورة وليس قرارًا لمريض بعينه. أداة مساعدة لا تغني أبدًا عن التقييم السريري.') + '</p>';
      out.focus();
    });
  });

  /* expose formulas for the test file */
  window.MLA_CALCS = CALCS;
})();
