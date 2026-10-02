/* ============================================================
   NEWS & EVENTS  –  the only file you edit to post news.
   Newest items appear first automatically.

   Each item sits between { and } and ends with a comma.
   Keep the "quotes" around every value.

   type:  "health"  = health news (studies, guidelines, approvals)
          "events"  = conferences, webinars, deadlines, talks
          "mine"    = your own activities (papers, talks, awards)
   date:  YEAR-MONTH-DAY, e.g. "2026-11-14"  (or just "2026")

   For events you can also add:
     time: "18:00"   (Riyadh time)      gmt: "15:00"
     place_en: "Riyadh"                 place_ar: "الرياض"
   Events dated today or later also show on the homepage.

   COPYRIGHT RULE: never paste a whole article.
   Write 2–3 sentences in your own words and link to the source.
   ============================================================ */

window.MLA_NEWS = [

  /* ---------- Example to copy (delete the two slashes and stars around it) ----------
  {
    type: "events",
    date: "2026-11-14",
    time: "18:00", gmt: "15:00",
    place_en: "Online", place_ar: "عبر الإنترنت",
    title_en: "Webinar title in English",
    title_ar: "عنوان الندوة بالعربية",
    summary_en: "Two or three short sentences in your own words.",
    summary_ar: "جملتان أو ثلاث جمل قصيرة بأسلوبك.",
    link: "https://example.org/registration",
    linkLabel_en: "Register", linkLabel_ar: "سجّل الآن"
  },
  ---------------------------------------------------------------------------------- */

  /* ---------- Upcoming events ---------- */
  {
    type: "events",
    date: "2026-10-15",
    place_en: "Online · Global Liver Institute", place_ar: "عبر الإنترنت · المعهد العالمي للكبد",
    title_en: "Webinar: Innovations bringing new hope to patients and families",
    title_ar: "ندوة: ابتكارات تمنح أملًا جديدًا للمرضى وأسرهم",
    summary_en: "Part of the #OctoberIs4Livers campaign. Experts talk about new therapies and advances in liver cancer care. Free to watch.",
    summary_ar: "ضمن حملة #OctoberIs4Livers. يتحدث خبراء عن العلاجات الجديدة والتطورات في رعاية سرطان الكبد. المشاهدة مجانية.",
    link: "https://globalliver.org/octoberis4livers/",
    linkLabel_en: "Campaign and webinar links", linkLabel_ar: "الحملة وروابط الندوات"
  },
  {
    type: "events",
    date: "2026-10-22",
    place_en: "Online · Global Liver Institute", place_ar: "عبر الإنترنت · المعهد العالمي للكبد",
    title_en: "Webinar: Exploring proton therapy as a treatment option",
    title_ar: "ندوة: العلاج بالبروتونات بوصفه خيارًا علاجيًا",
    summary_en: "Part of the #OctoberIs4Livers campaign. How proton therapy works for liver cancer and how it differs from standard radiotherapy.",
    summary_ar: "ضمن حملة #OctoberIs4Livers. كيف يعمل العلاج بالبروتونات في سرطان الكبد، وبمَ يختلف عن العلاج الإشعاعي المعتاد.",
    link: "https://globalliver.org/octoberis4livers/",
    linkLabel_en: "Campaign and webinar links", linkLabel_ar: "الحملة وروابط الندوات"
  },
  {
    type: "events",
    date: "2026-11-05",
    place_en: "Denver, USA · 5–9 November 2026", place_ar: "دنفر، الولايات المتحدة · 5–9 نوفمبر 2026",
    title_en: "The Liver Meeting 2026 (AASLD)",
    title_ar: "الاجتماع السنوي للكبد 2026 (AASLD)",
    summary_en: "The American Association for the Study of Liver Diseases' yearly meeting, at the Colorado Convention Center. Expect new MASH trial data and treatment updates.",
    summary_ar: "الاجتماع السنوي للجمعية الأمريكية لدراسة أمراض الكبد في مركز مؤتمرات كولورادو، ويُتوقع فيه عرض بيانات جديدة لتجارب علاج التهاب الكبد الدهني.",
    link: "https://www.aasld.org/tlm-26/home",
    linkLabel_en: "Event website", linkLabel_ar: "موقع الفعالية"
  },
  {
    type: "events",
    date: "2027-02-10",
    place_en: "10–13 February 2027", place_ar: "10–13 فبراير 2027",
    title_en: "EASL Steatotic Liver Disease Summit 2027",
    title_ar: "قمة EASL لأمراض الكبد الدهني 2027",
    summary_en: "A focused EASL meeting on MASLD, MetALD and alcohol-related liver disease, from public health and nutrition to diagnosis and new drugs.",
    summary_ar: "اجتماع متخصص من EASL عن MASLD وMetALD وأمراض الكبد المرتبطة بالكحول، من الصحة العامة والتغذية إلى التشخيص والأدوية الجديدة.",
    link: "https://easl.eu/event/easl-sld-summit-2027/scientific-programme/",
    linkLabel_en: "Programme", linkLabel_ar: "البرنامج"
  },
  {
    type: "events",
    date: "2027-06-16",
    place_en: "London, UK · 16–19 June 2027", place_ar: "لندن، المملكة المتحدة · 16–19 يونيو 2027",
    title_en: "EASL Congress 2027",
    title_ar: "مؤتمر EASL لعام 2027",
    summary_en: "Europe's largest liver congress. Abstract deadlines are usually announced months ahead, so watch the website if you plan to submit.",
    summary_ar: "أكبر مؤتمر أوروبي لأمراض الكبد. تُعلن مواعيد تقديم الملخصات عادةً قبلها بأشهر، فتابع الموقع إن كنت تنوي المشاركة.",
    link: "https://easl.eu/easl-congress/future-easl-congress-dates/",
    linkLabel_en: "Congress dates", linkLabel_ar: "مواعيد المؤتمر"
  },

  /* ---------- Health news ---------- */
  {
    type: "health",
    date: "2026-10-01",
    title_en: "October is liver cancer awareness month: #OctoberIs4Livers",
    title_ar: "أكتوبر شهر التوعية بسرطان الكبد: #OctoberIs4Livers",
    summary_en: "The Global Liver Institute launched its 2026 campaign across the whole liver cancer journey, from prevention and early detection to treatment. It offers free webinars, a guide for people newly diagnosed, and a social media toolkit. Fatty liver is a growing cause of liver cancer, so finding fibrosis early matters.",
    summary_ar: "أطلق المعهد العالمي للكبد حملته لعام 2026 التي تغطي رحلة سرطان الكبد كاملة، من الوقاية والاكتشاف المبكر إلى العلاج. وتقدّم الحملة ندوات مجانية، ودليلًا للمشخّصين حديثًا، وأدوات للتواصل الاجتماعي. والكبد الدهني سبب متزايد لسرطان الكبد، لذا فإن اكتشاف التليّف مبكرًا مهم.",
    link: "https://globalliver.org/global-liver-institutes-2026-octoberis4livers-campaign-calls-for-action-across-the-liver-cancer-journey/"
  },
  {
    type: "health",
    date: "2026-07",
    title_en: "UK approves two medicines for MASH",
    title_ar: "المملكة المتحدة تعتمد دواءين لالتهاب الكبد الدهني",
    summary_en: "The UK regulator approved resmetirom in June and semaglutide in July 2026 for adults with MASH and moderate-to-advanced fibrosis. NHS use still depends on a NICE review.",
    summary_ar: "اعتمدت الهيئة البريطانية للأدوية الريسميتيروم في يونيو والسيماغلوتايد في يوليو 2026 للبالغين المصابين بالتهاب الكبد الدهني مع تليّف متوسط إلى متقدّم، ولا يزال استخدامهما في الخدمة الصحية البريطانية مرهونًا بمراجعة NICE.",
    link: "https://britishlivertrust.org.uk/new-hope-for-people-living-with-mash-as-two-treatments-receive-mhra-approval/"
  },
  {
    type: "health",
    date: "2026-01-28",
    title_en: "MASH drugs to watch in 2026",
    title_ar: "أدوية التهاب الكبد الدهني التي تستحق المتابعة في 2026",
    summary_en: "FGF21-based drugs such as efruxifermin and pegozafermin are in phase 3 trials, and GLP-1 combinations are close behind. Outcome results for the approved drugs are expected from 2027.",
    summary_ar: "أدوية قائمة على FGF21 مثل إيفروكسيفيرمين وبيغوزافيرمين في المرحلة الثالثة من التجارب، وتليها تركيبات GLP-1. ويُنتظر من 2027 صدور نتائج المآلات للأدوية المعتمدة.",
    link: "https://www.hcplive.com/view/mash-pipeline-developments-and-emerging-therapies-to-watch-in-2026-with-mazen-noureddin-md-mhsc"
  },
  {
    type: "health",
    date: "2025-08-19",
    title_en: "Europe approves the first MASH medicine",
    title_ar: "أوروبا تعتمد أول دواء لالتهاب الكبد الدهني",
    summary_en: "The European Commission gave resmetirom a conditional approval for adults with MASH and F2–F3 fibrosis without cirrhosis. More data are still required.",
    summary_ar: "منحت المفوضية الأوروبية الريسميتيروم اعتمادًا مشروطًا للبالغين المصابين بالتهاب الكبد الدهني مع تليّف F2–F3 دون تشمّع، مع طلب بيانات إضافية.",
    link: "https://ir.madrigalpharma.com/node/16716"
  },
  {
    type: "health",
    date: "2025-08",
    title_en: "Semaglutide becomes the second US-approved MASH drug",
    title_ar: "السيماغلوتايد يصبح الدواء الثاني المعتمد أمريكيًا لالتهاب الكبد الدهني",
    summary_en: "The US FDA gave semaglutide 2.4 mg an accelerated approval for MASH with moderate-to-advanced fibrosis, joining resmetirom, approved in March 2024.",
    summary_ar: "منحت هيئة الغذاء والدواء الأمريكية السيماغلوتايد 2.4 ملغ اعتمادًا معجّلًا لعلاج التهاب الكبد الدهني مع تليّف متوسط إلى متقدّم، لينضم إلى الريسميتيروم المعتمد في مارس 2024.",
    link: "https://www.hcplive.com/view/mash-pipeline-developments-and-emerging-therapies-to-watch-in-2026-with-mazen-noureddin-md-mhsc"
  },
  {
    type: "events",
    date: "2026-01-16",
    place_en: "Riyadh · 16–17 January 2026", place_ar: "الرياض · 16–17 يناير 2026",
    title_en: "Best of The Liver Meeting: AASLD & SASLT, Riyadh",
    title_ar: "أفضل ما في الاجتماع السنوي للكبد: AASLD وSASLT في الرياض",
    summary_en: "AASLD and the Saudi Association for the Study of Liver Diseases and Transplantation (SASLT) brought highlights of The Liver Meeting to Riyadh.",
    summary_ar: "نقلت الجمعية الأمريكية لدراسة أمراض الكبد والجمعية السعودية لدراسة أمراض الكبد وزراعته أبرز ما في الاجتماع السنوي إلى الرياض.",
    link: "https://www.aasld.org/best-tlm-aasld-saslt-conference-2026",
    linkLabel_en: "Event page", linkLabel_ar: "صفحة الفعالية"
  },

  /* ---------- My activities ---------- */
  {
    type: "mine",
    date: "2026-10-02",
    title_en: "The Metabolic Liver Academy is now online",
    title_ar: "أكاديمية الكبد الأيضي الآن على الإنترنت",
    summary_en: "A free, bilingual home for fatty liver (MASLD and MASH) education: plain guides for patients, practical tools for doctors, and news from the field.",
    summary_ar: "منصة مجانية ثنائية اللغة للتثقيف حول الكبد الدهني: أدلة مبسطة للمرضى، وأدوات عملية للأطباء، وأخبار هذا المجال.",
    link: ""
  },
  {
    type: "mine",
    date: "2026",
    title_en: "New paper: denominator bias in MENA MASLD epidemiology",
    title_ar: "بحث جديد: انحياز المقام في دراسات انتشار الكبد الدهني في الشرق الأوسط وشمال أفريقيا",
    summary_en: "Published in the Saudi Journal of Gastroenterology with regional co-authors. It calls for better, decision-grade surveillance of fatty liver disease in our region.",
    summary_ar: "نُشر في المجلة السعودية لأمراض الجهاز الهضمي مع باحثين من المنطقة، ويدعو إلى رصد أدق لمرض الكبد الدهني يمكن الاعتماد عليه في اتخاذ القرار.",
    link: "https://doi.org/10.4103/sjg.sjg_87_26",
    linkLabel_en: "Read the paper", linkLabel_ar: "اقرأ البحث"
  },
  {
    type: "mine",
    date: "2026",
    title_en: "New paper: MASLD in challenging care settings",
    title_ar: "بحث جديد: الكبد الدهني في بيئات الرعاية الصعبة",
    summary_en: "Published in EMJ Hepatology. It looks at the clinical lessons for fatty liver care in the MENA region.",
    summary_ar: "نُشر في مجلة EMJ Hepatology، ويتناول الدروس السريرية لرعاية مرضى الكبد الدهني في منطقة الشرق الأوسط وشمال أفريقيا.",
    link: "https://doi.org/10.33590/emjhepatol/GUW1MIC1",
    linkLabel_en: "Read the paper", linkLabel_ar: "اقرأ البحث"
  },
  {
    type: "mine",
    date: "2026",
    title_en: "New review: THR-β agonists vs incretin therapies for MASH",
    title_ar: "مراجعة جديدة: منبّهات THR-β مقابل علاجات الإنكريتين لالتهاب الكبد الدهني",
    summary_en: "A biopsy-anchored systematic review with GRADE certainty, published in Cureus.",
    summary_ar: "مراجعة منهجية تعتمد على نتائج خزعة الكبد مع تقييم GRADE لقوة الدليل، منشورة في مجلة Cureus.",
    link: "https://doi.org/10.7759/cureus.106038",
    linkLabel_en: "Read the paper", linkLabel_ar: "اقرأ البحث"
  }

];
