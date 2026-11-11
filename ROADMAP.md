# Roadmap: the next four programmes

Working plan for Dr. Mahmoud Al Desoky. Written 11 November 2026 to be discussed and changed; nothing
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
4. **Regional reality.** Every course has a "Saudi Arabia and the Gulf" section: local
   guideline, SFDA approvals and availability, Ramadan, diet patterns, access and referral paths.
5. **Same governance as today.** Page record, version, author check, independent peer review line,
   disclosure, asset register, and the medical review checklist in `REVIEW.md`.
6. **English first, Arabic within one release.** As with the GI series, a module can go live in
   English with the "Arabic coming soon" note, then be translated.

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

1. The burden and the patient's story (epidemiology, quality of life, costs; Gulf data where they exist)
2. Making the diagnosis safely (red flags, when colonoscopy is needed, screening overlap)
3. First-line treatment that works (core C0.4 applied; evidence for PEG, senna, magnesium oxide, lactulose)
4. Prescription agents (linaclotide, plecanatide, prucalopride, lubiprostone, tenapanor where licensed; choosing, dosing, cost)
5. Constipation with other conditions (diabetes, hypothyroidism, CKD, pregnancy, older adults; drug-induced)
6. Follow-up, failure and referral (what "refractory" means; what to send to the gastroenterologist with)

Standards: AGA–ACG 2023 clinical practice guideline on the pharmacological management of chronic
idiopathic constipation (strong for PEG, sodium picosulfate, linaclotide, plecanatide, prucalopride;
conditional for fibre, lactulose, senna, magnesium oxide, lubiprostone); Rome IV; UEG/ESNM 2020
functional constipation guideline; ASCRS 2016; NICE CKS. *Check whether a Saudi or Gulf constipation
consensus exists; if not, this course can propose one.*

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

### Decisions for you (constipation)

- **A1.** Four courses (recommended) or three?
- **A2.** Build order. Recommended: Course 1 first (widest audience, fastest), then Course 4 (your
  expertise and existing material), then 2, then 3.
- **A3.** Will the programme carry a joint name (for example "Bowel Health series") on the Physician
  Portal beside the MASLD & MASH and GI & Microbiome series?

---

## 2. Dyslipidaemia and hyperlipidaemia: an A-to-Z preceptorship (foundation)

You want this to be the base for the competency courses that follow. A *preceptorship* means
supervised, case-based learning with a mentor, a logbook and sign-off, not only reading. The site can
hold the curriculum, the cases, the self-tests and the logbook templates; the mentoring happens by
video call or in clinic.

### Structure (12 weeks, one module and one case per week)

| Week | Module | Key standard |
| --- | --- | --- |
| 1 | Lipoprotein biology: from chylomicron to LDL, apoB and remnants | ESC/EAS 2019 + 2025 focused update |
| 2 | Measuring lipids properly: non-fasting, non-HDL, apoB, Lp(a) once in a lifetime, secondary causes | EAS consensus statements |
| 3 | Cardiovascular risk assessment: SCORE2 and SCORE2-OP, risk modifiers, coronary calcium, lifetime risk; US PREVENT and ACC/AHA pooled cohort for comparison | ESC/EAS 2025; ACC/AHA 2018 |
| 4 | Targets and intensity: LDL-C goals by risk class, "≥50% and to target", the sooner-the-lower-the-better | ESC/EAS 2025 |
| 5 | Statins A to Z: potency, pharmacology, interactions, muscle symptoms (SAMS), liver safety (links to MASLD module), diabetes risk, adherence | ESC/EAS; AASLD statin guidance |
| 6 | Beyond statins: ezetimibe, bempedoic acid, PCSK9 antibodies, inclisiran; combination therapy from day one in very-high-risk patients | ESC/EAS 2025 |
| 7 | Triglycerides and remnants: severe hypertriglyceridaemia and pancreatitis, fibrates, icosapent ethyl, familial chylomicronaemia and the new APOC3 drugs | ESC/EAS; EAS consensus |
| 8 | Lipoprotein(a): who to test, how to interpret, what to do now, what is in trials | EAS 2022 Lp(a) consensus |
| 9 | Familial hypercholesterolaemia: Dutch Lipid Clinic criteria, genetics, cascade screening, children, homozygous FH and evinacumab | EAS FH statements |
| 10 | Special situations: diabetes, CKD, MASLD, HIV, pregnancy and lactation, older adults, after ACS (in-hospital intensification), stroke, PAD | ESC/EAS 2025 |
| 11 | Saudi Arabia and the Gulf: local guidelines, SFDA-approved agents, insurance realities, consanguinity and FH, diet and Ramadan | *Local guideline to confirm* |
| 12 | Running a lipid clinic: pathways, referral criteria, patient education, shared decisions; final case portfolio and sign-off | — |

Each week: one chapter module on the site, one worked case with a model answer, one "bring your
own case" for the mentor session, and a logbook entry. Sign-off is a 10-case portfolio plus a
structured oral case discussion.

### Decisions for you (dyslipidaemia)

- **B1.** Who are the preceptees in the first cohort (residents, family physicians, pharmacists)? That
  sets the depth of weeks 1 and 7–9.
- **B2.** Mentoring format: fortnightly video sessions, or clinic-based? How many per cohort?
- **B3.** Which local guideline to anchor week 11 (please send the Saudi document you use).

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

Still open for you: the SFDA status of both drugs for MASH; the full-text check of the three items
above. Proposed cadence: a guideline sweep every quarter (EASL Congress in May/June, AASLD Liver
Meeting in November are the two dates when things change), and the Publication Radar already brings
the papers daily.

Suggested additions once time allows: a Module 6 "MASLD in women: PCOS, pregnancy, menopause", a
Module 7 "Lean MASLD and MetALD", and an ELF/VCTE-based treatment-eligibility calculator that
mirrors the AASLD and EASL 2026 ranges (the calculator hub already has the engine).

---

## 4. Obesity: a top-tier course aligned with OMEC, SCOPE, SCFHS, the Saudi guideline and NICE

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

### Course design: 14 modules in four parts

**Part A: Foundations (SCOPE core, OMEC medical knowledge)**
1. Obesity as a chronic disease: definitions, BMI and its limits, waist, body composition, the Lancet
   Commission's clinical and preclinical obesity; Saudi and Gulf prevalence
2. Regulation of body weight and why weight returns: appetite hormones, set point, adaptive thermogenesis
3. Causes: genetics, environment, medications, sleep, endocrine causes, life stages
4. Complications: cardiometabolic, MASLD (link), OSA, osteoarthritis, cancer, reproductive, mental health;
   the staging systems (Edmonton Obesity Staging System, King's criteria)

**Part B: Assessment and the conversation (OMEC patient care, communication, professionalism)**
5. The first consultation: asking permission, people-first language, weight stigma, history and
   examination, the "5 As"
6. Investigations and risk stratification; screening for complications; when to refer
7. Setting goals that matter: health outcomes, not only kilograms; shared decision-making; follow-up plan

**Part C: Treatment (OMEC patient care, medical knowledge; NICE and Saudi guideline)**
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
14. Building an obesity service in Saudi Arabia: the Saudi guideline pathway, multidisciplinary teams,
    referral, quality measures, policy and prevention; a self-audit against OMEC and SCOPE

### Assessment

- 5–8 questions per module; three long cases per part; a final 70-question self-test in the SCOPE
  format so learners can gauge readiness for the SCOPE core exam.
- A printable competency self-assessment: the 32 OMEC competencies with "I can / with help / not yet".

### Decisions for you (obesity)

- **C1.** Apply for **SCOPE accreditation** of the course (World Obesity accredits external courses for
  SCOPE points)? It raises the standing of the course and gives learners a path to certification;
  it needs an application, a fee and a review of the content. Recommended: yes, after the English
  version is complete.
- **C2.** Apply for **SCFHS CME** accreditation for live sessions attached to the course?
- **C3.** Advisory board: two or three named obesity physicians (one bariatric surgeon, one dietitian)
  as independent peer reviewers, so the "Independent peer review" line on each page is filled.

---

## 5. Build order and timeline (proposal)

The three cardiometabolic programmes share modules, so they are cheaper together. The constipation
programme is independent and can run in parallel.

| Phase | When | Deliverable |
| --- | --- | --- |
| 1 | Now to December 2026 | MASLD updates signed off; site engine made generic for any number of series (small change to `build.py`); shared cardiometabolic core modules drafted (risk assessment, GLP-1/GIP pharmacology, lifestyle prescription, bariatric surgery) |
| 2 | January to February 2027 | **Dyslipidaemia preceptorship**, weeks 1–12 in English, first mentor cohort opened |
| 3 | March to May 2027 | **Obesity course**, Parts A–D in English; SCOPE accreditation application; Arabic translation of the lipid course |
| 4 | In parallel from January 2027 | **Constipation Course 1** (January–February), **Course 4** (March–April), Course 2 (May–June), Course 3 (July–August) |
| 5 | June 2027 onwards | Arabic translations, peer review, calculators (treatment eligibility, Lp(a) interpretation, NBD score), live sessions |

Each module takes roughly one working week to draft, fact-check against the full guideline text, build,
and review in both languages. A course of 6–8 modules is therefore 6–10 weeks of content work.

## 6. What I need from you to start

1. Answers to decisions A1–A3, B1–B3 and C1–C3 above.
2. The full texts (PDF) of: the EASL–EASD–EASO 2026 guidance, Baveno VIII, the ADA 2026 Section 4, the
   AGA–ACG 2023 CIC guideline, the ACG 2021 and AGA 2022 IBS guidelines, the PVA 2020 neurogenic bowel
   guideline, the ESC/EAS 2025 focused update, the EAS Lp(a) and FH statements, the OMEC competencies,
   the SCFHS fellowship curriculum, the Saudi obesity guideline, NICE NG246, and the Lancet Commission.
   Modules are only drafted from full texts, never from summaries.
3. The slides and sources of your neurogenic bowel course.
4. Names of the peer reviewers you would like to invite for each programme.
