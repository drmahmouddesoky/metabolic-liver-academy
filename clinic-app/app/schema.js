/* Fatty Liver Clinic: the clinical sheet.
   One schema drives the form, the report and the registry export.
   Field types: text, textarea, number, lab (number with a unit kind), select, yn (yes/no/unknown),
   check, multi (checkbox list, stored as array), date, table (rows of columns).
   `show(v, p)` hides a field; v = visit values, p = patient. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Schema = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var YN = 'yn';
  function f(k, t, label, extra) { var o = { k: k, t: t, label: label }; if (extra) for (var x in extra) o[x] = extra[x]; return o; }
  function isFemale(v, p) { return p && p.sex === 'female'; }
  function isSmoker(v) { return v.hab_smoking === 'current' || v.hab_smoking === 'ex'; }
  function drinks(v) { return v.hab_alcohol === 'current' || v.hab_alcohol === 'ex'; }

  /* Reason for encounter: SNOMED CT-style terms. Codes are SNOMED CT concept IDs where known;
     the doctor can edit the code column. */
  /* Reason for encounter: [key, label, SNOMED CT concept id, TrakCare search term, body site].
     Search terms use SNOMED CT (US) spelling so they match the TrakCare lookup. */
  var REASONS = [
    ['steatosis_imaging', 'Steatosis of liver found on imaging (incidental)', '197321007', 'Steatosis of liver', 'Liver'],
    ['abnormal_lft', 'Liver function tests abnormal (raised ALT/AST)', '166603001', 'Abnormal liver function', 'Liver'],
    ['referral', 'Patient referral for liver assessment', '3457005', 'Fatty liver', 'Liver'],
    ['dm_screen', 'Screening for liver disease in type 2 diabetes', '44054006', 'Fatty liver', 'Liver'],
    ['obesity_screen', 'Screening for liver disease in obesity', '414916001', 'Fatty liver', 'Liver'],
    ['followup', 'Follow-up visit', '185389009', 'Follow-up', ''],
    ['fatigue', 'Fatigue', '84229001', 'Fatigue', ''],
    ['ruq_pain', 'Right upper quadrant pain', '301717006', 'Right upper quadrant pain', 'Right upper quadrant of abdomen'],
    ['abd_pain', 'Abdominal pain', '21522001', 'Abdominal pain', 'Abdomen'],
    ['dyspepsia', 'Dyspepsia', '162031009', 'Dyspepsia', ''],
    ['nausea', 'Nausea', '422587007', 'Nausea', ''],
    ['anorexia', 'Loss of appetite', '79890006', 'Loss of appetite', ''],
    ['weight_gain', 'Weight gain', '8943002', 'Weight gain', ''],
    ['weight_loss', 'Weight loss', '89362005', 'Weight loss', ''],
    ['jaundice', 'Jaundice', '18165001', 'Jaundice', ''],
    ['pruritus', 'Itching', '418290006', 'Itching', 'Skin'],
    ['distension', 'Swollen abdomen', '60728008', 'Abdominal distension', 'Abdomen'],
    ['oedema', 'Oedema of legs', '267038008', 'Edema of lower extremity', 'Lower limb'],
    ['hepatomegaly', 'Large liver', '80515008', 'Hepatomegaly', 'Liver'],
    ['hematemesis', 'Vomiting blood', '8765009', 'Hematemesis', ''],
    ['melena', 'Melaena', '2901004', 'Melena', ''],
    ['confusion', 'Hepatic encephalopathy', '13920009', 'Hepatic encephalopathy', ''],
    ['dyspnoea', 'Shortness of breath', '267036007', 'Dyspnea', ''],
    ['second_opinion', 'Second opinion', '', 'Second opinion', ''],
    ['other', 'Other (describe)', '', '', '']
  ];

  var STEATOGENIC = ['Amiodarone', 'Methotrexate', 'Tamoxifen', 'Corticosteroids (systemic)', 'Valproate', 'Oestrogens / HRT',
    'Antiretrovirals', 'Tetracyclines', 'Irinotecan / 5-FU', 'Anabolic steroids', 'Total parenteral nutrition'];
  var LIVER_DRUGS = ['Metformin', 'GLP-1 receptor agonist (semaglutide, liraglutide, dulaglutide)', 'Tirzepatide', 'SGLT2 inhibitor',
    'Pioglitazone', 'DPP-4 inhibitor', 'Sulfonylurea', 'Insulin', 'Statin', 'Ezetimibe', 'Fibrate', 'Omega-3',
    'Vitamin E', 'Resmetirom', 'Ursodeoxycholic acid', 'Silymarin / milk thistle', 'Antihypertensive', 'Aspirin / antiplatelet',
    'Anticoagulant', 'Thyroxine', 'Carvedilol / propranolol', 'Lactulose / rifaximin', 'Diuretic (spironolactone / furosemide)', 'Proton pump inhibitor', 'NSAID (regular use)'];

  var SECTIONS = [
    /* ---------------- 1. Personal history (patient level) ---------------- */
    { id: 'patient', title: 'Personal history', level: 'patient', groups: [
      { title: 'Identification', fields: [
        f('fileNo', 'text', 'File number / URN', { cols: 1 }),
        f('name', 'text', 'Full name', { req: true, cols: 2 }),
        f('phone', 'text', 'Phone', { cols: 1 }),
        f('dob', 'date', 'Date of birth', { cols: 1, help: 'Leave blank and enter the age instead if unknown' }),
        f('age', 'number', 'Age (years)', { cols: 1, min: 1, max: 120, show: function (v, p) { return !p.dob; } }),
        f('sex', 'select', 'Sex', { req: true, cols: 1, opts: [['male', 'Male'], ['female', 'Female']] }),
        f('ethnicity', 'select', 'Ancestry (for waist cut-offs)', { cols: 1, opts: [['other', 'Arab / European / other'], ['asian', 'South or East Asian']] })
      ] },
      { title: 'Social', fields: [
        f('occupation', 'text', 'Occupation', { cols: 1 }),
        f('marital', 'select', 'Marital status', { cols: 1, opts: [['single', 'Single'], ['married', 'Married'], ['divorced', 'Divorced'], ['widowed', 'Widowed']] }),
        f('residence', 'text', 'Residence', { cols: 1 }),
        f('nationalId', 'text', 'National ID (optional)', { cols: 1 }),
        f('referrer', 'text', 'Referred by', { cols: 1 }),
        f('insurance', 'text', 'Insurance / payer', { cols: 1 })
      ] }
    ] },

    /* ---------------- 2. Encounter ---------------- */
    { id: 'encounter', title: 'Complaint', level: 'visit', groups: [
      { title: 'Pasted patient data', fields: [
        f('paste_text', 'textarea', 'Pasted text', { cols: 4, rows: 6 }),
        f('paste_in_note', 'check', 'Include the pasted text in the note as "Previous records"', { cols: 4 })
      ] },
      { title: 'Visit', fields: [
        f('date', 'date', 'Visit date', { req: true, cols: 1 }),
        f('type', 'select', 'Visit type', { cols: 1, opts: [['initial', 'Initial assessment'], ['followup', 'Follow-up'], ['review', 'Results review']] }),
        f('episodeNo', 'text', 'Episode number', { cols: 1 }),
        f('source', 'select', 'Source', { cols: 1, opts: [['self', 'Self-referred'], ['gp', 'Primary care'], ['diabetes', 'Diabetes / endocrine clinic'], ['cardio', 'Cardiology'], ['bariatric', 'Bariatric clinic'], ['other', 'Other']] })
      ] },
      { title: 'Reason for encounter', fields: [
        f('complaint', 'textarea', 'In the patient’s own words', { cols: 4, rows: 2, ph: 'e.g. "The doctor found fat on my liver in an ultrasound"' }),
        f('complaint_duration', 'text', 'Duration', { cols: 1, ph: 'e.g. 3 months' }),
        f('complaint_onset', 'date', 'Onset date', { cols: 1, help: 'Required by TrakCare. If blank, worked out from the duration.' }),
        f('complaint_severity', 'select', 'Severity', { cols: 1, opts: [['mild', 'Mild'], ['moderate', 'Moderate'], ['severe', 'Severe']] }),
        f('reasons', 'multi', 'Coded reason(s), SNOMED CT style', { cols: 4, opts: REASONS.map(function (r) { return [r[0], r[1] + (r[2] ? ' · ' + r[2] : '')]; }) }),
        f('reason_other', 'text', 'Other reason / code', { cols: 2, show: function (v) { return (v.reasons || []).indexOf('other') >= 0; } })
      ] }
    ] },

    /* ---------------- 3. HPI ---------------- */
    { id: 'hpi', title: 'Present illness', level: 'visit', groups: [
      { title: 'History of present illness', fields: [
        f('hpi_onset', 'text', 'Onset / when first noticed', { cols: 1 }),
        f('hpi_discovery', 'select', 'How it was discovered', { cols: 1, opts: [['incidental', 'Incidental imaging'], ['labs', 'Abnormal blood tests'], ['symptoms', 'Symptoms'], ['screening', 'Screening (diabetes / obesity)'], ['other', 'Other']] }),
        f('hpi_course', 'select', 'Course', { cols: 1, opts: [['stable', 'Stable'], ['progressive', 'Progressive'], ['improving', 'Improving'], ['fluctuating', 'Fluctuating']] }),
        f('hpi_symptoms', 'multi', 'Symptoms', { cols: 4, opts: [['none', 'Asymptomatic'], ['fatigue', 'Fatigue'], ['ruq', 'Right upper quadrant discomfort'], ['dyspepsia', 'Dyspepsia / bloating'], ['nausea', 'Nausea'], ['anorexia', 'Loss of appetite'], ['pruritus', 'Itching'], ['sleep', 'Poor sleep / snoring'], ['daytime', 'Daytime sleepiness'], ['arthralgia', 'Joint pains'], ['depression', 'Low mood']] }),
        f('hpi_decomp_none', 'check', 'Asked: no jaundice, abdominal or leg swelling, GI bleeding or confusion', { cols: 4 }),
        f('hpi_decomp', 'multi', 'Features of decompensation', { cols: 4, opts: [['jaundice', 'Jaundice'], ['ascites', 'Abdominal swelling'], ['oedema', 'Leg swelling'], ['bleed', 'Haematemesis / melaena'], ['confusion', 'Confusion / sleep reversal'], ['fever', 'Fever']] }),
        f('hpi_weight_max', 'number', 'Maximum lifetime weight (kg)', { cols: 1 }),
        f('hpi_weight_change', 'text', 'Weight change in last year', { cols: 1, ph: 'e.g. +6 kg' }),
        f('hpi_prior_tests', 'textarea', 'Previous liver tests, imaging, biopsy or treatment', { cols: 2, rows: 2 }),
        f('hpi_text', 'textarea', 'Narrative', { cols: 4, rows: 5, ph: 'Full story in chronological order' })
      ] }
    ] },

    /* ---------------- 4. Past, drug, habits ---------------- */
    { id: 'past', title: 'Past history', level: 'visit', groups: [
      { title: 'Cardiometabolic', fields: [
        f('pm_dm', 'select', 'Diabetes', { cols: 1, opts: [['no', 'No'], ['pre', 'Pre-diabetes'], ['t2', 'Type 2 diabetes'], ['t1', 'Type 1 diabetes'], ['unknown', 'Not known']] }),
        f('pm_dm_years', 'number', 'Diabetes duration (years)', { cols: 1, show: function (v) { return v.pm_dm === 't2' || v.pm_dm === 't1'; } }),
        f('pm_dm_complications', 'multi', 'Diabetes complications', { cols: 2, opts: [['retino', 'Retinopathy'], ['nephro', 'Nephropathy'], ['neuro', 'Neuropathy'], ['cad', 'Coronary disease']], show: function (v) { return v.pm_dm === 't2' || v.pm_dm === 't1'; } }),
        f('pm_htn', YN, 'Hypertension', { cols: 1 }),
        f('pm_htn_treated', YN, 'On antihypertensive treatment', { cols: 1, show: function (v) { return v.pm_htn === 'yes'; } }),
        f('pm_lipid', YN, 'Dyslipidaemia', { cols: 1 }),
        f('pm_obesity', YN, 'Known obesity', { cols: 1, help: 'Counts when weight and waist are not measured' }),
        f('pm_lipid_treated', YN, 'On lipid-lowering treatment', { cols: 1, show: function (v) { return v.pm_lipid === 'yes'; } }),
        f('pm_cvd', 'multi', 'Cardiovascular disease', { cols: 4, opts: [['cad', 'Coronary artery disease / MI'], ['stroke', 'Stroke / TIA'], ['hf', 'Heart failure'], ['pad', 'Peripheral arterial disease'], ['af', 'Atrial fibrillation']] }),
        f('pm_osa', 'select', 'Obstructive sleep apnoea', { cols: 1, opts: [['no', 'No'], ['suspected', 'Suspected'], ['yes', 'Diagnosed'], ['cpap', 'On CPAP']] }),
        f('pm_pcos', YN, 'PCOS', { cols: 1, show: isFemale }),
        f('pm_thyroid', 'select', 'Thyroid disease', { cols: 1, opts: [['no', 'No'], ['hypo', 'Hypothyroidism'], ['hyper', 'Hyperthyroidism'], ['other', 'Other']] }),
        f('pm_ckd', YN, 'Chronic kidney disease', { cols: 1 }),
        f('pm_gout', YN, 'Gout / hyperuricaemia', { cols: 1 }),
        f('pm_hypogonadism', YN, 'Hypogonadism', { cols: 1, show: function (v, p) { return p.sex === 'male'; } })
      ] },
      { title: 'Liver and other', fields: [
        f('pm_liver', 'multi', 'Liver history', { cols: 4, opts: [['steatosis', 'Previously diagnosed fatty liver'], ['hbv', 'Hepatitis B'], ['hcv', 'Hepatitis C (treated or not)'], ['aih', 'Autoimmune hepatitis'], ['biopsy', 'Previous liver biopsy'], ['elasto', 'Previous FibroScan'], ['cirrhosis', 'Known cirrhosis'], ['hcc', 'Liver cancer'], ['gallstones', 'Gallstones']] }),
        f('pm_surgery', 'multi', 'Surgery', { cols: 4, opts: [['bariatric', 'Bariatric / metabolic surgery'], ['chole', 'Cholecystectomy'], ['other', 'Other abdominal surgery']] }),
        f('pm_bariatric_type', 'text', 'Bariatric procedure and year', { cols: 2, show: function (v) { return (v.pm_surgery || []).indexOf('bariatric') >= 0; } }),
        f('pm_transfusion', YN, 'Blood transfusion', { cols: 1 }),
        f('pm_malignancy', 'text', 'Malignancy', { cols: 1 }),
        f('pm_psych', 'text', 'Psychiatric history', { cols: 1 }),
        f('pm_other', 'textarea', 'Other past history', { cols: 4, rows: 2 })
      ] },
      { title: 'Drug history', fields: [
        f('dh_meds', 'table', 'Current medications', { cols: 4, columns: [['drug', 'Drug'], ['dose', 'Dose and frequency'], ['since', 'Since'], ['indication', 'Indication']] }),
        f('dh_liver', 'multi', 'Liver-relevant drug classes in use', { cols: 4, opts: LIVER_DRUGS.map(function (d) { return [d, d]; }) }),
        f('dh_steatogenic', 'multi', 'Steatogenic drugs (current or past)', { cols: 4, opts: STEATOGENIC.map(function (d) { return [d, d]; }) }),
        f('dh_herbal', 'text', 'Herbal, supplements, protein or slimming products', { cols: 2 }),
        f('dh_allergy', 'text', 'Drug allergies', { cols: 2 })
      ] },
      { title: 'Special habits', fields: [
        f('hab_smoking', 'select', 'Smoking', { cols: 1, opts: [['never', 'Never'], ['current', 'Current'], ['ex', 'Ex-smoker']] }),
        f('hab_cigs', 'number', 'Cigarettes per day', { cols: 1, show: isSmoker }),
        f('hab_smoke_years', 'number', 'Years smoked', { cols: 1, show: isSmoker }),
        f('hab_shisha', 'select', 'Waterpipe (shisha)', { cols: 1, opts: [['no', 'No'], ['occasional', 'Occasional'], ['daily', 'Daily']] }),
        f('hab_alcohol', 'select', 'Alcohol', { cols: 1, opts: [['never', 'Never'], ['current', 'Current'], ['ex', 'Stopped']] }),
        f('hab_alc_g', 'number', 'Alcohol: grams per week', { cols: 1, show: drinks, help: 'One standard drink ≈ 10 g (330 mL beer, 100 mL wine, 30 mL spirits)' }),
        f('hab_audit1', 'select', 'AUDIT-C 1: how often', { cols: 1, show: drinks, opts: [['0', 'Never'], ['1', 'Monthly or less'], ['2', '2–4 times a month'], ['3', '2–3 times a week'], ['4', '4+ times a week']] }),
        f('hab_audit2', 'select', 'AUDIT-C 2: drinks on a typical day', { cols: 1, show: drinks, opts: [['0', '1–2'], ['1', '3–4'], ['2', '5–6'], ['3', '7–9'], ['4', '10+']] }),
        f('hab_audit3', 'select', 'AUDIT-C 3: 6+ drinks on one occasion', { cols: 1, show: drinks, opts: [['0', 'Never'], ['1', 'Less than monthly'], ['2', 'Monthly'], ['3', 'Weekly'], ['4', 'Daily or almost']] }),
        f('hab_activity', 'number', 'Physical activity (minutes/week, moderate)', { cols: 1 }),
        f('hab_sitting', 'number', 'Sitting hours per day', { cols: 1 }),
        f('hab_ssb', 'number', 'Sugary drinks per day', { cols: 1 }),
        f('hab_fastfood', 'number', 'Fast-food meals per week', { cols: 1 }),
        f('hab_coffee', 'number', 'Coffee cups per day', { cols: 1 }),
        f('hab_sleep', 'number', 'Sleep hours per night', { cols: 1 }),
        f('hab_diet', 'text', 'Diet pattern', { cols: 2, ph: 'e.g. high bread and rice, late dinner' }),
        f('hab_drugs', 'text', 'Recreational substances', { cols: 2 })
      ] },
      { title: 'Menstrual and obstetric history', show: isFemale, fields: [
        f('mh_status', 'select', 'Menstrual status', { cols: 1, opts: [['regular', 'Regular'], ['irregular', 'Irregular'], ['amenorrhoea', 'Amenorrhoea'], ['menopause', 'Post-menopausal'], ['pregnant', 'Pregnant'], ['lactating', 'Lactating']] }),
        f('mh_lmp', 'date', 'Last menstrual period', { cols: 1 }),
        f('mh_menarche', 'number', 'Age at menarche', { cols: 1 }),
        f('mh_menopause_age', 'number', 'Age at menopause', { cols: 1, show: function (v) { return v.mh_status === 'menopause'; } }),
        f('mh_gp', 'text', 'Gravida / para', { cols: 1, ph: 'G3 P2' }),
        f('mh_gdm', YN, 'Gestational diabetes', { cols: 1 }),
        f('mh_contraception', 'text', 'Contraception / HRT', { cols: 2 })
      ] }
    ] },

    /* ---------------- 5. Family history ---------------- */
    { id: 'family', title: 'Family history', level: 'visit', groups: [
      { title: 'First-degree relatives', fields: [
        f('fh', 'multi', 'Conditions in parents, siblings or children', { cols: 4, opts: [['steatosis', 'Fatty liver'], ['cirrhosis', 'Cirrhosis'], ['hcc', 'Liver cancer'], ['dm', 'Type 2 diabetes'], ['obesity', 'Obesity'], ['htn', 'Hypertension'], ['lipid', 'Dyslipidaemia'], ['cvd', 'Premature heart disease (men <55, women <65)'], ['stroke', 'Stroke'], ['hbv', 'Hepatitis B'], ['hcv', 'Hepatitis C'], ['autoimmune', 'Autoimmune disease'], ['haemochromatosis', 'Haemochromatosis'], ['wilson', "Wilson's disease"]] }),
        f('fh_consanguinity', YN, 'Consanguineous parents', { cols: 1 }),
        f('fh_text', 'textarea', 'Details', { cols: 3, rows: 2 })
      ] }
    ] },

    /* ---------------- 6. Examination ---------------- */
    { id: 'exam', title: 'Examination', level: 'visit', groups: [
      { title: 'General', fields: [
        f('ex_general_normal', 'check', 'Good mood, oriented, cooperative; no pallor, jaundice or cyanosis', { cols: 4, def: true }),
        f('ex_mental', 'multi', 'Abnormal general findings', { cols: 4, opts: [['pallor', 'Pallor'], ['jaundice', 'Jaundice'], ['cyanosis', 'Cyanosis'], ['confused', 'Confused / drowsy'], ['uncooperative', 'Uncooperative'], ['distress', 'In distress'], ['cachexia', 'Cachexia / muscle wasting'], ['lymph', 'Lymphadenopathy']], show: function (v) { return !v.ex_general_normal; } }),
        f('ex_build', 'select', 'Body build', { cols: 1, opts: [['average', 'Average'], ['overweight', 'Overweight'], ['obese', 'Obese'], ['central', 'Central obesity'], ['thin', 'Thin']] }),
        f('ex_he_grade', 'select', 'Hepatic encephalopathy (West Haven)', { cols: 1, opts: [['0', 'None'], ['1', 'Grade 1'], ['2', 'Grade 2'], ['3', 'Grade 3'], ['4', 'Grade 4']] }),
        f('ex_general_text', 'text', 'Other', { cols: 2 })
      ] },
      { title: 'Vital signs and anthropometrics', fields: [
        f('ex_sbp', 'number', 'Systolic BP (mmHg)', { cols: 1, min: 50, max: 300 }),
        f('ex_dbp', 'number', 'Diastolic BP (mmHg)', { cols: 1, min: 20, max: 200 }),
        f('ex_hr', 'number', 'Heart rate (/min)', { cols: 1 }),
        f('ex_temp', 'number', 'Temperature (°C)', { cols: 1, step: 0.1 }),
        f('ex_rr', 'number', 'Respiratory rate (/min)', { cols: 1 }),
        f('ex_spo2', 'number', 'SpO₂ (%)', { cols: 1 }),
        f('ex_wt', 'number', 'Weight (kg)', { cols: 1, min: 20, max: 400, step: 0.1 }),
        f('ex_ht', 'number', 'Height (cm)', { cols: 1, min: 100, max: 230 }),
        f('ex_waist', 'number', 'Waist circumference (cm)', { cols: 1, min: 40, max: 250 }),
        f('ex_hip', 'number', 'Hip circumference (cm)', { cols: 1, min: 40, max: 250 }),
        f('ex_neck', 'number', 'Neck circumference (cm)', { cols: 1 }),
        f('ex_bodyfat', 'number', 'Body fat (%) if measured', { cols: 1 })
      ] },
      { title: 'Head, neck and extremities', fields: [
        f('ex_head', 'multi', 'Head', { cols: 4, opts: [['icterus', 'Scleral icterus'], ['xanthelasma', 'Xanthelasma'], ['parotid', 'Parotid enlargement'], ['fetor', 'Fetor hepaticus'], ['conj_pallor', 'Conjunctival pallor'], ['kf', 'Kayser–Fleischer rings'], ['moon', 'Cushingoid facies']] }),
        f('ex_neck', 'multi', 'Neck', { cols: 4, opts: [['acanthosis', 'Acanthosis nigricans'], ['goitre', 'Goitre'], ['jvp', 'Raised JVP'], ['lymph', 'Lymph nodes'], ['buffalo', 'Dorsocervical fat pad']] }),
        f('ex_ext', 'multi', 'Extremities and skin', { cols: 4, opts: [['palmar', 'Palmar erythema'], ['dupuytren', "Dupuytren's contracture"], ['flap', 'Flapping tremor (asterixis)'], ['oedema', 'Pitting oedema'], ['clubbing', 'Clubbing'], ['leukonychia', 'Leukonychia'], ['wasting', 'Muscle wasting'], ['bruising', 'Bruising'], ['spider', 'Spider naevi'], ['xanthoma', 'Xanthomata'], ['skin_tags', 'Skin tags'], ['hirsutism', 'Hirsutism'], ['psoriasis', 'Psoriasis'], ['lipodystrophy', 'Lipodystrophy pattern']] }),
        f('ex_spider_n', 'number', 'Number of spider naevi', { cols: 1, show: function (v) { return (v.ex_ext || []).indexOf('spider') >= 0; } }),
        f('ex_oedema_grade', 'select', 'Oedema grade', { cols: 1, opts: [['1', '+'], ['2', '++'], ['3', '+++']], show: function (v) { return (v.ex_ext || []).indexOf('oedema') >= 0; } }),
        f('ex_hne_text', 'text', 'Other', { cols: 2 })
      ] },
      { title: 'Cardiac', fields: [
        f('ex_cardiac_normal', 'check', 'Normal S1 and S2, no murmurs, apex not displaced', { cols: 4, def: true }),
        f('ex_cardiac', 'multi', 'Findings', { cols: 4, opts: [['murmur', 'Murmur'], ['apex', 'Displaced apex'], ['s3', 'Added sounds (S3/S4)'], ['irregular', 'Irregular rhythm']], show: function (v) { return !v.ex_cardiac_normal; } }),
        f('ex_cardiac_text', 'text', 'Details', { cols: 4 })
      ] },
      { title: 'Chest', fields: [
        f('ex_chest_normal', 'check', 'Equal air entry, vesicular breathing, no added sounds', { cols: 4, def: true }),
        f('ex_chest', 'multi', 'Findings', { cols: 4, opts: [['crackles', 'Crackles'], ['wheeze', 'Wheeze'], ['effusion', 'Pleural effusion signs'], ['gynaecomastia', 'Gynaecomastia'], ['spider_chest', 'Spider naevi on chest'], ['hair_loss', 'Loss of body hair']], show: function (v) { return !v.ex_chest_normal; } }),
        f('ex_chest_text', 'text', 'Details', { cols: 4 })
      ] },
      { title: 'Abdomen', fields: [
        f('ex_abd_normal', 'check', 'Soft, lax, no organomegaly, no ascites', { cols: 4, def: true }),
        f('ex_abd', 'multi', 'Findings', { cols: 4, opts: [['distension', 'Distension'], ['hepatomegaly', 'Hepatomegaly'], ['tender_liver', 'Tender liver'], ['splenomegaly', 'Splenomegaly'], ['ascites', 'Ascites (shifting dullness)'], ['caput', 'Caput medusae / dilated veins'], ['hernia', 'Hernia'], ['scars', 'Surgical scars'], ['striae', 'Striae'], ['tenderness', 'Tenderness elsewhere'], ['mass', 'Mass']], show: function (v) { return !v.ex_abd_normal; } }),
        f('ex_liver_span', 'number', 'Liver span (cm)', { cols: 1, show: function (v) { return !v.ex_abd_normal; } }),
        f('ex_liver_edge', 'select', 'Liver edge', { cols: 1, opts: [['smooth', 'Smooth, soft'], ['firm', 'Firm'], ['hard', 'Hard'], ['nodular', 'Nodular']], show: function (v) { return !v.ex_abd_normal; } }),
        f('ex_spleen_cm', 'number', 'Spleen below costal margin (cm)', { cols: 1, show: function (v) { return !v.ex_abd_normal; } }),
        f('ex_ascites_grade', 'select', 'Ascites grade', { cols: 1, opts: [['none', 'None'], ['mild', 'Grade 1 (only on ultrasound)'], ['moderate', 'Grade 2 (moderate)'], ['severe', 'Grade 3 (tense)']], show: function (v) { return !v.ex_abd_normal; } }),
        f('ex_abd_text', 'text', 'Details', { cols: 4 })
      ] },
      { title: 'Other findings', fields: [
        f('ex_text', 'textarea', 'Findings', { cols: 4, rows: 3, ph: 'Free text, e.g. firm liver edge 2 cm below costal margin, no ascites' }),
        f('ex_other_text', 'textarea', 'Neurological, musculoskeletal, other', { cols: 4, rows: 2 })
      ] }
    ] },

    /* ---------------- 7. Investigations: laboratory ---------------- */
    { id: 'labs', title: 'Laboratory', level: 'visit', groups: [
      { title: 'Sample', fields: [
        f('lab_date', 'date', 'Date of tests', { cols: 1 }),
        f('lab_lab', 'text', 'Laboratory', { cols: 1 }),
        f('lab_fasting', YN, 'Fasting sample', { cols: 1 })
      ] },
      { title: 'Blood count', fields: [
        f('lab_hb', 'lab', 'Haemoglobin', { kind: 'hb' }),
        f('lab_wbc', 'lab', 'WBC', { kind: 'wbc' }),
        f('lab_plt', 'lab', 'Platelets', { kind: 'plt' }),
        f('lab_mcv', 'number', 'MCV (fL)')
      ] },
      { title: 'Liver', fields: [
        f('lab_ast', 'lab', 'AST', { kind: 'enzyme' }),
        f('lab_alt', 'lab', 'ALT', { kind: 'enzyme' }),
        f('lab_ggt', 'lab', 'GGT', { kind: 'enzyme' }),
        f('lab_alp', 'lab', 'ALP', { kind: 'enzyme' }),
        f('lab_tbil', 'lab', 'Total bilirubin', { kind: 'bili' }),
        f('lab_dbil', 'lab', 'Direct bilirubin', { kind: 'bili' }),
        f('lab_alb', 'lab', 'Albumin', { kind: 'albumin' }),
        f('lab_tp', 'lab', 'Total protein', { kind: 'protein' }),
        f('lab_inr', 'number', 'INR', { step: 0.01 }),
        f('lab_elf', 'number', 'ELF score', { step: 0.01 })
      ] },
      { title: 'Metabolic', fields: [
        f('lab_glu', 'lab', 'Fasting glucose', { kind: 'glucose' }),
        f('lab_glu2h', 'lab', '2-h glucose (OGTT)', { kind: 'glucose' }),
        f('lab_hba1c', 'lab', 'HbA1c', { kind: 'hba1c' }),
        f('lab_ins', 'lab', 'Fasting insulin', { kind: 'insulin' }),
        f('lab_cpep', 'number', 'C-peptide (ng/mL)'),
        f('lab_tc', 'lab', 'Total cholesterol', { kind: 'chol' }),
        f('lab_ldl', 'lab', 'LDL', { kind: 'chol' }),
        f('lab_hdl', 'lab', 'HDL', { kind: 'chol' }),
        f('lab_tg', 'lab', 'Triglycerides', { kind: 'tg' }),
        f('lab_urate', 'lab', 'Uric acid', { kind: 'urate' }),
        f('lab_tsh', 'lab', 'TSH', { kind: 'tsh' }),
        f('lab_ft4', 'number', 'Free T4 (ng/dL)'),
        f('lab_vitd', 'lab', 'Vitamin D', { kind: 'vitd' })
      ] },
      { title: 'Kidney', fields: [
        f('lab_creat', 'lab', 'Creatinine', { kind: 'creat' }),
        f('lab_na', 'lab', 'Sodium', { kind: 'na' }),
        f('lab_k', 'number', 'Potassium (mmol/L)'),
        f('lab_acr', 'lab', 'Urine albumin/creatinine', { kind: 'acr' })
      ] },
      { title: 'Iron and other causes', fields: [
        f('lab_ferritin', 'lab', 'Ferritin', { kind: 'ferritin' }),
        f('lab_tsat', 'lab', 'Transferrin saturation', { kind: 'pct' }),
        f('lab_hbsag', 'select', 'HBsAg', { opts: [['neg', 'Negative'], ['pos', 'Positive']] }),
        f('lab_antihbc', 'select', 'Anti-HBc', { opts: [['neg', 'Negative'], ['pos', 'Positive']] }),
        f('lab_antihbs', 'select', 'Anti-HBs', { opts: [['neg', 'Negative (<10)'], ['pos', 'Positive (immune)']] }),
        f('lab_antihcv', 'select', 'Anti-HCV', { opts: [['neg', 'Negative'], ['pos', 'Positive']] }),
        f('lab_hcvrna', 'select', 'HCV RNA', { opts: [['neg', 'Not detected'], ['pos', 'Detected']], show: function (v) { return v.lab_antihcv === 'pos'; } }),
        f('lab_hav', 'select', 'Anti-HAV IgG', { opts: [['neg', 'Negative'], ['pos', 'Positive (immune)']] }),
        f('lab_ana', 'select', 'ANA', { opts: [['neg', 'Negative'], ['low', 'Low titre (≤1:80)'], ['pos', 'Positive (>1:80)']] }),
        f('lab_asma', 'select', 'ASMA', { opts: [['neg', 'Negative'], ['pos', 'Positive']] }),
        f('lab_ama', 'select', 'AMA', { opts: [['neg', 'Negative'], ['pos', 'Positive']] }),
        f('lab_igg', 'lab', 'IgG', { kind: 'igg' }),
        f('lab_cerulo', 'lab', 'Ceruloplasmin', { kind: 'cerulo' }),
        f('lab_ttg', 'select', 'Coeliac tTG-IgA', { opts: [['neg', 'Negative'], ['pos', 'Positive']] }),
        f('lab_a1at', 'number', 'Alpha-1 antitrypsin (mg/dL)'),
        f('lab_afp', 'lab', 'AFP', { kind: 'afp' }),
        f('lab_crp', 'number', 'CRP (mg/L)'),
        f('lab_other', 'textarea', 'Other results', { cols: 4, rows: 2 })
      ] }
    ] },

    /* ---------------- 8. Imaging, elastography, histology ---------------- */
    { id: 'imaging', title: 'Imaging', level: 'visit', groups: [
      { title: 'Ultrasound', fields: [
        f('us_date', 'date', 'Date', { cols: 1 }),
        f('us_steatosis', 'select', 'Steatosis grade', { cols: 1, opts: [['0', 'None'], ['1', 'Mild (grade 1)'], ['2', 'Moderate (grade 2)'], ['3', 'Severe (grade 3)']] }),
        f('us_liver_size', 'number', 'Liver span (cm)', { cols: 1 }),
        f('us_spleen', 'number', 'Spleen length (cm)', { cols: 1 }),
        f('us_findings', 'multi', 'Findings', { cols: 4, opts: [['nodular', 'Nodular / irregular surface'], ['coarse', 'Coarse echotexture'], ['ascites', 'Ascites'], ['portal_dil', 'Portal vein >13 mm'], ['collaterals', 'Collaterals / recanalised umbilical vein'], ['focal', 'Focal lesion'], ['gallstones', 'Gallstones'], ['cbd', 'Dilated bile ducts'], ['renal', 'Renal abnormality']] }),
        f('us_focal', 'text', 'Focal lesion details', { cols: 2, show: function (v) { return (v.us_findings || []).indexOf('focal') >= 0; } }),
        f('us_text', 'text', 'Report summary', { cols: 2 })
      ] },
      { title: 'Transient elastography (FibroScan)', fields: [
        f('te_date', 'date', 'Date', { cols: 1 }),
        f('te_lsm', 'number', 'Liver stiffness (kPa)', { cols: 1, step: 0.1, min: 1, max: 75 }),
        f('te_iqr', 'number', 'IQR/median (%)', { cols: 1 }),
        f('te_cap', 'number', 'CAP (dB/m)', { cols: 1, min: 100, max: 400 }),
        f('te_probe', 'select', 'Probe', { cols: 1, opts: [['M', 'M'], ['XL', 'XL']] }),
        f('te_valid', 'number', 'Valid measurements', { cols: 1 }),
        f('te_fasting', YN, 'Fasted ≥3 h', { cols: 1 })
      ] },
      { title: 'MRI and other imaging', fields: [
        f('mri_date', 'date', 'Date', { cols: 1 }),
        f('mri_pdff', 'number', 'MRI-PDFF (%)', { cols: 1, step: 0.1 }),
        f('mri_mre', 'number', 'MR elastography (kPa)', { cols: 1, step: 0.01 }),
        f('ct_text', 'text', 'CT / other imaging', { cols: 1 }),
        f('egd_date', 'date', 'Upper endoscopy date', { cols: 1 }),
        f('egd_varices', 'select', 'Varices', { cols: 1, opts: [['none', 'None'], ['small', 'Small'], ['large', 'Large'], ['red', 'Large with red signs'], ['banded', 'Previously banded']] }),
        f('egd_phg', YN, 'Portal hypertensive gastropathy', { cols: 1 }),
        f('ecg_text', 'text', 'ECG / echocardiography', { cols: 1 })
      ] },
      { title: 'Liver biopsy', fields: [
        f('bx_date', 'date', 'Date', { cols: 1 }),
        f('bx_steatosis', 'select', 'Steatosis (NAS)', { cols: 1, opts: [['0', '0 (<5%)'], ['1', '1 (5–33%)'], ['2', '2 (34–66%)'], ['3', '3 (>66%)']] }),
        f('bx_ballooning', 'select', 'Ballooning', { cols: 1, opts: [['0', '0'], ['1', '1 (few)'], ['2', '2 (many)']] }),
        f('bx_inflammation', 'select', 'Lobular inflammation', { cols: 1, opts: [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3']] }),
        f('bx_fibrosis', 'select', 'Fibrosis stage', { cols: 1, opts: [['0', 'F0'], ['1a', 'F1a'], ['1b', 'F1b'], ['1c', 'F1c'], ['2', 'F2'], ['3', 'F3'], ['4', 'F4 (cirrhosis)']] }),
        f('bx_text', 'text', 'Pathology summary', { cols: 3 })
      ] }
    ] }
  ];

  /* Lab flags: reference limits in base units. [low, high] or sex-specific {m:[..], f:[..]} */
  var REF = {
    lab_hb: { m: [13, 17.5], f: [12, 15.5] }, lab_wbc: [4, 11], lab_plt: [150, 450], lab_mcv: [80, 100],
    lab_ast: [null, 40], lab_alt: { m: [null, 30], f: [null, 19] }, lab_ggt: { m: [null, 60], f: [null, 40] }, lab_alp: [40, 130],
    lab_tbil: [null, 1.2], lab_dbil: [null, 0.3], lab_alb: [3.5, 5.2], lab_tp: [6.4, 8.3], lab_inr: [null, 1.1], lab_elf: [null, 9.8],
    lab_glu: [70, 99], lab_glu2h: [null, 139], lab_hba1c: [null, 5.6], lab_ins: [2, 20], lab_cpep: [0.8, 3.9],
    lab_tc: [null, 200], lab_ldl: [null, 100], lab_hdl: { m: [41, null], f: [51, null] }, lab_tg: [null, 149],
    lab_urate: { m: [null, 7], f: [null, 6] }, lab_tsh: [0.4, 4.0], lab_ft4: [0.8, 1.8], lab_vitd: [30, 100],
    lab_creat: { m: [0.7, 1.2], f: [0.5, 1.0] }, lab_na: [135, 145], lab_k: [3.5, 5.1], lab_acr: [null, 30],
    lab_ferritin: { m: [30, 300], f: [15, 200] }, lab_tsat: [20, 45], lab_igg: [7, 16], lab_cerulo: [20, 60], lab_a1at: [90, 200],
    lab_afp: [null, 10], lab_crp: [null, 5]
  };

  function allFields(level) {
    var out = [];
    SECTIONS.forEach(function (s) { if (level && s.level !== level) return; s.groups.forEach(function (g) { g.fields.forEach(function (fd) { out.push(fd); }); }); });
    return out;
  }
  function fieldMap() { var m = {}; allFields().forEach(function (fd) { m[fd.k] = fd; }); return m; }
  function optLabel(fd, val) {
    if (!fd || !fd.opts) return val;
    for (var i = 0; i < fd.opts.length; i++) if (String(fd.opts[i][0]) === String(val)) return fd.opts[i][1];
    return val;
  }

  return { SECTIONS: SECTIONS, REASONS: REASONS, REF: REF, allFields: allFields, fieldMap: fieldMap, optLabel: optLabel,
    STEATOGENIC: STEATOGENIC, LIVER_DRUGS: LIVER_DRUGS };
});
