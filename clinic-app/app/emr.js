/* Fatty Liver Clinic: TrakCare export.
   Turns one visit into the content of each TrakCare form, in the order of the TrakCare Actions Panel
   (Chief Complaint, Past History, Assessments, Plan and Actions), plus a reader for the TrakCare patient banner.
   Field kinds: lookup = a search term to type into a TrakCare SNOMED/catalogue lookup, then pick from the list;
   text = paste as is; date = dd/mm/yyyy; number = paste as is; check = a box to tick (instruction, not copied). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./schema.js'), require('./calc.js'), require('./report.js'));
  else root.Emr = factory(root.Schema, root.Calc, root.Report);
})(typeof self !== 'undefined' ? self : this, function (S, C, Rep) {
  'use strict';

  var FM = S.fieldMap();
  var SEC = {}; S.SECTIONS.forEach(function (s) { SEC[s.id] = s; });
  function empty(x) { return x == null || x === '' || (Array.isArray(x) && !x.length); }
  function has(arr, x) { return Array.isArray(arr) && arr.indexOf(x) >= 0; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dmy(iso) {
    if (!iso) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
    if (m) return m[3] + '/' + m[2] + '/' + m[1];
    var d = new Date(iso); return isNaN(d) ? String(iso) : pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  }
  function stripCite(t) { return String(t).replace(/\s*\[[^\]]+\]\s*$/, ''); }
  function sentence(t) { t = String(t || '').trim(); return !t ? '' : /[.!?]$/.test(t) ? t : t + '.'; }

  /* "3 months", "2 years", "6 weeks", "10 days", "since 2019" -> ISO date before the reference date */
  function onsetFromText(text, refIso) {
    if (!text) return null;
    var ref = refIso ? new Date(refIso + 'T12:00:00') : new Date();
    if (isNaN(ref)) ref = new Date();
    var t = String(text).toLowerCase();
    var y = /\b(19\d{2}|20\d{2})\b/.exec(t);
    if (y) return y[1] + '-01-01';
    var m = /(\d+(?:\.\d+)?)\s*(days?|d\b|weeks?|wks?|w\b|months?|mo\b|m\b|years?|yrs?|y\b)/.exec(t);
    if (!m) return null;
    var n = parseFloat(m[1]), u = m[2][0], d = new Date(ref);
    if (u === 'd') d.setDate(d.getDate() - Math.round(n));
    else if (u === 'w') d.setDate(d.getDate() - Math.round(n * 7));
    else if (u === 'm') d.setMonth(d.getMonth() - Math.round(n));
    else d.setFullYear(d.getFullYear() - Math.round(n));
    return isoOf(d);
  }

  function fv(k, v, units) { var fd = FM[k]; return fd ? Rep.fieldValue(fd, v, units) : null; }
  function group(secId, title) { return SEC[secId].groups.filter(function (g) { return g.title === title; })[0]; }
  /* one group as a compact sentence: "Label: value; Label: value" */
  function groupText(g, v, p, units, skip) {
    if (!g || (g.show && !g.show(v, p))) return '';
    var parts = [];
    g.fields.forEach(function (fd) {
      if (skip && skip.indexOf(fd.k) >= 0) return;
      if (fd.show && !fd.show(v, p)) return;
      var x = Rep.fieldValue(fd, v, units); if (x == null) return;
      if (fd.t === 'check') parts.push(fd.label);
      else if (/^(Other|Details|Narrative|Report summary)$/.test(fd.label)) parts.push(x);
      else parts.push(fd.label + ': ' + x);
    });
    return parts.join('; ');
  }
  function refFlag(fd, v, p, units) {
    var x = C.num(v[fd.k]); if (x == null) return '';
    var base = fd.kind ? C.toBase(fd.kind, x, units) : x;
    var r = S.REF[fd.k]; if (!r) return '';
    var lim = Array.isArray(r) ? r : (p.sex === 'female' ? r.f : r.m);
    if (lim[0] != null && base < lim[0]) return 'L'; if (lim[1] != null && base > lim[1]) return 'H'; return '';
  }
  function labsLines(v, p, units) {
    var out = [];
    SEC.labs.groups.forEach(function (g) {
      if (g.title === 'Sample') return;
      var items = [];
      g.fields.forEach(function (fd) {
        if (fd.show && !fd.show(v, p)) return;
        var x = v[fd.k]; if (empty(x)) return;
        if (fd.t === 'textarea') { items.push(String(x)); return; }
        var s = fd.label + ' ' + Rep.fieldValue(fd, v, units), fl = refFlag(fd, v, p, units);
        items.push(fl ? s + ' (' + fl + ')' : s);
      });
      if (items.length) out.push(g.title + ': ' + items.join(', '));
    });
    return out;
  }
  function imagingLines(v, p, units) {
    return SEC.imaging.groups.map(function (g) { var t = groupText(g, v, p, units); return t ? g.title + ': ' + t : ''; }).filter(Boolean);
  }
  function scoreLines(R) {
    var s = R.scores, out = [];
    function add(name, sc, val, extra) { if (sc) out.push(name + ' ' + val + (extra ? ' (' + extra + ')' : '')); }
    add('FIB-4', s.fib4, s.fib4 && s.fib4.value, s.fib4 && s.fib4.band);
    add('NFS', s.nfs, s.nfs && s.nfs.value, s.nfs && s.nfs.band);
    add('APRI', s.apri, s.apri && s.apri.value, s.apri && s.apri.band);
    add('ELF', s.elf, s.elf && s.elf.value, s.elf && s.elf.band);
    add('Liver stiffness', s.lsm, s.lsm && s.lsm.value + ' kPa', s.lsm && s.lsm.band);
    add('CAP', s.cap, s.cap && s.cap.value + ' dB/m', s.cap && s.cap.band);
    add('Agile 3+', s.agile3, s.agile3 && s.agile3.value, s.agile3 && s.agile3.band);
    add('Agile 4', s.agile4, s.agile4 && s.agile4.value, s.agile4 && s.agile4.band);
    add('FAST', s.fast, s.fast && s.fast.value, s.fast && s.fast.band);
    add('MRE', s.mre, s.mre && s.mre.value + ' kPa', s.mre && s.mre.band);
    add('FLI', s.fli, s.fli && s.fli.value, s.fli && s.fli.band);
    add('HSI', s.hsi, s.hsi && s.hsi.value, s.hsi && s.hsi.band);
    add('HOMA-IR', s.homa, s.homa && s.homa.value, s.homa && (s.homa.band === 'high' ? 'insulin resistance' : 'normal'));
    add('eGFR', s.egfr, s.egfr && s.egfr.value, s.egfr && s.egfr.stage);
    if (s.childPugh) out.push('Child-Pugh ' + s.childPugh.cls + ' (' + s.childPugh.points + ')');
    if (s.meld) out.push('MELD 3.0 ' + s.meld.value);
    return out;
  }
  function planGroups(v, R) {
    var items = (v.plan_items || []).filter(function (i) { return i.on !== false && i.text; });
    if (!items.length) { items = []; R.recommendations.forEach(function (g) { g.items.forEach(function (t) { items.push({ group: g.title, text: t }); }); }); }
    var groups = [], idx = {};
    items.forEach(function (i) { var g = i.group || 'Plan'; if (!(g in idx)) { idx[g] = groups.length; groups.push({ title: g, items: [] }); } groups[idx[g]].items.push(stripCite(i.text)); });
    return groups;
  }
  function vitalsText(v, R) {
    var parts = [];
    if (!empty(v.ex_sbp) && !empty(v.ex_dbp)) parts.push('BP ' + v.ex_sbp + '/' + v.ex_dbp + ' mmHg');
    if (!empty(v.ex_hr)) parts.push('HR ' + v.ex_hr + '/min');
    if (!empty(v.ex_temp)) parts.push('Temp ' + v.ex_temp + ' °C');
    if (!empty(v.ex_rr)) parts.push('RR ' + v.ex_rr + '/min');
    if (!empty(v.ex_spo2)) parts.push('SpO2 ' + v.ex_spo2 + '%');
    if (!empty(v.ex_wt)) parts.push('Weight ' + v.ex_wt + ' kg');
    if (!empty(v.ex_ht)) parts.push('Height ' + v.ex_ht + ' cm');
    if (R.body.bmi != null) parts.push('BMI ' + R.body.bmi);
    if (!empty(v.ex_waist)) parts.push('Waist ' + v.ex_waist + ' cm' + (R.body.whtr != null ? ' (waist/height ' + R.body.whtr + ')' : ''));
    if (!empty(v.ex_hip)) parts.push('Hip ' + v.ex_hip + ' cm');
    if (!empty(v.ex_neck)) parts.push('Neck ' + v.ex_neck + ' cm');
    return parts.join(', ');
  }
  function examLines(v, p, units) {
    var out = [];
    SEC.exam.groups.forEach(function (g) {
      if (g.title === 'Vital signs and anthropometrics') return;
      var t = groupText(g, v, p, units);
      if (t) out.push({ title: g.title, text: sentence(t) });
    });
    return out;
  }
  function rosText(v) {
    var pos = [], fd = FM.hpi_symptoms, dd = FM.hpi_decomp;
    (v.hpi_symptoms || []).forEach(function (k) { if (k !== 'none') pos.push(S.optLabel(fd, k)); });
    (v.hpi_decomp || []).forEach(function (k) { pos.push(S.optLabel(dd, k)); });
    var lines = [];
    if (has(v.hpi_symptoms, 'none') && !pos.length) lines.push('Asymptomatic.');
    else if (pos.length) lines.push('Positive: ' + pos.join(', ') + '.');
    if (v.hpi_decomp_none && !(v.hpi_decomp || []).length) lines.push('Negative: no jaundice, abdominal or leg swelling, GI bleeding or confusion.');
    return lines.join(' ');
  }

  /* -------- term maps (SNOMED CT search terms, US spelling) -------- */
  var DM_TERM = { t2: 'Type 2 diabetes mellitus', t1: 'Type 1 diabetes mellitus', pre: 'Prediabetes' };
  var CVD_TERM = { cad: 'Ischemic heart disease', stroke: 'Cerebrovascular accident', hf: 'Heart failure', pad: 'Peripheral arterial disease', af: 'Atrial fibrillation' };
  var DMC_TERM = { retino: 'Diabetic retinopathy', nephro: 'Diabetic nephropathy', neuro: 'Diabetic neuropathy', cad: 'Ischemic heart disease' };
  var LIVER_TERM = { steatosis: 'Fatty liver', hbv: 'Chronic hepatitis B', hcv: 'Chronic hepatitis C', aih: 'Autoimmune hepatitis', cirrhosis: 'Cirrhosis of liver', hcc: 'Hepatocellular carcinoma', gallstones: 'Gallstone' };
  var SURG_TERM = { bariatric: 'Bariatric surgery', chole: 'Cholecystectomy', other: 'Abdominal surgery' };
  var FH_TERM = { steatosis: 'Fatty liver', cirrhosis: 'Cirrhosis of liver', hcc: 'Malignant neoplasm of liver', dm: 'Type 2 diabetes mellitus', obesity: 'Obesity', htn: 'Hypertension', lipid: 'Hyperlipidemia', cvd: 'Ischemic heart disease', stroke: 'Cerebrovascular accident', hbv: 'Hepatitis B', hcv: 'Hepatitis C', autoimmune: 'Autoimmune disease', haemochromatosis: 'Hemochromatosis', wilson: "Wilson's disease" };
  var ICD_TERM = { 'K76.0': 'Fatty liver', 'K75.81': 'Nonalcoholic steatohepatitis', 'K74.60': 'Cirrhosis of liver', 'K74.69': 'Cirrhosis of liver', 'K70.0': 'Alcoholic fatty liver', 'K70.30': 'Alcoholic cirrhosis', 'K70.31': 'Alcoholic cirrhosis with ascites',
    'R18.8': 'Ascites', 'E11.9': 'Type 2 diabetes mellitus', 'R73.03': 'Prediabetes', 'E66.9': 'Obesity', 'E66.01': 'Morbid obesity', 'I10': 'Essential hypertension', 'E78.5': 'Hyperlipidemia', 'R74.01': 'Raised liver enzymes' };
  var ORDERS = [
    [/\bCBC\b/, 'Complete blood count'], [/liver panel/i, 'Liver function test'], [/\bINR\b/, 'Prothrombin time / INR'],
    [/HBsAg/, 'Hepatitis B surface antigen'], [/anti-HBs/, 'Hepatitis B surface antibody'], [/anti-HBc/, 'Hepatitis B core antibody'],
    [/Anti-HCV to/, 'Hepatitis C antibody'], [/HCV RNA/, 'HCV RNA PCR'], [/HbA1c/, 'HbA1c'], [/fasting glucose/i, 'Fasting blood glucose'],
    [/lipid profile/i, 'Lipid profile'], [/Ferritin/, 'Ferritin'], [/transferrin saturation/i, 'Iron profile (transferrin saturation)'], [/\bTSH\b/, 'TSH'],
    [/Creatinine/, 'Renal function test (creatinine, eGFR)'], [/albumin\/creatinine/i, 'Urine albumin/creatinine ratio'],
    [/Abdominal ultrasound|Ultrasound ± AFP/, 'Ultrasound abdomen'], [/\bAFP\b/, 'Alpha-fetoprotein'],
    [/Transient elastography|FibroScan/, 'FibroScan (transient elastography)'], [/\bELF\b/, 'ELF test'], [/MR elastography/, 'MR elastography'],
    [/liver biopsy/i, 'Liver biopsy'], [/\bANA\b/, 'Antinuclear antibody'], [/ASMA/, 'Anti-smooth muscle antibody'], [/\bIgG\b/, 'Immunoglobulin G'],
    [/ceruloplasmin/i, 'Ceruloplasmin'], [/endoscopy/i, 'Upper GI endoscopy'], [/Sodium, INR/, 'Sodium'], [/DXA/, 'DXA bone density'],
    [/vitamin D/, 'Vitamin D'], [/OGTT/, 'Oral glucose tolerance test'], [/sleep study/i, 'Sleep study (polysomnography)'],
    [/\bECG\b/, 'ECG'], [/HFE/, 'HFE gene test']
  ];
  /* items that offer alternatives: order only the first choice; the doctor can add the other */
  var ORDER_FIRST = [[/Grey-zone stiffness/, ['ELF test']]];

  /* -------- builders -------- */
  function F(id, group, menu, note) { return { id: id, group: group, menu: menu, note: note || '', fields: [], entries: [], text: '' }; }
  function fld(label, value, kind, extra) {
    var o = { label: label, value: value == null ? '' : String(value), kind: kind || 'text' };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  function entry(title, fields) { return { title: title, fields: fields.filter(function (f) { return f && (f.value !== '' || f.req); }) }; }

  function trakcare(p, v, R, settings) {
    settings = settings || {};
    var units = v.units || 'base', female = p.sex === 'female';
    var forms = [];
    function add(f) { f.fields = f.fields.filter(function (x) { return x.value !== '' || x.req; }); forms.push(f); return f; }

    /* ===== Chief Complaint ===== */
    var rfe = F('rfe', 'Chief Complaint', 'Chief Complaint', 'Form "Reason for Encounter". Add one entry per reason; tick Main RFE on the first.');
    var onsetIso = v.complaint_onset || onsetFromText(v.complaint_duration, v.date) || onsetFromText(v.hpi_onset, v.date);
    var words = v.complaint ? '"' + v.complaint + '"' + (v.complaint_duration ? ' for ' + v.complaint_duration : '') : '';
    var reasons = (v.reasons || []).map(function (k) { return S.REASONS.filter(function (r) { return r[0] === k; })[0]; }).filter(Boolean);
    if (!reasons.length && (v.complaint || v.reason_other)) reasons = [['other', '', '', '', '']];
    reasons.forEach(function (r, i) {
      var other = r[0] === 'other';
      var site = r[4] || '';
      rfe.entries.push(entry(other ? (v.reason_other || 'Reason') : r[1], [
        fld('Description (Snomed) translated', other ? (v.reason_other || '') : r[3], 'lookup', { req: true, hint: r[2] ? 'SNOMED CT ' + r[2] : '' }),
        fld('Preferred Description Entered As', other ? '' : r[1]),
        fld('Severity', v.complaint_severity ? S.optLabel(FM.complaint_severity, v.complaint_severity) : '', 'lookup'),
        fld('Site (Snomed) translated', site, 'lookup'),
        site === 'Lower limb' ? fld('Right / Left / Both', 'Both', 'check') : null,
        i === 0 ? fld('Main RFE', 'Tick', 'check') : null,
        fld('Onset Date', dmy(onsetIso), 'date', { req: true, hint: onsetIso ? '' : 'Enter an onset date or duration in the Complaint tab' }),
        fld('Comments', i === 0 ? words : '')
      ]));
    });
    if (!rfe.entries.length) rfe.missing = 'No reason for encounter yet. Fill the Complaint tab.';
    add(rfe);

    /* ===== Past History ===== */
    var al = F('allergy', 'Past History', 'Add Allergy');
    var alText = String(v.dh_allergy || '').trim();
    if (/^(none|nil|no|nkda|nka|no known.*)$/i.test(alText)) al.fields.push(fld('No known allergies', 'Tick', 'check'));
    else if (alText) alText.split(/[,;]+/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (a) { al.entries.push(entry(a, [fld('Allergen', a, 'lookup', { req: true })])); });
    else al.missing = 'Allergy not recorded. Write "None" in Past & drugs if the patient has no allergy.';
    add(al);

    var pmh = F('pmh', 'Past History', 'Add Medical History Problem', 'One entry per problem.');
    function prob(term, comment, onset) { pmh.entries.push(entry(term, [fld('Problem (Snomed)', term, 'lookup', { req: true }), fld('Onset (approx.)', onset || ''), fld('Comments', comment || '')])); }
    var vy = v.date ? parseInt(v.date.slice(0, 4), 10) : new Date().getFullYear();
    if (DM_TERM[v.pm_dm]) prob(DM_TERM[v.pm_dm], v.pm_dm_years ? 'Duration ' + v.pm_dm_years + ' years' : '', v.pm_dm_years ? String(vy - Math.round(+v.pm_dm_years)) : '');
    (v.pm_dm_complications || []).forEach(function (k) { if (DMC_TERM[k]) prob(DMC_TERM[k]); });
    if (v.pm_htn === 'yes') prob('Essential hypertension', v.pm_htn_treated === 'yes' ? 'On treatment' : '');
    if (v.pm_lipid === 'yes') prob('Hyperlipidemia', v.pm_lipid_treated === 'yes' ? 'On treatment' : '');
    (v.pm_cvd || []).forEach(function (k) { if (CVD_TERM[k] && !pmh.entries.some(function (e) { return e.title === CVD_TERM[k]; })) prob(CVD_TERM[k]); });
    if (v.pm_osa === 'yes' || v.pm_osa === 'cpap') prob('Obstructive sleep apnea syndrome', v.pm_osa === 'cpap' ? 'On CPAP' : '');
    if (female && v.pm_pcos === 'yes') prob('Polycystic ovary syndrome');
    if (v.pm_thyroid === 'hypo') prob('Hypothyroidism'); else if (v.pm_thyroid === 'hyper') prob('Hyperthyroidism');
    if (v.pm_ckd === 'yes') prob('Chronic kidney disease');
    if (v.pm_gout === 'yes') prob('Gout');
    if (!female && v.pm_hypogonadism === 'yes') prob('Hypogonadism');
    (v.pm_liver || []).forEach(function (k) { if (LIVER_TERM[k]) prob(LIVER_TERM[k]); });
    if (v.pm_malignancy) prob(v.pm_malignancy);
    if (v.pm_psych) prob(v.pm_psych);
    if (v.pm_other) prob(v.pm_other);
    if (!pmh.entries.length) pmh.info = 'No past medical problems recorded.';
    add(pmh);

    var psh = F('psh', 'Past History', 'Add Surgical History');
    (v.pm_surgery || []).forEach(function (k) { psh.entries.push(entry(SURG_TERM[k], [fld('Procedure', SURG_TERM[k], 'lookup', { req: true }), fld('Comments', k === 'bariatric' ? v.pm_bariatric_type || '' : '')])); });
    if (!psh.entries.length) psh.info = 'No surgery recorded.';
    add(psh);

    var fh = F('fh', 'Past History', 'Add Family History', 'One entry per condition. Choose the relative in TrakCare.');
    (v.fh || []).forEach(function (k) { fh.entries.push(entry(FH_TERM[k] || k, [fld('Condition (Snomed)', FH_TERM[k] || k, 'lookup', { req: true }), fld('Relation', 'First-degree relative'), fld('Comments', v.fh_text || '')])); });
    if (v.fh_consanguinity === 'yes') fh.entries.push(entry('Consanguinity', [fld('Condition (Snomed)', 'Consanguinity', 'lookup'), fld('Comments', 'Consanguineous parents')]));
    if (!fh.entries.length) fh.info = 'No family history recorded.';
    add(fh);

    var so = F('social', 'Past History', 'Add Social History & Habits', 'One entry per habit.');
    var py = R.scores.packYears;
    if (v.hab_smoking) so.entries.push(entry('Smoking', [fld('Habit', 'Tobacco smoking', 'lookup'), fld('Status', S.optLabel(FM.hab_smoking, v.hab_smoking)),
      fld('Details', v.hab_smoking === 'never' ? '' : [v.hab_cigs ? v.hab_cigs + ' cigarettes/day' : '', v.hab_smoke_years ? v.hab_smoke_years + ' years' : '', py != null ? py + ' pack-years' : ''].filter(Boolean).join(', '))]));
    if (v.hab_shisha && v.hab_shisha !== 'no') so.entries.push(entry('Waterpipe', [fld('Habit', 'Waterpipe tobacco smoking', 'lookup'), fld('Details', S.optLabel(FM.hab_shisha, v.hab_shisha))]));
    if (v.hab_alcohol) so.entries.push(entry('Alcohol', [fld('Habit', 'Alcohol intake', 'lookup'), fld('Status', S.optLabel(FM.hab_alcohol, v.hab_alcohol)),
      fld('Details', [v.hab_alc_g ? v.hab_alc_g + ' g/week' : '', R.scores.auditC ? 'AUDIT-C ' + R.scores.auditC.value : ''].filter(Boolean).join(', '))]));
    if (v.hab_drugs) so.entries.push(entry('Substances', [fld('Habit', 'Recreational drug use', 'lookup'), fld('Details', v.hab_drugs)]));
    var life = [p.occupation ? 'Occupation: ' + p.occupation : '', p.marital ? 'Marital status: ' + S.optLabel(FM.marital, p.marital) : '', p.residence ? 'Residence: ' + p.residence : '',
      !empty(v.hab_activity) ? 'Physical activity ' + v.hab_activity + ' min/week' : '', !empty(v.hab_sitting) ? 'Sitting ' + v.hab_sitting + ' h/day' : '',
      !empty(v.hab_ssb) ? 'Sugary drinks ' + v.hab_ssb + '/day' : '', !empty(v.hab_fastfood) ? 'Fast food ' + v.hab_fastfood + '/week' : '',
      !empty(v.hab_coffee) ? 'Coffee ' + v.hab_coffee + ' cups/day' : '', !empty(v.hab_sleep) ? 'Sleep ' + v.hab_sleep + ' h/night' : '', v.hab_diet ? 'Diet: ' + v.hab_diet : ''].filter(Boolean);
    if (life.length) so.entries.push(entry('Lifestyle and social', [fld('Comments', life.join('; '))]));
    var mh = groupText(group('past', 'Menstrual and obstetric history'), v, p, units);
    if (mh) so.entries.push(entry('Menstrual and obstetric', [fld('Comments', mh)]));
    if (!so.entries.length) so.info = 'No habits recorded.';
    add(so);

    var md = F('meds', 'Past History', 'Add Medication History Entry', 'One entry per drug.');
    (v.dh_meds || []).filter(function (r) { return r && r.drug; }).forEach(function (r) {
      md.entries.push(entry(r.drug, [fld('Drug', r.drug, 'lookup', { req: true }), fld('Dose and frequency', r.dose || ''), fld('Start', r.since || ''), fld('Indication / comments', r.indication || '')]));
    });
    if (v.dh_herbal) md.entries.push(entry('Herbal / supplements', [fld('Drug', v.dh_herbal, 'lookup'), fld('Indication / comments', 'Herbal or supplement product')]));
    if (!md.entries.length) { if ((v.dh_liver || []).length) md.missing = 'Drug classes ticked but no drug names: add rows in the Current medications table.'; else md.info = 'No medications recorded.'; }
    add(md);

    /* ===== Assessments ===== */
    var ros = F('ros', 'Assessments', 'Add Review of Systems');
    ros.text = rosText(v);
    ros.fields.push(fld('Review of systems', ros.text, 'text'));
    if (!ros.text) ros.missing = 'Tick symptoms in Present illness.';
    add(ros);

    var pe = F('pe', 'Assessments', 'Add Physical Exam', 'Paste each system into its box, or all in one box.');
    var ex = examLines(v, p, units);
    ex.forEach(function (x) { pe.fields.push(fld(x.title, x.text)); });
    pe.text = ex.map(function (x) { return x.title + ': ' + x.text; }).join('\n');
    if (ex.length > 1) pe.fields.push(fld('All systems', pe.text, 'text', { noQueue: true }));
    add(pe);

    var vs = F('vitals', 'Assessments', 'Add Vital Signs', 'TrakCare calculates BMI.');
    [['ex_sbp', 'Systolic BP (mmHg)'], ['ex_dbp', 'Diastolic BP (mmHg)'], ['ex_hr', 'Pulse (/min)'], ['ex_temp', 'Temperature (°C)'], ['ex_rr', 'Respiratory rate (/min)'],
      ['ex_spo2', 'SpO2 (%)'], ['ex_wt', 'Weight (kg)'], ['ex_ht', 'Height (cm)'], ['ex_waist', 'Waist circumference (cm)'], ['ex_hip', 'Hip circumference (cm)']].forEach(function (x) {
      if (!empty(v[x[0]])) vs.fields.push(fld(x[1], v[x[0]], 'number'));
    });
    vs.text = vitalsText(v, R);
    if (!vs.fields.length) vs.missing = 'No vital signs recorded.';
    add(vs);

    if (has(v.reasons, 'ruq_pain') || has(v.reasons, 'abd_pain') || has(v.hpi_symptoms, 'ruq')) {
      var pa = F('pain', 'Assessments', 'Add Pain Assessments');
      pa.fields.push(fld('Site', has(v.reasons, 'abd_pain') ? 'Abdomen' : 'Right upper quadrant of abdomen', 'lookup'));
      if (v.complaint_severity) pa.fields.push(fld('Severity', S.optLabel(FM.complaint_severity, v.complaint_severity)));
      if (v.complaint_duration) pa.fields.push(fld('Duration', v.complaint_duration));
      add(pa);
    }

    var dx = F('dx', 'Assessments', 'Add Diagnosis', 'First entry is the principal diagnosis.');
    var codes = v.dx_codes ? (String(v.dx_codes).match(/[A-Z]\d{2}(?:\.\d{1,4})?/g) || []) : R.diagnosis.codes;
    var dxText = v.dx_final || (R.diagnosis.primary + (R.diagnosis.qualifier ? ', ' + R.diagnosis.qualifier : ''));
    var fibText = R.fibrosis.label + (R.fibrosis.stage ? ' (' + R.fibrosis.stage + ')' : '');
    codes.forEach(function (c, i) {
      var term = ICD_TERM[c] || c;
      dx.entries.push(entry(term + ' · ' + c, [fld('Diagnosis (Snomed)', term, 'lookup', { req: true, hint: 'ICD-10 ' + c }), i === 0 ? fld('Principal diagnosis', 'Tick', 'check') : null,
        fld('Comments', i === 0 ? dxText + '. ' + fibText + '.' : '')]));
    });
    if (!dx.entries.length) dx.missing = 'No diagnosis yet: complete the sheet or type it in Assessment & plan.';
    add(dx);

    var cro = F('crom', 'Assessments', 'Add Clinician Reported Outcome Measure', 'Scores without their own TrakCare form. Also included in the Outpatient Note.');
    cro.text = scoreLines(R).filter(function (l) { return !/^(FIB-4|NFS) /.test(l); }).join('; ');
    cro.fields.push(fld('Scores', cro.text));
    if (!cro.text) cro.info = 'No elastography or other scores yet.';
    add(cro);

    var L = R.labs, age = R.age;
    var f4 = F('fib4', 'Assessments', 'Add Fibrosis-4 (FIB-4) Score', 'Check that TrakCare gives the same result.');
    f4.fields.push(fld('Age (years)', age == null ? '' : age, 'number', { req: true }));
    f4.fields.push(fld('AST (U/L)', L.ast == null ? '' : L.ast, 'number', { req: true }));
    f4.fields.push(fld('ALT (U/L)', L.alt == null ? '' : L.alt, 'number', { req: true }));
    f4.fields.push(fld('Platelets (×10⁹/L)', L.plt == null ? '' : L.plt, 'number', { req: true }));
    if (R.scores.fib4) f4.result = 'FIB-4 ' + R.scores.fib4.value + ', ' + R.scores.fib4.band + ' (cut-offs ' + R.scores.fib4.low + ' / 2.67)';
    add(f4);

    var nf = F('nfs', 'Assessments', 'Add Non-alcoholic Fatty Liver Disease (NAFLD) Score', 'NAFLD fibrosis score. Check that TrakCare gives the same result.');
    var ifg = R.dm || v.pm_dm === 'pre' || (L.glu != null && L.glu >= 100) || (L.hba1c != null && L.hba1c >= 5.7);
    nf.fields.push(fld('Age (years)', age == null ? '' : age, 'number', { req: true }));
    nf.fields.push(fld('BMI (kg/m²)', R.body.bmi == null ? '' : R.body.bmi, 'number', { req: true }));
    nf.fields.push(fld('Impaired fasting glucose / diabetes', ifg ? 'Yes' : 'No', 'text', { req: true }));
    nf.fields.push(fld('AST (U/L)', L.ast == null ? '' : L.ast, 'number', { req: true }));
    nf.fields.push(fld('ALT (U/L)', L.alt == null ? '' : L.alt, 'number', { req: true }));
    nf.fields.push(fld('Platelets (×10⁹/L)', L.plt == null ? '' : L.plt, 'number', { req: true }));
    nf.fields.push(fld('Albumin (g/L)', L.alb == null ? '' : C.round(L.alb * 10, 0), 'number', { req: true, hint: L.alb == null ? '' : L.alb + ' g/dL' }));
    if (R.scores.nfs) nf.result = 'NFS ' + R.scores.nfs.value + ', ' + R.scores.nfs.band + ' (cut-offs ' + R.scores.nfs.low + ' / 0.676)';
    add(nf);

    /* ===== Plan and Actions ===== */
    var pg = planGroups(v, R);
    var tp = F('tp', 'Plan and Actions', 'Add Treatment Plan');
    var tpGroups = pg.filter(function (g) { return !/^Investigations|^Referrals/.test(g.title); });
    tp.text = tpGroups.map(function (g) { return g.title + ':\n' + g.items.map(function (t) { return '- ' + t; }).join('\n'); }).join('\n') + (v.plan_text ? '\nAdditional plan:\n' + v.plan_text : '');
    tp.fields.push(fld('Treatment plan', tp.text));
    add(tp);

    var od = F('orders', 'Plan and Actions', 'Add an Order', 'Search each test in the order catalogue.');
    var invItems = []; pg.forEach(function (g) { if (/^Investigations/.test(g.title)) invItems = invItems.concat(g.items); });
    var ords = [];
    invItems.forEach(function (t) {
      var first = ORDER_FIRST.filter(function (o) { return o[0].test(t); })[0];
      if (first) { first[1].forEach(function (o) { if (ords.indexOf(o) < 0) ords.push(o); }); return; }
      ORDERS.forEach(function (o) { if (o[0].test(t) && ords.indexOf(o[1]) < 0) ords.push(o[1]); });
    });
    ords.forEach(function (o) { od.entries.push(entry(o, [fld('Order item', o, 'lookup', { req: true })])); });
    od.text = ords.join('\n');
    if (!ords.length) { if (invItems.length) od.missing = 'Investigation items could not be matched to orders; order them by hand.'; else od.info = 'No investigations requested.'; }
    add(od);

    var note = F('note', 'Plan and Actions', 'Add Outpatient Note', 'The whole consultation in one note.');
    note.text = consultText(p, v, R, settings, 'note');
    note.fields.push(fld('Outpatient note', note.text));
    add(note);

    var rf = F('ref', 'Plan and Actions', 'Add Outpatient Referral / Follow up');
    var fu = v.followup_text || R.followUp.text;
    var sug = new Date((v.date || isoOf(new Date())) + 'T12:00:00'); sug.setMonth(sug.getMonth() + R.followUp.months);
    rf.fields.push(fld('Follow-up in', R.followUp.months + (R.followUp.months === 1 ? ' month' : ' months')));
    rf.fields.push(fld('Follow-up date', dmy(v.followup_date || isoOf(sug)), 'date', { hint: v.followup_date ? '' : 'suggested' }));
    rf.fields.push(fld('Instructions', fu));
    pg.forEach(function (g) { if (/^Referrals/.test(g.title)) g.items.forEach(function (t) { if (!/^No referral/.test(t)) rf.entries.push(entry(t, [fld('Referral', t)])); }); });
    add(rf);

    var ed = F('edu', 'Plan and Actions', 'Review Patient/Family Health Education');
    ed.text = educationText(p, v, R);
    ed.fields.push(fld('Education given', ed.text));
    add(ed);

    var mr = F('report', 'Plan and Actions', 'Medical Report', 'Full report text. The PDF is in the Report tab.');
    mr.text = consultText(p, v, R, settings, 'report');
    mr.fields.push(fld('Medical report', mr.text));
    add(mr);

    return { forms: forms };
  }

  function educationText(p, v, R) {
    var out = [], wt = C.num(v.ex_wt), bmi = R.body.bmi;
    var dx = /MASH/.test(R.diagnosis.primary) ? 'MASH (fatty liver with inflammation)' : /MASLD|MetALD|Steatotic|Suspected/.test(R.diagnosis.primary) ? 'fatty liver disease (MASLD)' : 'the liver condition';
    out.push('Explained ' + dx + ', its link with weight, blood sugar, blood pressure and cholesterol, and that the main risk is to the heart as well as the liver.');
    var lv = R.fibrosis.level;
    if (lv !== 'unknown') out.push('Liver scarring result: ' + R.fibrosis.label.toLowerCase() + '.');
    if (bmi != null && bmi >= 25 && wt != null) {
      var pct = lv === 'cirrhosis' || lv === 'high' ? 10 : 7;
      out.push('Weight goal: lose about ' + Math.round(wt * pct / 100) + ' kg (' + pct + '% of body weight) over 6 to 12 months.');
    }
    out.push('Diet: Mediterranean style, more vegetables, legumes and fish; no sugary drinks; less bread, rice and sweets; avoid fast food.');
    out.push('Exercise: at least 150 minutes a week of brisk walking plus muscle exercises twice a week.');
    if (v.hab_smoking === 'current') out.push('Stop smoking; support offered.');
    if (v.hab_alcohol === 'current') out.push('Avoid alcohol completely.');
    if (R.dm) out.push('Keep blood sugar controlled and take diabetes medicines as prescribed.');
    out.push('Avoid herbal and slimming products without asking the doctor.');
    if (lv === 'cirrhosis') out.push('Warning signs needing urgent care: vomiting blood, black stools, confusion or drowsiness, fast abdominal swelling, yellow eyes, fever.');
    out.push('Understanding confirmed; written plan given.');
    return out.map(function (t) { return '- ' + t; }).join('\n');
  }

  /* complete consultation as plain text: mode 'note' (TrakCare outpatient note) or 'report' (letter style) */
  function consultText(p, v, R, settings, mode) {
    settings = settings || {};
    var units = v.units || 'base', L = [];
    function h(t) { L.push(''); L.push(t.toUpperCase()); }
    function line(t) { if (t) L.push(t); }
    if (mode === 'report') {
      L.push((settings.clinicName || 'Fatty liver clinic') + ' – MEDICAL REPORT');
      L.push('Date: ' + dmy(v.date));
      L.push('Patient: ' + (p.name || '') + (R.age != null ? ', ' + R.age + ' years' : '') + (p.sex ? ', ' + (p.sex === 'female' ? 'female' : 'male') : '') + (p.fileNo ? ', URN ' + p.fileNo : ''));
      L.push('To whom it may concern,');
    } else {
      L.push((settings.clinicName || 'Fatty liver clinic') + ' – ' + (S.optLabel(FM.type, v.type) || 'Visit') + ' – ' + dmy(v.date));
    }
    h('Reason for encounter');
    var reasons = (v.reasons || []).map(function (k) { var r = S.REASONS.filter(function (x) { return x[0] === k; })[0]; return r ? r[1] : k; });
    if (v.reason_other) reasons.push(v.reason_other);
    line(v.complaint ? 'Patient’s words: "' + v.complaint + '"' + (v.complaint_duration ? ' for ' + v.complaint_duration : '') + '.' : '');
    line(reasons.length ? 'Coded: ' + reasons.join('; ') + '.' : '');
    var hpi = groupText(SEC.hpi.groups[0], v, p, units, ['hpi_text', 'hpi_symptoms', 'hpi_decomp', 'hpi_decomp_none']), r0 = rosText(v);
    if (hpi || v.hpi_text || r0) { h('History of present illness'); line(sentence(hpi)); line(r0); line(v.hpi_text); }
    var pmhT = groupText(group('past', 'Cardiometabolic'), v, p, units), livT = groupText(group('past', 'Liver and other'), v, p, units);
    if (pmhT || livT) { h('Past history'); line(sentence(pmhT)); line(sentence(livT)); }
    var dg = group('past', 'Drug history'), drugs = groupText(dg, v, p, units);
    if (drugs) { h('Drug history'); line(sentence(drugs)); }
    var habT = groupText(group('past', 'Special habits'), v, p, units), mhT = groupText(group('past', 'Menstrual and obstetric history'), v, p, units);
    var soc = [p.occupation ? 'Occupation: ' + p.occupation : '', p.marital ? 'Marital status: ' + S.optLabel(FM.marital, p.marital) : '', p.residence ? 'Residence: ' + p.residence : ''].filter(Boolean).join('; ');
    if (habT || soc) { h('Social history and habits'); line(sentence(soc)); line(sentence(habT)); }
    if (mhT) { h('Menstrual and obstetric history'); line(sentence(mhT)); }
    var fhT = groupText(SEC.family.groups[0], v, p, units);
    h('Family history'); line(fhT ? sentence(fhT) : 'Nothing relevant recorded.');
    h('Examination');
    var vt = vitalsText(v, R); line(vt ? 'Vital signs: ' + vt + '.' : '');
    examLines(v, p, units).forEach(function (x) { line(x.title + ': ' + x.text); });
    var labs = labsLines(v, p, units), img = imagingLines(v, p, units);
    if (labs.length || img.length) {
      h('Investigations');
      if (v.lab_date) line('Laboratory (' + dmy(v.lab_date) + (v.lab_fasting === 'yes' ? ', fasting' : '') + '):');
      labs.forEach(line); img.forEach(line);
    }
    var sc = scoreLines(R);
    if (sc.length || R.body.bmi != null) { h('Scores'); line([R.body.bmi != null ? 'BMI ' + R.body.bmi + ' (' + R.body.bmiClass + ')' : ''].concat(sc).filter(Boolean).join('; ') + '.'); }
    h('Assessment');
    var dxText = v.dx_final || (R.diagnosis.primary + (R.diagnosis.qualifier ? ', ' + R.diagnosis.qualifier : ''));
    line('Diagnosis: ' + dxText + (v.dx_codes || R.diagnosis.codes.length ? ' (ICD-10 ' + (v.dx_codes || R.diagnosis.codes.join(', ')) + ')' : '') + '.');
    if (R.mash) line('Steatohepatitis: ' + R.mash + '.');
    line('Fibrosis: ' + R.fibrosis.label + (R.fibrosis.stage ? ' (' + R.fibrosis.stage + ')' : '') + (R.fibrosis.basis.length ? ', based on ' + R.fibrosis.basis.join('; ') : '') + '.');
    line('Steatosis: ' + R.steatosis.status + (R.steatosis.evidence.length ? ' (' + R.steatosis.evidence.join('; ') + ')' : '') + '.');
    line('Cardiometabolic criteria: ' + R.cm.count + ' of 5' + (R.cm.met.length ? ' (' + R.cm.met.join('; ') + ')' : '') + '.');
    if (R.diagnosis.problems.length) line('Problem list: ' + R.diagnosis.problems.join('; ') + '.');
    R.otherCauses.forEach(function (t) { line('Note: ' + t); });
    line(v.assessment_text);
    h('Plan');
    planGroups(v, R).forEach(function (g) { line(g.title + ':'); g.items.forEach(function (t) { line('- ' + t); }); });
    if (v.plan_text) { line('Additional plan:'); line(v.plan_text); }
    line('Follow-up: ' + (v.followup_text || R.followUp.text) + (v.followup_date ? ' Next visit ' + dmy(v.followup_date) + '.' : ''));
    L.push('');
    L.push([settings.doctorName, settings.doctorTitle].filter(Boolean).join(', '));
    return L.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  /* flatten to the copy sequence */
  function queue(T) {
    var q = [];
    T.forms.forEach(function (f) {
      f.fields.forEach(function (x, i) { if (x.kind !== 'check' && x.value !== '' && !x.noQueue) q.push({ key: f.id + '.f' + i, label: f.menu + ' › ' + x.label, value: x.value }); });
      f.entries.forEach(function (e, j) { e.fields.forEach(function (x, i) { if (x.kind !== 'check' && x.value !== '') q.push({ key: f.id + '.e' + j + '.' + i, label: f.menu + ' › ' + e.title + ' › ' + x.label, value: x.value }); }); });
    });
    return q;
  }

  /* ---------- TrakCare patient banner ---------- */
  var LABELS = 'URN|Episode No|Gender|Full Age|DOB|Mobile Phone|Telephone|Height|Weight|BSA|BMI|Care Provider|Location|Episode Date|Length of Stay|Discharge Date|Payor';
  function grab(text, label) {
    var re = new RegExp(label + '\\s*:\\s*:?\\s*(.+?)\\s*(?=\\||\\n|\\r|(?:' + LABELS + ')\\s*:|$)', 'i');
    var m = re.exec(text); return m ? m[1].trim() : '';
  }
  function parseBanner(text) {
    text = String(text || '').replace(/ /g, ' ');
    var out = {};
    var head = text.split(/URN\s*:/i)[0];
    var lines = head.split(/[\r\n]+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var arabic = /[؀-ۿ]/;
    lines.forEach(function (l) {
      var latin = l.replace(/[؀-ۿ]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (!out.name && latin && !/:/.test(latin) && /[A-Za-z]/.test(latin)) out.name = latin;
      if (!out.nameAr && arabic.test(l)) out.nameAr = (l.match(/[؀-ۿ][؀-ۿ\s]*/g) || []).join(' ').replace(/\s+/g, ' ').trim();
    });
    var urn = /URN\s*:?\s*:?\s*([A-Za-z0-9-]+)/i.exec(text); if (urn) out.fileNo = urn[1];
    var ep = /Episode No\s*:?\s*([A-Za-z0-9-]+)/i.exec(text); if (ep) out.episodeNo = ep[1];
    var g = /Gender\s*:\s*(Male|Female)/i.exec(text); if (g) out.sex = g[1].toLowerCase();
    var dob = /DOB\s*:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i.exec(text); if (dob) out.dob = dob[3] + '-' + pad(+dob[2]) + '-' + pad(+dob[1]);
    var age = /Full Age\s*:\s*(\d+)\s*Y/i.exec(text); if (age) out.age = +age[1];
    var ph = /Mobile Phone\s*:\s*([+\d][\d\s-]{5,}\d)/i.exec(text); if (ph) out.phone = ph[1].replace(/[\s-]/g, '');
    var ht = /Height\s*:\s*([\d.]+)\s*cm/i.exec(text); if (ht) out.height = +ht[1];
    var wt = /Weight\s*:\s*([\d.]+)\s*kg/i.exec(text); if (wt) out.weight = +wt[1];
    var pay = grab(text, 'Payor'); if (pay) out.insurance = pay;
    var loc = grab(text, 'Location'); if (loc) out.location = loc;
    var cp = grab(text, 'Care Provider'); if (cp) out.provider = cp;
    return out;
  }

  return { trakcare: trakcare, queue: queue, parseBanner: parseBanner, onsetFromText: onsetFromText, consultText: consultText, dmy: dmy };
});
