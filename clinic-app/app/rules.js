/* Fatty Liver Clinic: assessment engine.
   Takes the patient, one visit and the settings; returns scores, the suggested diagnosis,
   fibrosis risk, and guideline-based recommendations (EASL–EASD–EASO 2024, AASLD 2023/2024,
   Baveno VII, Delphi 2023 nomenclature). Pure functions, no DOM.
   Every suggestion is a prompt for the doctor, who edits the final plan. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root.Calc || require('./calc.js'));
  else root.Rules = factory(root.Calc);
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';

  function has(x) { return x != null && x !== '' && isFinite(x); }
  function inList(arr, x) { return Array.isArray(arr) && arr.indexOf(x) >= 0; }
  function yes(x) { return x === 'yes' || x === true; }

  function ageAt(p, dateStr) {
    if (p.dob) {
      var d = new Date(dateStr || Date.now()), b = new Date(p.dob);
      if (!isNaN(b)) { var a = d.getFullYear() - b.getFullYear(); var m = d.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && d.getDate() < b.getDate())) a--; return a; }
    }
    return has(C.num(p.age)) ? C.num(p.age) : null;
  }

  /* value of a lab in base (conventional) units, whatever the visit's unit system */
  function lab(v, k, kind) { var x = C.num(v[k]); if (x == null) return null; return kind ? C.toBase(kind, x, v.units || 'base') : x; }

  function evaluate(p, v, settings) {
    settings = settings || {};
    var astUln = C.num(settings.astUln) || 40;
    var female = p.sex === 'female', male = !female;
    var age = ageAt(p, v.date);
    var dm = v.pm_dm === 't2' || v.pm_dm === 't1';
    var pre = v.pm_dm === 'pre';
    var R = { age: age, female: female, dm: dm, scores: {}, body: {}, notes: [] };

    /* ---- body ---- */
    var wt = C.num(v.ex_wt), ht = C.num(v.ex_ht), waist = C.num(v.ex_waist), hip = C.num(v.ex_hip);
    var bmi = C.bmi(wt, ht);
    R.body = { bmi: bmi != null ? C.round(bmi, 1) : null, bmiClass: C.bmiClass(bmi), whtr: C.whtr(waist, ht) != null ? C.round(C.whtr(waist, ht), 2) : null, whr: C.whr(waist, hip) != null ? C.round(C.whr(waist, hip), 2) : null };

    /* ---- labs in base units ---- */
    var L = {
      ast: lab(v, 'lab_ast'), alt: lab(v, 'lab_alt'), ggt: lab(v, 'lab_ggt'), plt: lab(v, 'lab_plt'), alb: lab(v, 'lab_alb', 'albumin'),
      tbil: lab(v, 'lab_tbil', 'bili'), inr: lab(v, 'lab_inr'), glu: lab(v, 'lab_glu', 'glucose'), glu2h: lab(v, 'lab_glu2h', 'glucose'),
      hba1c: lab(v, 'lab_hba1c', 'hba1c'), ins: lab(v, 'lab_ins', 'insulin'), tg: lab(v, 'lab_tg', 'tg'), hdl: lab(v, 'lab_hdl', 'chol'),
      ldl: lab(v, 'lab_ldl', 'chol'), tc: lab(v, 'lab_tc', 'chol'), creat: lab(v, 'lab_creat', 'creat'), na: lab(v, 'lab_na'),
      ferritin: lab(v, 'lab_ferritin'), tsat: lab(v, 'lab_tsat'), tsh: lab(v, 'lab_tsh'), urate: lab(v, 'lab_urate', 'urate'),
      acr: lab(v, 'lab_acr', 'acr'), elf: lab(v, 'lab_elf'), igg: lab(v, 'lab_igg'), cerulo: lab(v, 'lab_cerulo', 'cerulo'), afp: lab(v, 'lab_afp')
    };
    R.labs = L;
    var lsm = C.num(v.te_lsm), cap = C.num(v.te_cap), mre = C.num(v.mri_mre), pdff = C.num(v.mri_pdff);
    var ifgDm = dm || pre || (has(L.glu) && L.glu >= 100) || (has(L.hba1c) && L.hba1c >= 5.7);

    /* ---- scores ---- */
    var S = R.scores;
    S.fib4 = C.fib4(age, L.ast, L.alt, L.plt);
    S.nfs = C.nfs(age, bmi, ifgDm, L.ast, L.alt, L.plt, L.alb);
    S.apri = C.apri(L.ast, astUln, L.plt);
    S.elf = C.elfBand(L.elf);
    S.fli = C.fli(L.tg, bmi, L.ggt, waist);
    S.hsi = C.hsi(L.alt, L.ast, bmi, female, dm);
    S.homa = (v.dh_liver || []).indexOf('Insulin') >= 0 ? null : C.homa(L.glu, L.ins);
    S.agile3 = C.agile3(lsm, L.ast, L.alt, L.plt, dm, male, age);
    S.agile4 = C.agile4(lsm, L.ast, L.alt, L.plt, dm, male);
    S.fast = C.fast(lsm, cap, L.ast);
    S.lsm = C.lsmBand(lsm);
    S.cap = C.capBand(cap);
    S.mre = C.mreBand(mre);
    S.baveno = lsm != null && lsm >= 10 ? C.baveno(lsm, L.plt) : null;
    S.egfr = C.egfr(L.creat, age, female);
    S.alcohol = (v.hab_alcohol === 'current' || v.hab_alcohol === 'ex') && has(C.num(v.hab_alc_g)) ? C.alcoholClass(C.num(v.hab_alc_g), female) : (v.hab_alcohol === 'never' ? { cls: 'none', band: 'low', text: 'No alcohol.' } : null);
    S.auditC = C.auditC(C.num(v.hab_audit1), C.num(v.hab_audit2), C.num(v.hab_audit3), female);
    S.packYears = C.packYears(C.num(v.hab_cigs), C.num(v.hab_smoke_years));
    if (S.alcohol && v.hab_alcohol === 'ex') S.alcohol.text += ' (stopped)';

    /* ---- cardiometabolic criteria ---- */
    var cm = C.cardiometabolic({
      bmi: bmi, waist: waist, female: female, ethnicity: p.ethnicity,
      glucoseMg: L.glu, glucose2hMg: L.glu2h, hba1c: L.hba1c, dm: dm, dmTreated: dm,
      sbp: C.num(v.ex_sbp), dbp: C.num(v.ex_dbp), htnTreated: yes(v.pm_htn_treated),
      tgMg: L.tg, hdlMg: L.hdl, lipidTreated: yes(v.pm_lipid_treated)
    });
    if (pre && !cm.met.some(function (m) { return /glucose|diabetes/i.test(m); })) { cm.met.push('Pre-diabetes (history)'); cm.count++; cm.unmet = cm.unmet.filter(function (x) { return x !== 'Glucose'; }); cm.unknown = cm.unknown.filter(function (x) { return !/Glucose/.test(x); }); }
    cm.satisfied = cm.count >= 1;
    R.cm = cm;

    /* ---- steatosis ---- */
    var ev = [], against = [];
    var usg = C.num(v.us_steatosis);
    if (usg != null) { if (usg >= 1) ev.push('Ultrasound steatosis grade ' + usg); else against.push('Ultrasound: no steatosis'); }
    if (cap != null) { if (cap >= 275) ev.push('CAP ' + cap + ' dB/m (≥275)'); else if (cap >= 248) ev.push('CAP ' + cap + ' dB/m (248–274, possible)'); else against.push('CAP ' + cap + ' dB/m (<248)'); }
    if (pdff != null) { if (pdff >= 5) ev.push('MRI-PDFF ' + pdff + '% (≥5%)'); else against.push('MRI-PDFF ' + pdff + '% (<5%)'); }
    var bxS = C.num(v.bx_steatosis);
    if (bxS != null) { if (bxS >= 1) ev.push('Biopsy steatosis grade ' + bxS); else against.push('Biopsy: no steatosis'); }
    var bxFib = v.bx_fibrosis != null && v.bx_fibrosis !== '' ? String(v.bx_fibrosis) : null;
    if (S.fli && S.fli.band === 'high' && !ev.length) ev.push('FLI ' + S.fli.value + ' (≥60, suggestive)');
    var steatosis = ev.length ? 'present' : against.length ? 'absent' : 'unknown';
    if (ev.length === 1 && /FLI/.test(ev[0])) steatosis = 'probable';
    R.steatosis = { status: steatosis, evidence: ev, against: against };

    /* ---- other or additional causes ---- */
    var other = [];
    if (v.lab_hbsag === 'pos') other.push('HBsAg positive: chronic hepatitis B needs its own assessment (HBV DNA, HBeAg) and treatment decision.');
    if (v.lab_antihcv === 'pos') other.push(v.lab_hcvrna === 'neg' ? 'Anti-HCV positive with RNA not detected: past or treated hepatitis C.' : 'Anti-HCV positive: check HCV RNA; active hepatitis C needs antiviral treatment.');
    if ((v.dh_steatogenic || []).length) other.push('Steatogenic drug exposure: ' + v.dh_steatogenic.join(', ') + '. Review the indication and alternatives.');
    if (S.alcohol && S.alcohol.band === 'high') other.push('Alcohol intake in the ALD range: alcohol-related liver disease is the leading cause; MASLD criteria may coexist.');
    if (has(L.ferritin) && has(L.tsat) && L.tsat > 45 && L.ferritin > (female ? 200 : 300)) other.push('Raised ferritin with transferrin saturation >45%: test HFE genotype (haemochromatosis).');
    else if (has(L.ferritin) && L.ferritin > (female ? 200 : 300)) other.push('Raised ferritin: usually metabolic hyperferritinaemia in MASLD; confirm transferrin saturation <45%.');
    if ((v.lab_ana === 'pos' || v.lab_asma === 'pos') && (has(L.igg) && L.igg > 16)) other.push('Autoantibodies with raised IgG: consider autoimmune hepatitis (liver biopsy).');
    else if (v.lab_ana === 'pos' || v.lab_asma === 'pos') other.push('Positive ANA/ASMA: low-titre autoantibodies are common in MASLD; raised IgG or ALT flare would prompt biopsy.');
    if (v.lab_ama === 'pos') other.push('AMA positive: assess for primary biliary cholangitis (ALP, imaging).');
    if (has(L.cerulo) && L.cerulo < 20) other.push("Low ceruloplasmin: exclude Wilson's disease (24-h urine copper, slit-lamp).");
    if (v.lab_ttg === 'pos') other.push('Positive coeliac serology: refer for duodenal biopsy; coeliac disease can raise ALT.');
    if (has(L.tsh) && L.tsh > 4) other.push('Raised TSH: hypothyroidism contributes to steatosis; treat and re-check liver tests.');
    if (v.pm_thyroid === 'hypo') other.push('Hypothyroidism on record: confirm it is adequately replaced.');
    if (inList(v.ex_ext, 'lipodystrophy')) other.push('Lipodystrophy pattern: consider genetic or acquired lipodystrophy.');
    if (inList(v.reasons, 'weight_loss')) other.push('Unexplained weight loss: look beyond MASLD (malignancy, malabsorption).');
    R.otherCauses = other;

    /* ---- fibrosis risk ---- */
    var fib = { level: 'unknown', stage: null, basis: [], next: '' };
    function set(level, stage, why) { fib.level = level; fib.stage = stage; fib.basis.push(why); }
    if (bxFib != null) {
      var fnum = parseInt(bxFib, 10);
      if (fnum >= 4) set('cirrhosis', 'F4', 'Liver biopsy: F4');
      else if (fnum === 3) set('high', 'F3', 'Liver biopsy: F3');
      else if (fnum === 2) set('significant', 'F2', 'Liver biopsy: F2');
      else set('low', 'F0–F1', 'Liver biopsy: F' + bxFib);
    } else if (lsm != null) {
      if (lsm < 8) set('low', 'F0–F1 likely', 'Liver stiffness ' + lsm + ' kPa (<8)');
      else if (lsm < 12) {
        if (S.agile3 && S.agile3.band === 'low') set('low', 'F0–F2', 'LSM ' + lsm + ' kPa (8–12) but Agile 3+ ' + S.agile3.value + ' rules out advanced fibrosis');
        else if (S.agile3 && S.agile3.band === 'high') set('high', 'F3 likely', 'LSM ' + lsm + ' kPa (8–12) and Agile 3+ ' + S.agile3.value + ' rules in advanced fibrosis');
        else if (S.elf && S.elf.band === 'high') set('high', 'F3 likely', 'LSM ' + lsm + ' kPa (8–12) and ELF ' + L.elf + ' (≥9.8)');
        else if (S.elf && S.elf.band === 'low') set('low', 'F0–F2', 'LSM ' + lsm + ' kPa (8–12) but ELF ' + L.elf + ' (<7.7)');
        else set('indeterminate', 'F2–F3 possible', 'Liver stiffness ' + lsm + ' kPa (8–12 grey zone)');
      } else if (lsm < 15) set('high', 'F3 likely', 'Liver stiffness ' + lsm + ' kPa (≥12)');
      else {
        var cirrhosisSupport = [];
        if (has(L.plt) && L.plt < 150) cirrhosisSupport.push('platelets <150');
        if (S.agile4 && S.agile4.band === 'high') cirrhosisSupport.push('Agile 4 ' + S.agile4.value);
        if (inList(v.us_findings, 'nodular') || inList(v.us_findings, 'coarse')) cirrhosisSupport.push('nodular/coarse liver on ultrasound');
        if (inList(v.us_findings, 'collaterals') || inList(v.us_findings, 'portal_dil') || (has(C.num(v.us_spleen)) && C.num(v.us_spleen) >= 13)) cirrhosisSupport.push('portal hypertension signs on imaging');
        if (v.egd_varices && v.egd_varices !== 'none') cirrhosisSupport.push('varices');
        if (lsm >= 20 || cirrhosisSupport.length) set('cirrhosis', 'F4 likely (cACLD)', 'Liver stiffness ' + lsm + ' kPa' + (cirrhosisSupport.length ? ' with ' + cirrhosisSupport.join(', ') : ' (≥20)'));
        else set('high', 'F3–F4 (cACLD)', 'Liver stiffness ' + lsm + ' kPa (≥15): compensated advanced chronic liver disease');
      }
    } else if (mre != null) {
      if (S.mre.band === 'low') set('low', 'F0–F1 likely', 'MRE ' + mre + ' kPa (<2.5)');
      else if (S.mre.band === 'indeterminate') set('indeterminate', 'F1–F2', 'MRE ' + mre + ' kPa (2.5–3.6)');
      else if (S.mre.band === 'high') set('high', 'F3 likely', 'MRE ' + mre + ' kPa (≥3.63)');
      else set('cirrhosis', 'F4 likely', 'MRE ' + mre + ' kPa (≥5)');
    } else if (S.elf) {
      set(S.elf.band === 'high' ? 'high' : S.elf.band, S.elf.band === 'high' ? 'F3 likely' : S.elf.band === 'low' ? 'F0–F2' : 'uncertain', 'ELF ' + L.elf);
    } else if (S.fib4) {
      set(S.fib4.band, S.fib4.band === 'low' ? 'advanced fibrosis unlikely' : S.fib4.band === 'high' ? 'advanced fibrosis possible' : 'uncertain', 'FIB-4 ' + S.fib4.value + ' (' + S.fib4.band + ')');
      if (S.nfs && S.nfs.band !== S.fib4.band) fib.basis.push('NFS ' + S.nfs.value + ' (' + S.nfs.band + ')');
    }
    /* decompensation or known cirrhosis override */
    var decomp = [];
    if ((v.ex_ascites_grade && v.ex_ascites_grade !== 'none') || inList(v.ex_abd, 'ascites') || inList(v.us_findings, 'ascites')) decomp.push('ascites');
    if (C.num(v.ex_he_grade) >= 1) decomp.push('hepatic encephalopathy grade ' + v.ex_he_grade);
    if (inList(v.hpi_decomp, 'bleed') || v.egd_varices === 'banded') decomp.push('variceal bleeding');
    if (inList(v.hpi_decomp, 'jaundice') && has(L.tbil) && L.tbil > 2) decomp.push('jaundice');
    var knownCirrhosis = inList(v.pm_liver, 'cirrhosis');
    if (fib.level !== 'cirrhosis' && (knownCirrhosis || (v.egd_varices && v.egd_varices !== 'none'))) {
      fib.level = 'cirrhosis'; fib.stage = 'F4'; fib.basis.push(knownCirrhosis ? 'Known cirrhosis' : 'Oesophageal varices');
    }
    if (decomp.length && fib.level !== 'cirrhosis' && (lsm == null || lsm >= 10)) { fib.level = 'cirrhosis'; fib.stage = 'F4 (clinical)'; fib.basis.push('Decompensation: ' + decomp.join(', ')); }
    fib.decompensated = fib.level === 'cirrhosis' && decomp.length > 0;
    fib.decompensation = decomp;
    var LABEL = { low: 'Low risk of advanced fibrosis', indeterminate: 'Indeterminate risk of advanced fibrosis', significant: 'Significant fibrosis (F2)', high: 'High risk of advanced fibrosis (F3)', cirrhosis: fib.decompensated ? 'Decompensated cirrhosis' : 'Cirrhosis / cACLD likely', unknown: 'Fibrosis not yet assessed' };
    fib.label = LABEL[fib.level];
    R.fibrosis = fib;
    var cirr = fib.level === 'cirrhosis';
    if (cirr) {
      S.childPugh = C.childPugh(L.tbil, L.alb, L.inr, v.ex_ascites_grade, C.num(v.ex_he_grade));
      S.meld = C.meld3(L.tbil, L.inr, L.creat, L.na, L.alb, female);
    }

    /* ---- MASH ---- */
    var mash = null;
    if (bxFib != null || bxS != null) {
      var ball = C.num(v.bx_ballooning), infl = C.num(v.bx_inflammation);
      if (bxS >= 1 && ball >= 1 && infl >= 1) mash = 'MASH confirmed on biopsy (NAS ' + (bxS + ball + infl) + ')';
      else if (bxS >= 1) mash = 'Steatosis without steatohepatitis on biopsy';
    } else if (S.fast && S.fast.band === 'high') mash = 'At-risk MASH likely (FAST ' + S.fast.value + ')';
    else if (fib.level === 'high' || fib.level === 'significant' || cirr) mash = 'MASH presumed (fibrosis present)';
    R.mash = mash;

    /* ---- diagnosis ---- */
    var dx = { primary: '', qualifier: '', codes: [], problems: [] };
    var alcBand = S.alcohol ? S.alcohol.band : null;
    var sldPresent = steatosis === 'present' || steatosis === 'probable';
    if (sldPresent) {
      if (alcBand === 'high') { dx.primary = 'Alcohol-related liver disease'; dx.codes.push(cirr ? 'K70.30' : 'K70.0'); if (cm.satisfied) dx.qualifier = 'with cardiometabolic risk factors'; }
      else if (cm.satisfied) {
        dx.primary = alcBand === 'indeterminate' ? 'MetALD (MASLD with increased alcohol intake)' : 'MASLD (metabolic dysfunction-associated steatotic liver disease)';
        dx.codes.push('K76.0');
        if (mash && /confirmed|likely/.test(mash)) { dx.codes.push('K75.81'); dx.primary = dx.primary.replace('MASLD (', 'MASH, metabolic dysfunction-associated steatohepatitis (').replace('steatotic liver disease)', 'steatohepatitis)'); }
        if (alcBand == null && v.hab_alcohol !== 'never') dx.qualifier = 'alcohol intake not quantified';
      } else if (cm.unknown.length) { dx.primary = 'Steatotic liver disease, cardiometabolic criteria incomplete'; dx.codes.push('K76.0'); dx.qualifier = 'missing: ' + cm.unknown.join(', '); }
      else { dx.primary = other.length ? 'Steatotic liver disease, specific aetiology to confirm' : 'Cryptogenic steatotic liver disease'; dx.codes.push('K76.0'); }
      if (steatosis === 'probable') dx.qualifier = (dx.qualifier ? dx.qualifier + '; ' : '') + 'steatosis suggested by FLI only, confirm on imaging';
    } else if (steatosis === 'absent') {
      dx.primary = cm.satisfied ? 'No hepatic steatosis demonstrated; cardiometabolic risk present' : 'No hepatic steatosis demonstrated';
      if (has(L.alt) && L.alt > (female ? 19 : 30)) { dx.qualifier = 'raised ALT: look for other causes'; dx.codes.push('R74.01'); }
    } else {
      dx.primary = cm.satisfied ? 'Suspected MASLD (steatosis not yet documented)' : 'Suspected steatotic liver disease';
      dx.qualifier = 'ultrasound or CAP needed';
    }
    if (cirr) dx.codes.push(alcBand === 'high' ? (decomp.indexOf('ascites') >= 0 ? 'K70.31' : 'K70.30') : 'K74.60');
    if (fib.level === 'cirrhosis' && decomp.indexOf('ascites') >= 0) dx.codes.push('R18.8');
    if (dm) dx.codes.push('E11.9'); else if (pre || (has(L.hba1c) && L.hba1c >= 5.7 && L.hba1c < 6.5)) dx.codes.push('R73.03');
    if (bmi != null && bmi >= 40) dx.codes.push('E66.01'); else if (bmi != null && bmi >= 30) dx.codes.push('E66.9');
    if (yes(v.pm_htn) || (has(C.num(v.ex_sbp)) && C.num(v.ex_sbp) >= 140)) dx.codes.push('I10');
    if (yes(v.pm_lipid) || (has(L.tg) && L.tg >= 150) || (has(L.ldl) && L.ldl >= 160)) dx.codes.push('E78.5');
    dx.codes = dx.codes.filter(function (c, i, a) { return a.indexOf(c) === i; });
    /* problem list */
    if (dm) dx.problems.push('Type 2 diabetes' + (has(L.hba1c) ? ' (HbA1c ' + L.hba1c + '%)' : ''));
    else if (pre || (has(L.hba1c) && L.hba1c >= 5.7)) dx.problems.push('Pre-diabetes');
    if (bmi != null && bmi >= 25) dx.problems.push(C.bmiClass(bmi) + ' (BMI ' + C.round(bmi, 1) + ')');
    if (R.body.whtr != null && R.body.whtr >= 0.5) dx.problems.push('Central adiposity (waist-to-height ' + R.body.whtr + ')');
    if (yes(v.pm_htn) || (has(C.num(v.ex_sbp)) && (C.num(v.ex_sbp) >= 140 || C.num(v.ex_dbp) >= 90))) dx.problems.push('Hypertension');
    if (yes(v.pm_lipid) || (has(L.tg) && L.tg >= 150) || (has(L.ldl) && L.ldl >= 130)) dx.problems.push('Dyslipidaemia');
    if ((v.pm_cvd || []).length) dx.problems.push('Cardiovascular disease');
    if (v.pm_osa === 'yes' || v.pm_osa === 'cpap') dx.problems.push('Obstructive sleep apnoea'); else if (v.pm_osa === 'suspected' || inList(v.hpi_symptoms, 'daytime')) dx.problems.push('Possible sleep apnoea');
    if (yes(v.pm_pcos)) dx.problems.push('PCOS');
    if (v.pm_thyroid && v.pm_thyroid !== 'no') dx.problems.push('Thyroid disease');
    if (S.egfr && S.egfr.value < 60) dx.problems.push('Reduced eGFR ' + S.egfr.value + ' (' + S.egfr.stage + ')'); else if (has(L.acr) && L.acr >= 30) dx.problems.push('Albuminuria');
    if (has(L.urate) && L.urate > (female ? 6 : 7)) dx.problems.push('Hyperuricaemia');
    if (v.hab_smoking === 'current') dx.problems.push('Current smoker' + (S.packYears != null ? ' (' + S.packYears + ' pack-years)' : ''));
    if (S.auditC && S.auditC.positive) dx.problems.push('AUDIT-C positive (' + S.auditC.value + ')');
    if (S.homa && S.homa.band === 'high') dx.problems.push('Insulin resistance (HOMA-IR ' + S.homa.value + ')');
    R.diagnosis = dx;

    /* ---- recommendations ---- */
    var rec = [];
    function group(title) { var g = { title: title, items: [] }; rec.push(g); return function (t, why) { g.items.push(why ? t + ' [' + why + ']' : t); }; }

    /* A. investigations */
    var inv = group('Investigations to complete');
    var missingFib = !has(L.ast) || !has(L.alt) || !has(L.plt);
    if (missingFib) inv('CBC and liver panel (AST, ALT, GGT, ALP, bilirubin, albumin, INR) to calculate FIB-4.');
    if (v.lab_hbsag !== 'pos' && v.lab_hbsag !== 'neg') inv('HBsAg (and anti-HBs, anti-HBc) to exclude hepatitis B and check immunity.');
    if (v.lab_antihcv !== 'pos' && v.lab_antihcv !== 'neg') inv('Anti-HCV to exclude hepatitis C.');
    if (v.lab_antihcv === 'pos' && v.lab_hcvrna !== 'neg' && v.lab_hcvrna !== 'pos') inv('HCV RNA (anti-HCV positive).');
    if (!has(L.hba1c) && !has(L.glu)) inv('HbA1c and fasting glucose (cardiometabolic criteria, diabetes screening).');
    if (!has(L.tg) || !has(L.hdl)) inv('Fasting lipid profile.');
    if (!has(L.ferritin)) inv('Ferritin and transferrin saturation.');
    if (!has(L.tsh)) inv('TSH.');
    if (!has(L.creat)) inv('Creatinine with eGFR' + (dm ? ' and urine albumin/creatinine ratio' : '') + '.');
    else if (dm && !has(L.acr)) inv('Urine albumin/creatinine ratio (diabetes).');
    if (steatosis === 'unknown') inv('Abdominal ultrasound (or CAP) to document steatosis.');
    if (fib.level === 'indeterminate' || fib.level === 'high') {
      if (lsm == null) inv('Transient elastography (FibroScan) with CAP: second step after FIB-4.', 'EASL 2024');
      else if (lsm >= 8 && lsm < 12 && !(S.agile3 && S.agile3.band !== 'indeterminate') && !S.elf) inv('Grey-zone stiffness: ELF test, Agile 3+ (needs AST, ALT, platelets) or MR elastography.', 'EASL 2024');
      if (fib.level === 'high' && bxFib == null) inv('Consider liver biopsy if it would change management (confirm stage for treatment eligibility, or discordant tests).');
    }
    if (fib.level === 'low' && S.fib4 && lsm == null && (dm || (bmi != null && bmi >= 30 && cm.count >= 2))) inv('FIB-4 is low; in type 2 diabetes or obesity with multiple risk factors, elastography is still reasonable because FIB-4 misses some advanced fibrosis.', 'EASL 2024, AASLD 2023');
    if (has(L.alt) && L.alt > 2 * (female ? 19 : 30) && (v.lab_ana == null || v.lab_ana === '') && (v.lab_igg == null || v.lab_igg === '')) inv('ALT more than twice the upper limit: ANA, ASMA, IgG (autoimmune hepatitis screen).');
    if (age != null && age < 40 && (v.lab_cerulo == null || v.lab_cerulo === '') && has(L.alt) && L.alt > (female ? 19 : 30)) inv("Age under 40 with raised ALT: ceruloplasmin (Wilson's disease).");
    if (cirr) {
      inv('Ultrasound ± AFP now and every 6 months (liver cancer surveillance).', 'EASL 2024, AASLD 2023');
      if (S.baveno && S.baveno.endoscopy && (!v.egd_varices)) inv('Upper endoscopy for varices (Baveno VII criteria not met for avoidance).', 'Baveno VII');
      if (!has(L.na) || !has(L.inr) || !has(L.creat)) inv('Sodium, INR, creatinine and albumin for MELD 3.0 and Child-Pugh.');
      inv('Bone density (DXA) and vitamin D; sarcopenia assessment (hand grip or muscle mass).');
    } else if (fib.level === 'high') inv('Liver cancer surveillance at F3 only after individual risk assessment (EASL 2024); discuss 6-monthly ultrasound.');
    if (pre && !has(L.glu2h)) inv('Consider OGTT (2-h glucose) to classify glucose tolerance.');
    if ((inList(v.hpi_symptoms, 'sleep') || inList(v.hpi_symptoms, 'daytime') || (has(C.num(v.ex_neck)) && C.num(v.ex_neck) >= 40)) && v.pm_osa !== 'yes' && v.pm_osa !== 'cpap') inv('STOP-Bang and sleep study for obstructive sleep apnoea.');
    if ((v.pm_cvd || []).length === 0 && (dm || (age != null && age >= 40 && cm.count >= 3))) inv('Cardiovascular risk assessment (SCORE2 or ASCVD), ECG; coronary calcium score if intermediate risk.', 'EASL 2024: CVD is the main cause of death in MASLD');

    /* B. lifestyle */
    var ls = group('Lifestyle');
    if (bmi != null && bmi >= 25) {
      var target = cirr || fib.level === 'high' ? '≥10%' : (mash || fib.level === 'significant' || fib.level === 'indeterminate') ? '7–10%' : '≥5%';
      var kg = wt != null ? ' (about ' + Math.round(wt * (target === '≥10%' ? 0.10 : target === '7–10%' ? 0.07 : 0.05)) + (target === '7–10%' ? '–' + Math.round(wt * 0.10) : '') + ' kg)' : '';
      ls('Weight loss target ' + target + kg + ' over 6–12 months: ≥5% reduces liver fat, 7–10% improves MASH, ≥10% can regress fibrosis.', 'EASL 2024');
      ls('Energy deficit of 500–1000 kcal/day; dietitian referral.');
    } else ls('Normal BMI: aim for 3–5% weight loss if waist is raised, with emphasis on diet quality and resistance exercise; review other causes carefully (lean MASLD).', 'EASL 2024');
    ls('Mediterranean-style diet: vegetables, legumes, whole grains, olive oil, fish, nuts. Stop sugary drinks and ultra-processed food; limit fructose and refined carbohydrate.');
    ls('Physical activity 150–300 minutes/week of moderate aerobic exercise plus resistance training 2–3 times/week; reduce sitting time.', 'EASL 2024');
    if (has(C.num(v.hab_coffee)) ? C.num(v.hab_coffee) < 3 : true) ls('Coffee (3 or more cups/day, unsweetened) is linked to lower fibrosis risk in observational studies.');
    if (v.hab_alcohol === 'current') {
      if (cirr || fib.level === 'high' || fib.level === 'significant' || alcBand !== 'low') ls('Complete alcohol abstinence (fibrosis present or intake above the MASLD threshold); offer brief intervention' + (S.auditC && S.auditC.positive ? ' and addiction services (AUDIT-C positive)' : '') + '.', 'EASL 2024');
      else ls('Keep alcohol well below 140 g/week (women) or 210 g/week (men); abstinence is safest for the liver.');
    }
    if (v.hab_smoking === 'current') ls('Smoking cessation (smoking accelerates fibrosis and cardiovascular risk); offer pharmacotherapy.');
    if (v.hab_shisha === 'daily') ls('Stop waterpipe (shisha) smoking.');
    if (has(C.num(v.hab_sleep)) && C.num(v.hab_sleep) < 6) ls('Sleep hygiene: aim for 7–8 hours; short sleep worsens insulin resistance.');

    /* C. liver-directed and metabolic drugs */
    var rx = group('Pharmacotherapy');
    var f2f3 = !cirr && (bxFib === '2' || bxFib === '3' || (lsm != null && lsm >= 8 && lsm <= 15 && fib.level !== 'low') || (mre != null && mre >= 3.1 && mre <= 4.4) || (S.fast && S.fast.band === 'high') || fib.level === 'high' || fib.level === 'significant');
    var alcDay = has(C.num(v.hab_alc_g)) ? C.num(v.hab_alc_g) / 7 : 0;
    if (f2f3 && sldPresent) {
      var cautions = [];
      if (alcDay > (female ? 20 : 30)) cautions.push('alcohol above 20 g/day (women) or 30 g/day (men)');
      if (v.pm_thyroid === 'hyper' || v.pm_thyroid === 'other') cautions.push('active thyroid disease');
      if (other.length) cautions.push('other active liver disease to exclude');
      if (lsm != null && lsm > 15 && lsm <= 20) cautions.push('stiffness 16–20 kPa: exclude cirrhosis with a second test first');
      rx('Candidate for MASH-directed therapy (non-cirrhotic MASH with F2–F3): resmetirom 80–100 mg daily, or semaglutide 2.4 mg weekly' + (dm || (bmi != null && bmi >= 30) ? ' (preferred here: obesity or type 2 diabetes need treatment anyway)' : '') + '. Approval and availability differ by country; confirm local status.' + (cautions.length ? ' Cautions: ' + cautions.join('; ') + '.' : ''), 'AASLD 2024, MAESTRO-NASH, ESSENCE');
      rx('If treated: ALT and lipids at 3 months, liver stiffness at 12 months; continue if LSM falls ≥25% or ALT normalises.', 'Noureddin 2024');
    } else if (cirr) rx('Resmetirom and semaglutide are not approved for cirrhosis; manage cirrhosis and comorbidities, and consider clinical trials.');
    if (dm) {
      rx('Type 2 diabetes: prefer agents with liver and cardiovascular benefit: GLP-1 receptor agonist (semaglutide, or tirzepatide), SGLT2 inhibitor, or pioglitazone. Metformin is safe but does not treat the liver.' + (fib.decompensated ? ' In decompensated cirrhosis, insulin is usually the safest choice.' : ''), 'EASL 2024, AASLD 2023');
      if (has(L.hba1c) && L.hba1c > 7) rx('HbA1c ' + L.hba1c + '%: intensify glycaemic control towards <7% (individualised).');
    } else if (bmi != null && bmi >= 30 && !cirr) rx('Obesity without diabetes: consider a GLP-1 receptor agonist (semaglutide 2.4 mg) or tirzepatide if lifestyle change fails after 3–6 months.', 'EASL 2024');
    if (mash && /confirmed/.test(mash) && !dm && !cirr) rx('Vitamin E 800 IU/day is an option in biopsy-proven MASH without diabetes or cirrhosis (AASLD); EASL 2024 does not recommend it. Discuss risks and benefits.');
    if ((has(L.ldl) && L.ldl >= 100) || (v.pm_cvd || []).length || (dm && !inList(v.dh_liver, 'Statin'))) {
      if (!inList(v.dh_liver, 'Statin')) rx('Statin is indicated for cardiovascular risk and is safe in MASLD, including compensated cirrhosis' + (fib.decompensated ? '; avoid in decompensated cirrhosis' : '') + '. Do not withhold for mildly raised ALT.', 'EASL 2024');
      else rx('Continue statin; it is safe in MASLD and compensated cirrhosis.');
    }
    if (has(L.tg) && L.tg >= 500) rx('Triglycerides ≥500 mg/dL: fibrate or omega-3 to prevent pancreatitis; review alcohol and sugar intake.');
    if (bmi != null && (bmi >= 35 || (bmi >= 30 && dm)) && !fib.decompensated) rx('Discuss metabolic (bariatric) surgery referral: BMI ≥35, or ≥30 with type 2 diabetes not controlled; resolves MASH in most and regresses fibrosis' + (cirr ? ' (compensated cirrhosis without portal hypertension only, in an expert centre)' : '') + '.', 'ASMBS/IFSO 2022, BRAVES');
    if ((v.dh_steatogenic || []).length) rx('Review steatogenic drugs (' + v.dh_steatogenic.join(', ') + ') with the prescribing team for alternatives.');
    if (v.dh_herbal) rx('Stop unproven herbal or slimming products (' + v.dh_herbal + '); they can cause liver injury.');

    /* D. cardiometabolic */
    var cmr = group('Cardiometabolic risk');
    var sbp = C.num(v.ex_sbp), dbp = C.num(v.ex_dbp);
    if ((has(sbp) && (sbp >= 130 || dbp >= 80)) || yes(v.pm_htn)) cmr('Blood pressure target <130/80 mmHg; home monitoring; ACE inhibitor or ARB first-line (renal protection in diabetes).');
    if (R.body.whtr != null && R.body.whtr >= 0.5) cmr('Waist-to-height ratio ' + R.body.whtr + ': central adiposity; keep waist under half the height.');
    if (S.egfr && S.egfr.value < 60) cmr('eGFR ' + S.egfr.value + ': chronic kidney disease; SGLT2 inhibitor, nephrology referral if <45 or albuminuria.');
    if (has(L.acr) && L.acr >= 30) cmr('Albuminuria: ACE inhibitor/ARB and SGLT2 inhibitor.');
    if (has(L.urate) && L.urate > (female ? 6 : 7)) cmr('Hyperuricaemia: reduce fructose and alcohol; treat if gout.');
    if (yes(v.pm_pcos)) cmr('PCOS: metformin or GLP-1 receptor agonist, gynaecology co-management.');
    if (has(L.tsh) && L.tsh > 4) cmr('Treat hypothyroidism (levothyroxine) and recheck liver tests.');
    if (!rec[rec.length - 1].items.length) cmr('Cardiometabolic parameters within target; recheck yearly.');

    /* E. cirrhosis care */
    if (cirr) {
      var cc = group('Cirrhosis care');
      cc('Liver cancer surveillance: ultrasound ± AFP every 6 months.', 'EASL 2024');
      if (S.baveno) cc(S.baveno.rule, 'Baveno VII');
      if (lsm != null && lsm >= 25) cc('LSM ≥25 kPa: clinically significant portal hypertension likely; carvedilol 6.25–12.5 mg/day to prevent decompensation.', 'Baveno VII');
      cc('Vaccinate against hepatitis A and B if not immune; yearly influenza and pneumococcal vaccines.');
      cc('Avoid NSAIDs and aminoglycosides; paracetamol up to 2 g/day is acceptable.');
      cc('Nutrition: protein 1.2–1.5 g/kg/day, late-evening snack, no protein restriction; salt <5 g/day if ascites.');
      if (decomp.indexOf('ascites') >= 0) cc('Ascites: spironolactone ± furosemide, diagnostic paracentesis at first presentation, consider SBP prophylaxis if ascitic protein <15 g/L.');
      if (decomp.some(function (d) { return /encephalopathy/.test(d); })) cc('Hepatic encephalopathy: lactulose titrated to 2–3 soft stools/day, add rifaximin after a second episode; look for precipitants.');
      if (S.childPugh) cc('Child-Pugh ' + S.childPugh.cls + ' (' + S.childPugh.points + ' points)' + (S.meld ? ', MELD 3.0 ' + S.meld.value : '') + '.');
      if (fib.decompensated || (S.meld && S.meld.value >= 15)) cc('Refer to a liver transplant centre (decompensation or MELD ≥15).');
    } else if (fib.level === 'high') {
      var ac = group('Advanced fibrosis care');
      ac('Vaccinate against hepatitis A and B if not immune.');
      ac('Avoid hepatotoxic drugs and alcohol; review all new prescriptions.');
      if (S.baveno && lsm >= 10) ac(S.baveno.rule, 'Baveno VII');
    }

    /* F. vaccination and general (non-cirrhotic) */
    var gen = group('General');
    if (v.lab_antihbs === 'neg' || (v.lab_hbsag === 'neg' && v.lab_antihbs !== 'pos')) gen('Hepatitis B vaccination (anti-HBs negative or unknown).');
    if (v.lab_hav === 'neg' && !cirr) gen('Hepatitis A vaccination (non-immune).');
    if (dm || (age != null && age >= 65)) gen('Yearly influenza vaccine; pneumococcal vaccine.');
    gen('Patient education: explain MASLD, the fibrosis stage, and the targets agreed today; written plan given.');
    if (!cirr && (fib.level === 'low' || fib.level === 'unknown')) gen('Reassure: with low fibrosis risk, the liver prognosis is good if metabolic health improves; cardiovascular disease is the main risk.');

    /* G. referrals */
    var ref = group('Referrals');
    if (bmi != null && bmi >= 25) ref('Dietitian for a structured weight-loss programme.');
    if (dm && (has(L.hba1c) && L.hba1c > 8)) ref('Diabetes/endocrine clinic for glycaemic control.');
    if (fib.level === 'high' || cirr) ref('Hepatology follow-up in the fatty liver clinic (advanced fibrosis pathway).');
    if (fib.level === 'indeterminate') ref('Fatty liver clinic review with second-line fibrosis test.');
    if ((v.pm_cvd || []).length) ref('Cardiology review of secondary prevention.');
    if (yes(v.pm_pcos)) ref('Gynaecology / endocrinology (PCOS).');
    if (inList(v.hpi_symptoms, 'depression')) ref('Mental health support (low mood).');
    if (!rec[rec.length - 1].items.length) ref('No referral needed at this visit.');

    R.recommendations = rec.filter(function (g) { return g.items.length; });

    /* ---- follow-up ---- */
    var fu;
    if (fib.decompensated) fu = { months: 1, text: 'Review in 4 weeks (decompensated cirrhosis), then every 3 months.' };
    else if (cirr) fu = { months: 6, text: 'Review every 3–6 months with ultrasound ± AFP every 6 months; yearly elastography and platelet count.' };
    else if (fib.level === 'high') fu = { months: 6, text: 'Review in 6 months; repeat elastography in 12 months; yearly liver tests.' };
    else if (fib.level === 'indeterminate' || fib.level === 'significant') fu = { months: 6, text: 'Review in 6 months with the second-line test result; repeat elastography in 12 months.' };
    else if (fib.level === 'low') fu = dm || pre || (bmi != null && bmi >= 30) ? { months: 12, text: 'Review in 12 months with FIB-4 (yearly in type 2 diabetes, pre-diabetes or obesity).' } : { months: 24, text: 'Repeat FIB-4 in 2–3 years; earlier if new risk factors.' };
    else fu = { months: 3, text: 'Review in 3 months with the requested tests to complete fibrosis staging.' };
    if (f2f3 && sldPresent) fu.text += ' If MASH therapy is started: ALT and lipids at 3 months, stiffness at 12 months.';
    if (bmi != null && bmi >= 25) fu.text += ' Weight check monthly with the dietitian.';
    R.followUp = fu;

    /* ---- one-line summary for the sidebar and registry ---- */
    R.summary = dx.primary + (fib.level !== 'unknown' ? '; ' + fib.label : '') + (cm.count ? '; ' + cm.count + '/5 cardiometabolic criteria' : '');
    return R;
  }

  return { evaluate: evaluate, ageAt: ageAt, lab: lab };
});
