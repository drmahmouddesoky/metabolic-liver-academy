# Medical review checklist

Private working file for Dr. Mahmoud Desoky. It is in the repository but not linked from the site.

How to use: read each page on the live site (English and Arabic). When you are happy, change `[ ]` to `[x]` and add the date, or tell Claude which pages are approved. Claude will then add "Medically reviewed by Dr. Mahmoud Desoky" to those pages.

Live site: https://drmahmouddesoky.github.io/metabolic-liver-academy/

## Main pages

| Done | Page | Reviewed on | Notes |
| --- | --- | --- | --- |
| [ ] | index.html (+ ar/) |  |  |
| [ ] | patients.html (+ ar/) |  |  |
| [ ] | guidance.html (+ ar/) |  |  |
| [ ] | guides.html (+ ar/) |  |  |
| [ ] | academy.html (+ ar/) |  |  |
| [ ] | news.html (+ ar/) |  |  |
| [ ] | about.html (+ ar/) |  |  |
| [ ] | legal.html (+ ar/) |  |  |

## Patient Q&A

| Done | Question | Page | Reviewed on | Notes |
| --- | --- | --- | --- | --- |
| [ ] | What is fatty liver (MASLD)? | learn/what-is-fatty-liver.html |  |  |
| [ ] | Why did the name change from NAFLD to MASLD? | learn/name-change-nafld-masld.html |  |  |
| [ ] | What is MASH, and how is it different? | learn/what-is-mash.html |  |  |
| [ ] | How common is fatty liver? | learn/how-common.html |  |  |
| [ ] | What causes fatty liver? | learn/what-causes-it.html |  |  |
| [ ] | Is fatty liver serious? | learn/is-fatty-liver-serious.html |  |  |
| [ ] | Does fatty liver cause symptoms? | learn/symptoms.html |  |  |
| [ ] | My ultrasound says "fatty liver". What now? | learn/ultrasound-says-fatty.html |  |  |
| [ ] | What are liver enzymes (ALT and AST)? | learn/liver-enzymes.html |  |  |
| [ ] | What is the FIB-4 score? | learn/what-is-fib4.html |  |  |
| [ ] | What is a FibroScan, and how do I prepare? | learn/fibroscan.html |  |  |
| [ ] | Do I need a liver biopsy? | learn/biopsy.html |  |  |
| [ ] | How much weight do I need to lose? | learn/how-much-weight.html |  |  |
| [ ] | What should I eat? | learn/what-to-eat.html |  |  |
| [ ] | Which drinks are good or bad for my liver? | learn/drinks.html |  |  |
| [ ] | What exercise helps fatty liver? | learn/exercise.html |  |  |
| [ ] | Can I fast in Ramadan with fatty liver? | learn/ramadan.html |  |  |
| [ ] | Is alcohol safe with fatty liver? | learn/alcohol-and-fatty-liver.html |  |  |
| [ ] | Do herbs, "detox" or supplements help? | learn/herbs-and-supplements.html |  |  |
| [ ] | Is there a medicine for fatty liver? | learn/is-there-a-medicine.html |  |  |
| [ ] | Are statins (cholesterol pills) safe for my liver? | learn/statins.html |  |  |
| [ ] | Does weight-loss surgery help the liver? | learn/weight-loss-surgery.html |  |  |
| [ ] | Can fatty liver turn into cirrhosis or cancer? | learn/cirrhosis-and-cancer.html |  |  |
| [ ] | Why does my heart matter if I have fatty liver? | learn/why-heart-matters.html |  |  |
| [ ] | How often should I be checked? | learn/how-often-checked.html |  |  |
| [ ] | I'm not overweight. Can I still have fatty liver? | learn/not-overweight.html |  |  |
| [ ] | Can children get fatty liver? | learn/children.html |  |  |
| [ ] | What about fatty liver and pregnancy? | learn/pregnancy.html |  |  |

## Please check first

- Drugs section in guidance.html: approval dates, and whether SFDA has approved resmetirom or semaglutide in Saudi Arabia.
- FIB-4 and FibroScan cut-offs (guidance.html, academy.html, learn/what-is-fib4.html, learn/fibroscan.html).
- Ramadan advice (guides.html, learn/ramadan.html).


## Doctors' reference library (added 2026-10-02)

Check these first: drug table (doses, label interactions), Baveno VII cut-offs, children's ALT values, referral triggers.

- [ ] Definitions and diagnosis of MASLD (ref/definitions.html)
- [ ] Who to test for liver fibrosis (ref/case-finding.html)
- [ ] The two-step fibrosis pathway (ref/fibrosis-pathway.html)
- [ ] Non-invasive tests at a glance (ref/nit-reference.html)
- [ ] Lifestyle treatment: the targets (ref/lifestyle.html)
- [ ] Drug treatment for MASH (ref/drugs.html)
- [ ] Heart and metabolic care in MASLD (ref/cardiometabolic.html)
- [ ] Metabolic and bariatric surgery (ref/surgery.html)
- [ ] Follow-up and referral (ref/follow-up.html)
- [ ] MASLD cirrhosis: key care (ref/cirrhosis.html)
- [ ] Special groups (ref/special-groups.html)

## Governance update (2026-10-02, after external review)

- [ ] FIB-4 calculator: method, users and limits (ref/fib4-method.html)
- [ ] Legal page: governing law set to Saudi Arabia (confirm with your lawyer)
- [ ] Legal page: 7-day reply target for error reports (change if you prefer)
- [ ] About page: write your disclosure statement (past 24 months: grants, speaker fees, advisory roles, trials, shares)

How to mark a page as reviewed: in content/learn.py or content/ref.py, add the page to REVIEWED,
e.g.  "drugs": "2026-10-20",  then run python3 build.py. The page record will show your name and date.

## Update from your MASH folder (2026-10-03)

Checked against the full texts in your folder (EASL 2024, AASLD 2023, AASLD resmetirom update 2024,
AASLD children 2025, APASL 2025, Chinese 2024, Egyptian 2022, global consensus 2025, EASL NIT 2021).

- [ ] Drugs page: resmetirom selection (8–15 kPa), dose cuts with clopidogrel, statin caps, 3/6/12-month monitoring, 12-month response table
- [ ] Special groups: children now follow AASLD 2025 (screen from age 10, ALT >22 girls / >26 boys)
- [ ] NEW: Guidelines side by side (ref/guidelines-compared.html) — check the Egyptian and Saudi rows
- [ ] NEW: Fatty liver in Saudi Arabia and the Middle East (ref/middle-east.html)
- [ ] Patient Q&A: "How common" now has MENA and Saudi figures; "Children" has the age-10 ALT test

## Institution update (2026-10-03)

- [ ] NFS calculator and its method page (ref/nfs-method.html). APRI left out on purpose.
- [ ] About page: mission, principles, "Our people", advisory board / faculty invitation
- [ ] Home page: "About the Academy" and "Why our region" box
- [ ] Portal names: Patient Portal / Physician Portal (بوابة المرضى / بوابة الأطباء)

## Model teaching module (2026-10-03)

- [ ] Module 1: Assessing liver fibrosis in MASLD (modules/fibrosis-assessment.html)
      Check: the 10 EASL recommendations (paraphrased, with grades), prognosis numbers, the case, the 5 quiz answers.

## Modules 2–5 and academic restyle (2026-10-03)

Each module was drafted from the full guideline texts in your folder and then fact-checked by a separate checker; 12 small errors were corrected.
- [ ] Module 2: Choosing drug treatment for MASH (modules/drug-treatment.html)
- [ ] Module 3: The lifestyle prescription (modules/lifestyle-prescription.html) — includes a short Ramadan section from 2 published reviews
- [ ] Module 4: MASLD in the diabetes clinic (modules/diabetes-clinic.html) — ADA 2025 wording taken from a web summary: please check
- [ ] Module 5: Caring for MASLD cirrhosis (modules/cirrhosis-care.html)
- [ ] Guidelines side by side: Saudi 2026 row now filled from the full text
- [ ] Cirrhosis quick reference: vaccines now hepatitis A/B only; MELD line removed; Saudi F3 surveillance difference added
