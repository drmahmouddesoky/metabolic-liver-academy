/* ============================================================
   MEET THE EXPERT  –  the only file you edit to add an expert.
   No build step: edit on GitHub, click "Commit changes", and the
   site updates in a minute or two.

   HOW TO ADD AN EXPERT
   1. Copy one whole block, from { to }, including the comma after }.
   2. Paste it below the line  window.MLA_EXPERTS = [
   3. Fill in the values. Keep the "quotes". Leave "" for anything you
      do not have yet.
   4. Set  approved: true  ONLY when you hold the expert's WRITTEN
      approval of their bio, photo and interview. Entries without it
      are never shown on the site.
   5. Delete the line  sample: true  (it marks the fake examples).

   THE FIELDS
   id          short code for the page address, e.g. "jane-doe"
               (lower case, no spaces). Page: expert.html?id=jane-doe
   name_en / name_ar        full name with title, e.g. "Prof. ..."
   title_en / title_ar      role, e.g. "Professor of Hepatology"
   country_en / country_ar  country
   region      "mena" (Middle East and North Africa) or "global"
   topics      one or more of: "masld", "mash-treatment", "obesity",
               "diabetes", "nutrition"
   audience    one or both of: "patients", "physicians"
   topic_en / topic_ar      the interview topic in one line
   photo       "" or a file you upload, e.g. "images/experts/jane-doe.jpg"
               (square, about 600 x 600, with the expert's permission)
   bio_en / bio_ar          3-4 modest sentences, approved by the expert
   video       "" or the YouTube code (the part after "watch?v=")
   language    language the interview was recorded in: "en" or "ar"
   recorded    date recorded, e.g. "2026-11-20"
   reviewed    date the page was last checked, e.g. "2026-11-25"
   session     "" or the date of an upcoming live session; dates today
               or later also appear on the home page
   takeaways_en / takeaways_ar   3 to 5 plain-language points
   qa          written questions and answers (optional)
   transcript_en / transcript_ar full transcript. If the interview is in
               English, the Arabic transcript (or summary) gives Arabic
               readers the content, and the other way round.
   publications  links to PubMed, ORCID or Google Scholar
   profile     the expert's own professional page
   disclosure_en / disclosure_ar  conflicts of interest the expert
               declares, or "No relevant conflicts declared."
   ============================================================ */

window.MLA_EXPERTS = [

  /* ---------- SAMPLE 1 (fake example: replace or delete) ---------- */
  {
    id: "sample-expert-1",
    sample: true,
    approved: false,
    name_en: "Expert Name (sample)",
    name_ar: "اسم الخبير (نموذج)",
    title_en: "Professor of Hepatology",
    title_ar: "أستاذ أمراض الكبد",
    country_en: "Country",
    country_ar: "الدولة",
    region: "global",
    topics: ["masld", "mash-treatment"],
    audience: ["physicians"],
    topic_en: "Interview topic in one line (sample)",
    topic_ar: "موضوع اللقاء في سطر واحد (نموذج)",
    photo: "",
    bio_en: "This is a sample entry that shows how an expert page will look. It is not a real person. A short, modest professional bio approved by the expert goes here.",
    bio_ar: "هذا مثال يوضّح شكل صفحة الخبير، وليس لشخص حقيقي. هنا تُكتب نبذة مهنية قصيرة ومتواضعة يوافق عليها الخبير.",
    video: "",
    language: "en",
    recorded: "",
    reviewed: "",
    session: "",
    takeaways_en: ["Key takeaway 1, in plain language (sample).", "Key takeaway 2 (sample).", "Key takeaway 3 (sample)."],
    takeaways_ar: ["النقطة الأساسية الأولى بلغة بسيطة (نموذج).", "النقطة الأساسية الثانية (نموذج).", "النقطة الأساسية الثالثة (نموذج)."],
    qa: [
      { q_en: "Interview question (sample)?", q_ar: "سؤال اللقاء (نموذج)؟",
        a_en: "The expert's answer goes here (sample).", a_ar: "تُكتب إجابة الخبير هنا (نموذج)." }
    ],
    transcript_en: "The full transcript of the interview goes here (sample).",
    transcript_ar: "يُكتب هنا النص الكامل للقاء أو ملخّص له باللغة العربية (نموذج).",
    publications: [],
    profile: { label: "", url: "" },
    disclosure_en: "Disclosure of conflicts of interest goes here (sample).",
    disclosure_ar: "يُكتب هنا الإفصاح عن تضارب المصالح (نموذج)."
  },

  /* ---------- SAMPLE 2 (fake example: replace or delete) ---------- */
  {
    id: "sample-expert-2",
    sample: true,
    approved: false,
    name_en: "Expert Name (sample)",
    name_ar: "اسم الخبير (نموذج)",
    title_en: "Consultant in Obesity Medicine",
    title_ar: "استشاري طب السمنة",
    country_en: "Country",
    country_ar: "الدولة",
    region: "mena",
    topics: ["obesity", "nutrition"],
    audience: ["patients"],
    topic_en: "Interview topic in one line (sample)",
    topic_ar: "موضوع اللقاء في سطر واحد (نموذج)",
    photo: "",
    bio_en: "This is a sample entry. It is not a real person.",
    bio_ar: "هذا مثال، وليس لشخص حقيقي.",
    video: "",
    language: "ar",
    recorded: "",
    reviewed: "",
    session: "",
    takeaways_en: ["Key takeaway 1 (sample).", "Key takeaway 2 (sample).", "Key takeaway 3 (sample)."],
    takeaways_ar: ["النقطة الأساسية الأولى (نموذج).", "النقطة الأساسية الثانية (نموذج).", "النقطة الأساسية الثالثة (نموذج)."],
    qa: [],
    transcript_en: "An English summary of an Arabic interview goes here (sample).",
    transcript_ar: "يُكتب هنا النص الكامل للقاء باللغة العربية (نموذج).",
    publications: [],
    profile: { label: "", url: "" },
    disclosure_en: "Disclosure of conflicts of interest goes here (sample).",
    disclosure_ar: "يُكتب هنا الإفصاح عن تضارب المصالح (نموذج)."
  },

  /* ---------- SAMPLE 3 (fake example: replace or delete) ---------- */
  {
    id: "sample-expert-3",
    sample: true,
    approved: false,
    name_en: "Expert Name (sample)",
    name_ar: "اسم الخبير (نموذج)",
    title_en: "Consultant Endocrinologist",
    title_ar: "استشاري الغدد الصماء",
    country_en: "Country",
    country_ar: "الدولة",
    region: "mena",
    topics: ["diabetes", "masld"],
    audience: ["patients", "physicians"],
    topic_en: "Interview topic in one line (sample)",
    topic_ar: "موضوع اللقاء في سطر واحد (نموذج)",
    photo: "",
    bio_en: "This is a sample entry. It is not a real person.",
    bio_ar: "هذا مثال، وليس لشخص حقيقي.",
    video: "",
    language: "en",
    recorded: "",
    reviewed: "",
    session: "",
    takeaways_en: ["Key takeaway 1 (sample).", "Key takeaway 2 (sample).", "Key takeaway 3 (sample)."],
    takeaways_ar: ["النقطة الأساسية الأولى (نموذج).", "النقطة الأساسية الثانية (نموذج).", "النقطة الأساسية الثالثة (نموذج)."],
    qa: [],
    transcript_en: "The full transcript of the interview goes here (sample).",
    transcript_ar: "يُكتب هنا ملخّص اللقاء باللغة العربية (نموذج).",
    publications: [],
    profile: { label: "", url: "" },
    disclosure_en: "Disclosure of conflicts of interest goes here (sample).",
    disclosure_ar: "يُكتب هنا الإفصاح عن تضارب المصالح (نموذج)."
  }

];
