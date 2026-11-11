# Roadmap: the next four programmes

Working plan for Dr. Mahmoud Al Desoky. Written 11 November 2026, revised the same day after his answers to be discussed and changed; nothing
here is published on the site. Each programme below has a recommended shape, the standards it is
built on, the decisions that are yours to make, and a build order.

The site already has the engine for this: a *series* of chapter-length modules (learning objectives,
graded recommendations, figures, a clinical case, a self-test, references, a page record), built from
`content/*.py`, in English and Arabic, with a quick-reference library and calculators beside it. The
MASLD & MASH series (5 modules) and the GI & Microbiome series (6 modules) are the templates. Every
programme below reuses that engine, so the work is medical content, not web development.

---

## 0. Principles that apply to all four

1. **Standards first.** Each course is mapped, module by module, to a named competency framework or
   guideline, and the map is printed on the course page. That is what makes it "aligned with the
   world's top societies" rather than a reading list.
2. **Competency, not attendance.** Every module ends with observable outcomes ("can choose a
   second-line agent for a patient with CIC and CKD"), a case, and 5–8 questions. Each course ends
   with a longer case portfolio. Nothing is accredited for CME unless we apply for it (see decision C).
3. **One shared cardiometabolic core.** MASLD, dyslipidaemia and obesity share pathophysiology,
   risk assessment, GLP-1/GIP pharmacology, bariatric surgery and lifestyle prescription. These are
   written once as shared modules and linked from each programme, never duplicated.
4. **Global by design, adapted by region (decided 11 Nov 2026).** The Academy teaches an
   international audience, not one country. Every course is anchored on the international guidelines
   (for example ESC/EAS and ACC/AHA for lipids; EASL, AASLD and the global consensus for the liver;
   OMEC, SCOPE, EASO and NICE for obesity; AGA/ACG, Rome and ESNM for the gut) and ends with a
   "Practice around the world" section: drug approval and availability by regulator (FDA, EMA, MHRA,
   SFDA and others), how major national guidelines differ, and adaptation notes for settings such as
   the Middle East and North Africa, South Asia, Europe and North America. Saudi Arabia and the Gulf
   appear as one of those regions, because that is where the founder practises, never as the only one.
   Faith- and culture-specific topics (Ramadan fasting, regional diets) are written so that a reader
   anywhere can use them.
5. **Same governance as today.** Page record, version, author check, independent peer review line,
   disclosure, asset register, and the medical review checklist in `REVIEW.md`.
6. **Language rule (decided 11 Nov 2026).** Patient-facing content (Q&A, printable guides, patient
   pages) is always bilingual. Physician courses (constipation, lipids, obesity) are written in
   English, with an Arabic page header, summary and key messages (about 200 words) so Arabic-speaking
   doctors and search engines find them; the body stays English, as in the GI & Microbiome series.
   A full Arabic translation of a physician course is made only when usage shows demand or a
   sponsor funds it.

---

## 1. Constipation: a four-course programme (recommended) with one shared core

You asked for three or four courses covering general, IBS-C, idiopathic, neurogenic bowel and
specific populations. **Recommendation: four courses**, because neurogenic bowel and the
"refractory/evacuation disorder" group each need their own assessment and treatment logic and
would be squeezed in a three-course layout. A three-course alternative is given afterwards.

### Shared core (built once, linked from every course)

| Core module | Content |
| --- | --- |
| C0.1 Normal defecation and the physiology of transit | Colonic motility, rectal sensation, pelvic floor, gut–brain axis |
| C0.2 Definitions and classification | Rome IV functional constipation and IBS-C; slow transit; defecatory disorders; secondary causes; drug-induced |
| C0.3 The constipation assessment toolkit | History, Bristol scale, bowel diary, red flags, digital rectal examination, PAC-SYM/PAC-QOL, when to scope, anorectal manometry, balloon expulsion, transit study, defecography |
| C0.4 First-line care | Fibre types and dosing, fluids, toileting posture and routine, osmotic and stimulant laxatives, deprescribing constipating drugs |

### Course 1: Chronic constipation in adults (general practice and internal medicine)

For primary care, internists, family medicine residents and pharmacists. Six modules.

1. The burden and the patient's story (epidemiology, quality of life and costs across regions)
2. Making the diagnosis safely (red flags, when colonoscopy is needed, screening overlap)
3. First-line treatment that works (core C0.4 applied; evidence for PEG, senna, magnesium oxide, lactulose)
4. Prescription agents (linaclotide, plecanatide, prucalopride, lubiprostone, tenapanor where licensed; choosing, dosing, cost)
5. Constipation with other conditions (diabetes, hypothyroidism, CKD, pregnancy, older adults; drug-induced)
6. Follow-up, failure and referral (what "refractory" means; what to send to the gastroenterologist with)

Standards: AGA–ACG 2023 clinical practice guideline on the pharmacological management of chronic
idiopathic constipation (strong for PEG, sodium picosulfate, linaclotide, plecanatide, prucalopride;
conditional for fibre, lactulose, senna, magnesium oxide, lubiprostone); Rome IV; UEG/ESNM 2020
functional constipation guideline; ASCRS 2016; NICE CKS; regional guidelines (Asian, Latin American,
Middle Eastern) where they exist, compared side by side as the MASLD series does.

### Course 2: IBS-C and the disorders of gut–brain interaction

For gastroenterologists, internists, dietitians and psychologists. Six modules.

1. Rome IV IBS-C and the overlap with CIC; bloating and distension
2. Mechanisms: visceral hypersensitivity, motility, microbiome, bile acids, the brain–gut axis (links to the GI & Microbiome series)
3. Diet: fibre, low-FODMAP done properly (restriction, reintroduction, personalisation), the dietitian's role
4. Brain–gut therapies: CBT, gut-directed hypnotherapy, digital therapeutics; neuromodulators (TCAs, SSRIs/SNRIs)
5. Pharmacotherapy: secretagogues, tenapanor, antispasmodics, peppermint oil; what not to use
6. The difficult consultation: explaining a positive diagnosis, expectations, stigma, Ramadan and travel

Standards: ACG 2021 IBS guideline; AGA 2022 IBS-C pharmacological guideline; BSG 2021 IBS guideline;
Rome IV (and Rome V when published); NICE CG61.

### Course 3: Refractory constipation and evacuation disorders ("idiopathic" and specialist care)

For gastroenterologists, colorectal surgeons, physiotherapists and nurses. Seven modules.

1. Phenotyping the refractory patient (normal transit, slow transit, dyssynergia, overlap)
2. Anorectal physiology testing: ordering and reading manometry, balloon expulsion, defecography, transit studies
3. Dyssynergic defecation and biofeedback (protocol, who delivers it, outcomes)
4. Slow-transit constipation and megacolon: medical options, sacral neuromodulation, antegrade continence enema, colectomy (indications and regret rates)
5. Structural problems: rectocele, intussusception, prolapse, obstructed defecation; when surgery helps
6. Opioid-induced constipation: prevention, PAMORAs (methylnaltrexone, naloxegol, naldemedine), palliative settings
7. Building a pelvic floor and bowel service: the multidisciplinary team, pathways, outcome measures

Standards: AGA–ACG 2023; Rome IV anorectal disorders; ASCRS 2016; MASCC 2020 opioid-induced
constipation guideline; ESCP/ESNM where relevant.

### Course 4: Neurogenic bowel dysfunction and special populations

Your own area (your assessment tool is already linked from the site). Eight modules.

1. Neurogenic bowel: pathophysiology by lesion level (upper vs lower motor neuron bowel)
2. Spinal cord injury: assessment, bowel programme design, digital stimulation, suppositories, transanal irrigation, timing and diet
3. Multiple sclerosis, Parkinson's disease, stroke, spina bifida, autonomic neuropathy (diabetes)
4. Transanal irrigation and surgical options (ACE, colostomy): selection, training, troubleshooting
5. Autonomic dysreflexia and emergencies
6. Children and adolescents (functional constipation, toilet training, neurogenic bowel in spina bifida)
7. Older adults and frailty, pregnancy and postpartum, eating disorders, chronic kidney disease, dialysis
8. Nursing, caregivers and self-management; measuring outcomes (NBD score)

Standards: Consortium for Spinal Cord Medicine 2020 neurogenic bowel guideline (PVA); ISCoS; MASCC 2020;
ESPGHAN/NASPGHAN functional constipation guideline (2014, with its later updates); UK NICE and
MASCIP guidance on bowel management after SCI. *Please list the sources from your neurogenic bowel
course so they are cited as primary material.*

### Three-course alternative

If you prefer three: keep Courses 1 and 2; merge Course 3 and the neurogenic half of Course 4 into
"Refractory and neurogenic bowel"; move the special populations into Course 1 as two extra modules.
It is faster to build but the neurogenic bowel content loses depth, which is your differentiator.

### Decisions (constipation)

- **A1. Decided (11 Nov 2026): four courses with the shared core**, as above.
- **A2. Decided: build order 1, 4, 2, 3** (general first, then neurogenic bowel, then IBS-C, then refractory).
- **A3. Open:** the series name on the Physician Portal. Proposed: "Bowel Health series" (English) /
  "سلسلة صحة الأمعاء" (Arabic). Say if you prefer another.

---

## 2. Lipids A to Z: From Pathway to Prescription (dyslipidaemia preceptorship)

**Title.** Recommended: **"Lipids A to Z: From Pathway to Prescription"**, Arabic
**"الدهون من الألف إلى الياء: من المسار الأيضي إلى الوصفة"**. It says what the course is (an A-to-Z),
how it is taught (along the metabolic pathway) and where it ends (the prescription). It is our own
title, not borrowed from any sponsored forum. Alternatives if you prefer: "Mastering Lipids: From
Biochemistry to Bedside"; "The Lipid Pathway: Metabolism, Risk and Modern Therapy"; "LipidCore:
From Molecule to Medicine".

**Format.** A preceptorship: supervised, case-based learning with a mentor, a logbook and sign-off.
Duration cut from 12 weeks to **6 weeks, two modules a week**, with one mentor session a week; the
twelve modules and their content are unchanged. An **intensive 4-week option** (three modules a week)
is possible for a resident cohort. The site holds the modules, cases, self-tests and the logbook
template; mentoring is by video call or in clinic.

**The teaching idea.** The course follows lipid metabolism from the gut to the artery wall, stage by
stage. At every stage the module marks the site where a drug acts, the drugs that act there today, and
the drugs in trials. One master pathway figure (drawn in SVG by the site's figure engine) is reused in
every module with the relevant target highlighted, so by week 6 the learner can draw the whole map
from memory with every drug on it.

### The six weeks, twelve modules

| Week | Module | Stage of lipid metabolism | Drug targets shown on the pathway |
| --- | --- | --- | --- |
| 1 | 1. Lipid biochemistry and lipoprotein structure | Cholesterol, triglycerides, fatty acids, phospholipids; apoB-100 and apoB-48, apoA-I, apoC-II, apoC-III, apoE; lipoprotein classes and densities | The map itself: where each later drug will sit |
| 1 | 2. The exogenous pathway | Intestinal absorption (NPC1L1, ACAT, MTP), chylomicron assembly, lipoprotein lipase and its regulators (apoC-II, apoC-III, ANGPTL3/4/8), remnant uptake | Ezetimibe (NPC1L1); apoC-III antisense and siRNA (olezarsen, plozasiran) for familial chylomicronaemia and severe hypertriglyceridaemia; ANGPTL3 antibody (evinacumab) |
| 2 | 3. The endogenous pathway | Hepatic cholesterol synthesis (HMG-CoA reductase, ATP-citrate lyase), VLDL assembly (MTP), VLDL to IDL to LDL, CETP exchange | Statins (HMG-CoA reductase); bempedoic acid (ATP-citrate lyase, liver-selective, muscle-sparing); lomitapide (MTP) for HoFH; CETP inhibition revisited (obicetrapib) |
| 2 | 4. The LDL receptor cycle and PCSK9 | LDL-receptor recycling, PCSK9 degradation of the receptor, LDLR and APOB mutations, the genetic basis of FH | PCSK9 antibodies (evolocumab, alirocumab), PCSK9 siRNA (inclisiran), oral PCSK9 inhibitors in phase 3 (enlicitide and others); why statins raise PCSK9 |
| 3 | 5. Reverse cholesterol transport and HDL | ABCA1, LCAT, HDL maturation, SR-B1, CETP; why raising HDL cholesterol did not reduce events | The failed HDL drugs (niacin, CETP inhibitors) and what they taught; obicetrapib's LDL-lowering role |
| 3 | 6. Lipoprotein(a) | Structure (apo(a) kringles), genetics (LPA), why it is measured once, risk thresholds, aortic stenosis | Antisense and siRNA in outcome trials (pelacarsen, olpasiran, lepodisiran, zerlasiran), oral muvalaplin; what to do today (risk-factor control, apheresis, PCSK9 effect) |
| 4 | 7. Measuring lipids and estimating risk | Non-fasting samples, non-HDL cholesterol, apoB, remnant cholesterol, Lp(a), secondary causes; SCORE2 and SCORE2-OP, risk modifiers, coronary calcium, lifetime risk; US PREVENT for comparison | Which marker guides which drug |
| 4 | 8. Targets and treatment strategy | LDL-C goals by risk class, "≥50% lowering and to goal", the sooner-the-lower-the-better, early combination therapy, in-hospital intensification after ACS (ESC/EAS 2019 + 2025 focused update; ACC/AHA 2018; the Saudi guideline) | How the targets translate into the drug ladder |
| 5 | 9. Statins A to Z | Potency and intensity, pharmacokinetics, interactions (CYP3A4, OATP1B1, with resmetirom), muscle symptoms and the SAMS pathway, liver safety and MASLD, new-onset diabetes, adherence and nocebo | Statins in detail |
| 5 | 10. The modern toolbox and the trials behind it | Ezetimibe (IMPROVE-IT), bempedoic acid (CLEAR Outcomes), evolocumab (FOURIER; VESALIUS-CV primary prevention, 2025), alirocumab (ODYSSEY OUTCOMES), inclisiran (ORION; outcome trials pending), evinacumab for HoFH, icosapent ethyl (REDUCE-IT), fibrates and pemafibrate (PROMINENT), FCS drugs | Choosing and combining; cost and SFDA availability |
| 6 | 11. Familial hypercholesterolaemia and special populations | Dutch Lipid Clinic criteria, genetic testing, cascade screening, children, HoFH; diabetes, CKD, MASLD, HIV, pregnancy and lactation, older adults, stroke, peripheral artery disease | Pathway targets by population |
| 6 | 12. Lipid care around the world; running a lipid clinic | How ESC/EAS, ACC/AHA, Canadian, Asian and Middle Eastern guidelines differ; drug approval and availability by regulator (FDA, EMA, MHRA, SFDA and others); access and cost; consanguinity and FH in high-prevalence populations; diet and religious fasting; pathways, referral criteria, patient education, shared decisions | Final case portfolio and sign-off |

Each week: two chapter modules on the site, two worked cases with model answers, one "bring your
own case" for the mentor session, and a logbook entry. Sign-off is a 10-case portfolio plus a
structured oral case discussion. Trial figures (for example VESALIUS-CV: 12,257 patients, 4.6 years,
19% relative reduction in four-point MACE) are checked against the primary papers before they are
written into a module.

### Decisions (dyslipidaemia)

- **B1.** Who are the preceptees in the first cohort (residents, family physicians, pharmacists)? That
  sets the depth of modules 1–6.
- **B2.** Mentoring format: weekly video sessions, or clinic-based? How many per cohort?
- **B3.** Which national guidelines to compare in module 12 besides ESC/EAS and ACC/AHA (please send
  the regional documents you use, the Saudi one included).
- **B4.** Confirm the title, or pick one of the alternatives.

---

## 3. MASLD and MASH: what was done and the review cadence

Done on 11 November 2026 (see `REVIEW.md` for the exact pages to check):

- Module 2 and the drug reference pages now carry the **EASL–EASD–EASO 2026 guidance on resmetirom
  and semaglutide** (J Hepatol, online 29 September 2026): pharmacotherapy recommended for non-cirrhotic
  MASH F2–F3 on top of lifestyle change; semaglutide preferred with obesity, type 2 diabetes or
  cardiovascular disease, resmetirom without obesity or on a GLP-1 drug; no combination as first line;
  not in cirrhosis. The old line "expect EASL to revisit" is gone.
- Module 5 and the cirrhosis reference now note that **Baveno VIII** (J Hepatol 2026;85:993–1018)
  has replaced Baveno VII and revised cut-offs; the site still quotes the Baveno VII values until you
  check the full text.
- Module 4 cites the **ADA Standards of Care 2026** (Section 4) instead of 2025.
- The pages were otherwise already current: AASLD November 2025 semaglutide update, FDA approvals
  (resmetirom March 2024, semaglutide August 2025), EU conditional approval of resmetirom (August 2025),
  UK approvals (2026), AASLD paediatric statement 2025, Saudi 2026 consensus, global consensus 2025.

Done on 11 November 2026 as well: on your confirmation, the site now states that the **SFDA has
registered both resmetirom and semaglutide** for MASH with fibrosis (drug reference, Module 2, the
guidance table and the patient answer). Please add the registration dates and label links when you have
them. Still open: the full-text check of the three items above. Proposed cadence: a guideline sweep every quarter (EASL Congress in May/June, AASLD Liver
Meeting in November are the two dates when things change), and the Publication Radar already brings
the papers daily.

Suggested additions once time allows: a Module 6 "MASLD in women: PCOS, pregnancy, menopause", a
Module 7 "Lean MASLD and MetALD", and an ELF/VCTE-based treatment-eligibility calculator that
mirrors the AASLD and EASL 2026 ranges (the calculator hub already has the engine).

---

## 4. Obesity: a top-tier course aligned with OMEC, SCOPE, EASO, SCFHS, NICE and the Saudi guideline

### What "aligned" will mean on the page

A visible map from every module to:

- **OMEC** (Obesity Medicine Education Collaborative: OMA, TOS, ASMBS): the 32 competencies across the
  six ACGME domains (patient care, medical knowledge, practice-based learning and improvement,
  interpersonal and communication skills, professionalism, systems-based practice).
- **SCOPE** (World Obesity Federation): the Core Learning Path (8 modules: regulation of body weight,
  causes of obesity, complications, starting the patient dialogue, and four more on assessment and
  the treatment modalities; *confirm the current list on the SCOPE site*) and the certification rules
  (core exam plus one supplementary exam, 12 SCOPE points, 6 months' experience; renewal with two
  modules a year).
- **SCFHS Obesity Medicine Fellowship curriculum (2022)**: rotations, objectives and the competencies it
  adapts from OMEC and ACGME.
- **Saudi Guideline on the Prevention and Management of Overweight and Obesity** and **NICE NG246**
  (January 2025, updated January 2026, with the May 2026 NICE summary on GLP-1 receptor agonists and
  tirzepatide).
- **The Lancet Commission on clinical obesity (January 2025)**: preclinical versus clinical obesity,
  BMI never alone, confirmation of excess adiposity, the organ-dysfunction criteria.
- **EASO** (European Association for the Study of Obesity): its clinical framework for adult obesity
  management (2024–2025), the EASO Collaborating Centres for Obesity Management (COMs) criteria, and
  the EASO/EFAD/ESPEN nutrition and medical-nutrition statements. Prince Sultan Military Medical City's
  obesity medicine unit (Dr Abdullah Bin Badawi) became the first Saudi EASO International Affiliate
  COM in November 2026 (status 1 November 2026 to 31 October 2028). A COM-accredited centre next door is
  a natural partner for cases, peer review and a joint live session; whether to approach them is your
  call (decision C4).

### Course design: 14 modules in four parts

**Part A: Foundations (SCOPE core, OMEC medical knowledge)**
1. Obesity as a chronic disease: definitions, BMI and its limits, waist, body composition, the Lancet
   Commission's clinical and preclinical obesity; prevalence worldwide, with the regions of highest burden
2. Regulation of body weight and why weight returns: appetite hormones, set point, adaptive thermogenesis
3. Causes: genetics, environment, medications, sleep, endocrine causes, life stages
4. Complications: cardiometabolic, MASLD (link), OSA, osteoarthritis, cancer, reproductive, mental health;
   the staging systems (Edmonton Obesity Staging System, King's criteria)

**Part B: Assessment and the conversation (OMEC patient care, communication, professionalism)**
5. The first consultation: asking permission, people-first language, weight stigma, history and
   examination, the "5 As"
6. Investigations and risk stratification; screening for complications; when to refer
7. Setting goals that matter: health outcomes, not only kilograms; shared decision-making; follow-up plan

**Part C: Treatment (OMEC patient care, medical knowledge; NICE, EASO and the Saudi guideline)**
8. Nutrition therapy: evidence-based patterns, calorie deficit, meal replacements and very-low-energy
   diets, Mediterranean and regional diets, Ramadan, the dietitian's role
9. Physical activity and behaviour change: prescriptions, resistance training, sleep, digital tools, CBT
10. Pharmacotherapy 2026: semaglutide (injection and oral), tirzepatide, orforglipron (approved April 2026),
    liraglutide, naltrexone–bupropion, phentermine–topiramate, orlistat, setmelanotide; selection,
    titration, side effects, muscle preservation, stopping and restarting, cost and SFDA status; the
    pipeline (CagriSema, retatrutide, survodutide, MariTide)
11. Metabolic and bariatric surgery and endoscopic therapies: ASMBS/IFSO 2022 indications, procedures,
    outcomes, nutritional follow-up, the physician's role before and after surgery
12. Weight maintenance and relapse: the long game; deprescribing; weight regain after surgery

**Part D: Populations and systems (OMEC systems-based practice, practice-based learning)**
13. Children and adolescents, pregnancy and PCOS, older adults and sarcopenic obesity, people with
    diabetes, psychiatric illness and antipsychotics
14. Building an obesity service anywhere: pathway models from NICE, the Saudi guideline, Obesity Canada
    and EASO COM centres; multidisciplinary teams, referral, quality measures, policy and prevention;
    drug approval and access by region; a self-audit against OMEC and SCOPE

### Assessment

- 5–8 questions per module; three long cases per part; a final 70-question self-test in the SCOPE
  format so learners can gauge readiness for the SCOPE core exam.
- A printable competency self-assessment: the 32 OMEC competencies with "I can / with help / not yet".

### Decisions for you (obesity)

- **C1.** Apply for **SCOPE accreditation** of the course? What this means: SCOPE is the World Obesity
  Federation's professional education programme. *Certification* is for individuals (they pass the
  SCOPE exams and collect 12 SCOPE points). *Accreditation* is for courses and events: an organiser
  submits the course overview, slides and speaker biographies at least one month before the start,
  pays a tiered fee (by participants and duration; World Obesity members get 25% off), the Clinical
  Care Committee reviews the content, and if approved the course carries the SCOPE badge and awards
  SCOPE points to every learner who completes it. For us it would mean our obesity course counts
  towards an international obesity qualification, which is the strongest signal of quality we can
  offer. Apply for SCOPE accreditation of the course (World Obesity accredits external courses for
  SCOPE points)? It raises the standing of the course and gives learners a path to certification;
  it needs an application, a fee and a review of the content. Recommended: yes, after the English
  version is complete.
- **C2.** Apply for **SCFHS CME** accreditation for live sessions attached to the course?
- **C3.** Advisory board: two or three named obesity physicians (one bariatric surgeon, one dietitian)
  as independent peer reviewers, so the "Independent peer review" line on each page is filled.
- **C4.** Invite the PSMMC EASO-accredited obesity unit as a partner or peer reviewer for the course?

---

## 5. Build order and timeline (proposal)

The three cardiometabolic programmes share modules, so they are cheaper together. The constipation
programme is independent and can run in parallel.

| Phase | When | Deliverable |
| --- | --- | --- |
| 1 | Now to December 2026 | MASLD updates signed off; site engine made generic for any number of series (small change to `build.py`); shared cardiometabolic core modules drafted (risk assessment, GLP-1/GIP pharmacology, lifestyle prescription, bariatric surgery) |
| 2 | January to mid-February 2027 | **Lipids A to Z** (6-week preceptorship), all 12 modules in English, first mentor cohort opened |
| 3 | March to May 2027 | **Obesity course**, Parts A–D in English; SCOPE accreditation application; Arabic translation of the lipid course |
| 4 | In parallel from January 2027 | **Constipation Course 1** (January–February), **Course 4** (March–April), Course 2 (May–June), Course 3 (July–August) |
| 5 | June 2027 onwards | Arabic translations, peer review, calculators (treatment eligibility, Lp(a) interpretation, NBD score), live sessions |

Each module takes roughly one working week to draft, fact-check against the full guideline text, build,
and review in both languages. A course of 6–8 modules is therefore 6–10 weeks of content work.

## 6. What I need from you to start

1. Answers to the open decisions: A3, B1–B4 and C1–C4 above (A1 and A2 are settled).
2. The full texts (PDF) of: the EASL–EASD–EASO 2026 guidance, Baveno VIII, the ADA 2026 Section 4, the
   AGA–ACG 2023 CIC guideline, the ACG 2021 and AGA 2022 IBS guidelines, the PVA 2020 neurogenic bowel
   guideline, the ESC/EAS 2025 focused update, the EAS Lp(a) and FH statements, the OMEC competencies,
   the SCFHS fellowship curriculum, the Saudi obesity guideline, NICE NG246, and the Lancet Commission.
   Modules are only drafted from full texts, never from summaries.
3. The slides and sources of your neurogenic bowel course.
4. Names of the peer reviewers you would like to invite for each programme.
