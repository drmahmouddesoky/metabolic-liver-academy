/* Fatty Liver Clinic: calculators and unit conversion.
   Pure functions, no DOM. Works in the browser (window.Calc) and in Node (require).
   Formulas and cut-offs match the Metabolic Liver Academy calculators (calc.js, main.js). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Calc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function logistic(x) { return 1 / (1 + Math.exp(-x)); }
  function num(x) { var n = typeof x === 'number' ? x : parseFloat(String(x == null ? '' : x).replace(',', '.')); return isFinite(n) ? n : null; }
  function has() { for (var i = 0; i < arguments.length; i++) if (arguments[i] == null || !isFinite(arguments[i])) return false; return true; }
  function round(x, d) { var p = Math.pow(10, d); return Math.round(x * p) / p; }

  /* ---------- units ----------
     Each lab kind has a base (conventional) unit and an SI unit. base * f = si. */
  var UNITS = {
    glucose: { base: 'mg/dL', si: 'mmol/L', f: 1 / 18.016 },
    chol: { base: 'mg/dL', si: 'mmol/L', f: 1 / 38.67 },
    tg: { base: 'mg/dL', si: 'mmol/L', f: 1 / 88.57 },
    bili: { base: 'mg/dL', si: 'µmol/L', f: 17.104 },
    creat: { base: 'mg/dL', si: 'µmol/L', f: 88.42 },
    albumin: { base: 'g/dL', si: 'g/L', f: 10 },
    protein: { base: 'g/dL', si: 'g/L', f: 10 },
    urate: { base: 'mg/dL', si: 'µmol/L', f: 59.48 },
    hb: { base: 'g/dL', si: 'g/L', f: 10 },
    insulin: { base: 'µU/mL', si: 'pmol/L', f: 6.945 },
    hba1c: { base: '%', si: 'mmol/mol', special: true },
    enzyme: { base: 'U/L', si: 'U/L', f: 1 },
    plt: { base: '×10⁹/L', si: '×10⁹/L', f: 1 },
    wbc: { base: '×10⁹/L', si: '×10⁹/L', f: 1 },
    ferritin: { base: 'ng/mL', si: 'µg/L', f: 1 },
    na: { base: 'mmol/L', si: 'mmol/L', f: 1 },
    pct: { base: '%', si: '%', f: 1 },
    afp: { base: 'ng/mL', si: 'µg/L', f: 1 },
    igg: { base: 'g/L', si: 'g/L', f: 1 },
    cerulo: { base: 'mg/dL', si: 'g/L', f: 0.01 },
    acr: { base: 'mg/g', si: 'mg/mmol', f: 0.113 },
    tsh: { base: 'mIU/L', si: 'mIU/L', f: 1 },
    vitd: { base: 'ng/mL', si: 'nmol/L', f: 2.496 }
  };
  function unitLabel(kind, system) { var u = UNITS[kind]; if (!u) return ''; return system === 'si' ? u.si : u.base; }
  /* convert a value from `from` system ('base'|'si') to `to` system */
  function convert(kind, value, from, to) {
    var v = num(value); if (v == null) return null;
    var u = UNITS[kind]; if (!u || from === to) return v;
    if (u.special) { // HbA1c (NGSP % <-> IFCC mmol/mol)
      return to === 'si' ? (v - 2.15) * 10.929 : v / 10.929 + 2.15;
    }
    return to === 'si' ? v * u.f : v / u.f;
  }
  function toBase(kind, value, from) { return convert(kind, value, from || 'base', 'base'); }

  /* ---------- body ---------- */
  function bmi(wt, ht) { return has(wt, ht) && ht > 0 ? wt / Math.pow(ht / 100, 2) : null; }
  function bmiClass(b) {
    if (b == null) return null;
    if (b < 18.5) return 'Underweight'; if (b < 25) return 'Normal weight'; if (b < 30) return 'Overweight';
    if (b < 35) return 'Obesity class I'; if (b < 40) return 'Obesity class II'; return 'Obesity class III';
  }
  function whtr(waist, ht) { return has(waist, ht) && ht > 0 ? waist / ht : null; }
  function whr(waist, hip) { return has(waist, hip) && hip > 0 ? waist / hip : null; }

  /* ---------- fibrosis blood scores ---------- */
  /* FIB-4 = (age × AST) / (platelets × √ALT). Rule-out <1.30 (<2.0 from age 65); rule-in ≥2.67. */
  function fib4(age, ast, alt, plt) {
    if (!has(age, ast, alt, plt) || alt <= 0 || plt <= 0) return null;
    var v = (age * ast) / (plt * Math.sqrt(alt));
    var low = age >= 65 ? 2.0 : 1.3;
    var band = v < low ? 'low' : v >= 2.67 ? 'high' : 'indeterminate';
    var notes = [];
    if (age < 35) notes.push('FIB-4 is not reliable under age 35.');
    if (age >= 65) notes.push('Age 65 or over: lower cut-off of 2.0 used.');
    if (ast > 200 || alt > 200) notes.push('Very high AST or ALT: acute injury can mislead FIB-4; repeat when stable.');
    return { value: round(v, 2), band: band, low: low, high: 2.67, notes: notes };
  }
  /* NFS = -1.675 + 0.037·age + 0.094·BMI + 1.13·IFG/DM + 0.99·AST/ALT − 0.013·platelets − 0.66·albumin (g/dL) */
  function nfs(age, bmiV, ifgDm, ast, alt, plt, albGdl) {
    if (!has(age, bmiV, ast, alt, plt, albGdl) || alt <= 0) return null;
    var v = -1.675 + 0.037 * age + 0.094 * bmiV + 1.13 * (ifgDm ? 1 : 0) + 0.99 * (ast / alt) - 0.013 * plt - 0.66 * albGdl;
    var low = age >= 65 ? 0.12 : -1.455;
    var band = v < low ? 'low' : v > 0.676 ? 'high' : 'indeterminate';
    var notes = [];
    if (age < 35) notes.push('NFS is not reliable under age 35.');
    if (bmiV >= 35 || ifgDm) notes.push('Severe obesity or diabetes raises NFS; confirm a high score with a second-line test.');
    return { value: round(v, 2), band: band, low: low, high: 0.676, notes: notes };
  }
  /* APRI = (AST / AST-ULN × 100) / platelets. <0.5 rules out significant fibrosis; >1.5 suggests it; >2 cirrhosis. */
  function apri(ast, astUln, plt) {
    if (!has(ast, astUln, plt) || plt <= 0 || astUln <= 0) return null;
    var v = (ast / astUln * 100) / plt;
    return { value: round(v, 2), band: v < 0.5 ? 'low' : v > 1.5 ? 'high' : 'indeterminate' };
  }
  /* ELF: EASL 2024 rule-in 9.8 (advanced fibrosis), rule-out 7.7 */
  function elfBand(elf) {
    if (!has(elf)) return null;
    return { value: elf, band: elf < 7.7 ? 'low' : elf >= 9.8 ? 'high' : 'indeterminate' };
  }

  /* ---------- steatosis scores ---------- */
  function fli(tgMg, bmiV, ggt, waist) {
    if (!has(tgMg, bmiV, ggt, waist) || tgMg <= 0 || ggt <= 0) return null;
    var y = 0.953 * Math.log(tgMg) + 0.139 * bmiV + 0.718 * Math.log(ggt) + 0.053 * waist - 15.745;
    var s = 100 * logistic(y);
    return { value: round(s, 0), band: s < 30 ? 'low' : s >= 60 ? 'high' : 'indeterminate' };
  }
  function hsi(alt, ast, bmiV, female, dm) {
    if (!has(alt, ast, bmiV) || ast <= 0) return null;
    var s = 8 * alt / ast + bmiV + (female ? 2 : 0) + (dm ? 2 : 0);
    return { value: round(s, 1), band: s < 30 ? 'low' : s > 36 ? 'high' : 'indeterminate' };
  }
  /* HOMA-IR = glucose (mmol/L) × insulin (µU/mL) / 22.5 */
  function homa(gluMg, ins) {
    if (!has(gluMg, ins)) return null;
    var s = (gluMg / 18.016) * ins / 22.5;
    return { value: round(s, 2), band: s >= 2.5 ? 'high' : 'low' };
  }

  /* ---------- elastography-based ---------- */
  /* Agile 3+ (Sanyal 2023). sex: 1 male, 0 female. dm: 1/0 */
  function agile3(lsm, ast, alt, plt, dm, male, age) {
    if (!has(lsm, ast, alt, plt, age) || lsm <= 0 || ast <= 0) return null;
    var p = logistic(-3.92368 + 2.29714 * Math.log(lsm) - 0.00902 * plt - 0.98633 * (alt / ast) +
      1.08636 * (dm ? 1 : 0) - 0.38581 * (male ? 1 : 0) + 0.03018 * age);
    return { value: round(p, 3), band: p < 0.451 ? 'low' : p >= 0.679 ? 'high' : 'indeterminate' };
  }
  function agile4(lsm, ast, alt, plt, dm, male) {
    if (!has(lsm, ast, alt, plt) || lsm <= 0 || ast <= 0) return null;
    var p = logistic(7.50139 - 15.42498 / Math.sqrt(lsm) - 0.01378 * plt - 1.41149 * (alt / ast) -
      0.53281 * (male ? 1 : 0) + 0.41741 * (dm ? 1 : 0));
    return { value: round(p, 3), band: p < 0.251 ? 'low' : p >= 0.565 ? 'high' : 'indeterminate' };
  }
  function fast(lsm, cap, ast) {
    if (!has(lsm, cap, ast) || lsm <= 0 || ast <= 0) return null;
    var p = logistic(-1.65 + 1.07 * Math.log(lsm) + 2.66e-8 * Math.pow(cap, 3) - 63.3 / ast);
    return { value: round(p, 2), band: p <= 0.35 ? 'low' : p >= 0.67 ? 'high' : 'indeterminate' };
  }
  /* LSM bands (EASL 2024 / Baveno VII rule of five) */
  function lsmBand(lsm) {
    if (!has(lsm)) return null;
    var band, text;
    if (lsm < 8) { band = 'low'; text = 'Below 8 kPa: advanced fibrosis unlikely.'; }
    else if (lsm < 12) { band = 'indeterminate'; text = '8 to 12 kPa: grey zone, second test (Agile 3+, ELF or MRE) or specialist review.'; }
    else if (lsm < 15) { band = 'high'; text = '12 kPa or more: advanced fibrosis likely.'; }
    else if (lsm < 20) { band = 'cacld'; text = '15 kPa or more: compensated advanced chronic liver disease (cACLD) likely.'; }
    else if (lsm < 25) { band = 'cacld'; text = '20 kPa or more: cACLD; clinically significant portal hypertension possible (Baveno VII).'; }
    else { band = 'csph'; text = '25 kPa or more: clinically significant portal hypertension likely (Baveno VII).'; }
    return { value: lsm, band: band, text: text };
  }
  function capBand(cap) {
    if (!has(cap)) return null;
    return { value: cap, band: cap >= 275 ? 'high' : cap >= 248 ? 'indeterminate' : 'low',
      text: cap >= 275 ? 'CAP 275 dB/m or more: steatosis likely.' : cap >= 248 ? 'CAP 248 to 274 dB/m: steatosis possible.' : 'CAP below 248 dB/m: steatosis less likely by CAP.' };
  }
  function mreBand(mre) {
    if (!has(mre)) return null;
    return { value: mre, band: mre < 2.5 ? 'low' : mre < 3.63 ? 'indeterminate' : mre < 5 ? 'high' : 'cacld' };
  }
  /* Baveno VII: in cACLD, LSM <20 kPa and platelets ≥150 → screening endoscopy can be avoided */
  function baveno(lsm, plt) {
    if (!has(lsm, plt)) return null;
    if (lsm < 10) return { rule: 'Liver stiffness below 10 kPa: cACLD unlikely.', endoscopy: false };
    if (lsm < 20 && plt >= 150) return { rule: 'LSM <20 kPa and platelets ≥150: screening endoscopy for varices can be avoided (Baveno VII). Repeat yearly.', endoscopy: false };
    return { rule: 'LSM ≥20 kPa or platelets <150: varices screening by endoscopy is indicated, or a non-selective beta-blocker (carvedilol) if clinically significant portal hypertension (Baveno VII).', endoscopy: true };
  }

  /* ---------- cirrhosis severity ---------- */
  function childPugh(biliMg, albGdl, inr, ascites, enceph) {
    if (!has(biliMg, albGdl, inr)) return null;
    var p = 0;
    p += biliMg < 2 ? 1 : biliMg <= 3 ? 2 : 3;
    p += albGdl > 3.5 ? 1 : albGdl >= 2.8 ? 2 : 3;
    p += inr < 1.7 ? 1 : inr <= 2.3 ? 2 : 3;
    p += ascites === 'moderate' || ascites === 'severe' || ascites === 2 ? 3 : ascites === 'mild' || ascites === 1 ? 2 : 1;
    p += enceph >= 3 ? 3 : enceph >= 1 ? 2 : 1;
    return { points: p, cls: p <= 6 ? 'A' : p <= 9 ? 'B' : 'C' };
  }
  /* MELD 3.0 (Kim WR et al. Gastroenterology 2021) */
  function meld3(biliMg, inr, creatMg, na, albGdl, female) {
    if (!has(biliMg, inr, creatMg, na, albGdl)) return null;
    var b = Math.max(biliMg, 1), i = Math.max(inr, 1), c = Math.min(Math.max(creatMg, 1), 3);
    var n = Math.min(Math.max(na, 125), 137), a = Math.min(Math.max(albGdl, 1.5), 3.5);
    var v = 1.33 * (female ? 1 : 0) + 4.56 * Math.log(b) + 0.82 * (137 - n) - 0.24 * (137 - n) * Math.log(b) +
      9.09 * Math.log(i) + 11.14 * Math.log(c) + 1.85 * (3.5 - a) - 1.83 * (3.5 - a) * Math.log(c) + 6;
    return { value: Math.round(v) };
  }
  /* eGFR CKD-EPI 2021 (creatinine, no race) */
  function egfr(creatMg, age, female) {
    if (!has(creatMg, age) || creatMg <= 0) return null;
    var k = female ? 0.7 : 0.9, a = female ? -0.241 : -0.302;
    var r = creatMg / k;
    var v = 142 * Math.pow(Math.min(r, 1), a) * Math.pow(Math.max(r, 1), -1.2) * Math.pow(0.9938, age) * (female ? 1.012 : 1);
    return { value: Math.round(v), stage: v >= 90 ? 'G1' : v >= 60 ? 'G2' : v >= 45 ? 'G3a' : v >= 30 ? 'G3b' : v >= 15 ? 'G4' : 'G5' };
  }

  /* ---------- habits ---------- */
  function auditC(q1, q2, q3, female) {
    if (!has(q1, q2, q3)) return null;
    var s = q1 + q2 + q3;
    return { value: s, positive: female ? s >= 3 : s >= 4 };
  }
  /* grams of alcohol per week → class (Delphi 2023 / EASL 2024) */
  function alcoholClass(gPerWeek, female) {
    if (!has(gPerWeek)) return null;
    var lo = female ? 140 : 210, hi = female ? 350 : 420;
    if (gPerWeek < lo) return { cls: 'within MASLD range', band: 'low', text: 'Less than ' + lo + ' g/week (' + Math.round(lo / 7) + ' g/day): compatible with MASLD.' };
    if (gPerWeek <= hi) return { cls: 'MetALD range', band: 'indeterminate', text: lo + ' to ' + hi + ' g/week: MetALD range (MASLD with increased alcohol intake).' };
    return { cls: 'ALD range', band: 'high', text: 'More than ' + hi + ' g/week: alcohol-related liver disease range.' };
  }
  function packYears(perDay, years) { return has(perDay, years) ? round(perDay / 20 * years, 1) : null; }

  /* ---------- cardiometabolic criteria (MASLD definition, Delphi 2023 / EASL 2024) ----------
     v: { bmi, waist, female, ethnicity('asian'|'other'), glucoseMg, glucose2hMg, hba1c, dm, dmTreated,
          sbp, dbp, htnTreated, tgMg, hdlMg, lipidTreated } */
  function cardiometabolic(v) {
    var met = [], unmet = [], unknown = [];
    var asian = v.ethnicity === 'asian';
    var bmiCut = asian ? 23 : 25, wCut = v.female ? 80 : (asian ? 90 : 94);
    if (has(v.bmi) || has(v.waist)) {
      if ((has(v.bmi) && v.bmi >= bmiCut) || (has(v.waist) && v.waist >= wCut)) met.push('BMI ≥' + bmiCut + ' kg/m² or waist ≥' + wCut + ' cm');
      else unmet.push('Adiposity');
    } else unknown.push('Adiposity (BMI or waist)');
    if (v.dm || v.dmTreated || has(v.glucoseMg) || has(v.hba1c) || has(v.glucose2hMg)) {
      if (v.dm || v.dmTreated || (has(v.glucoseMg) && v.glucoseMg >= 100) || (has(v.hba1c) && v.hba1c >= 5.7) || (has(v.glucose2hMg) && v.glucose2hMg >= 140))
        met.push(v.dm || v.dmTreated ? 'Type 2 diabetes' : 'Fasting glucose ≥100 mg/dL, HbA1c ≥5.7% or 2-h glucose ≥140 mg/dL');
      else unmet.push('Glucose');
    } else unknown.push('Glucose (fasting glucose or HbA1c)');
    if (v.htnTreated || (has(v.sbp) && has(v.dbp))) {
      if (v.htnTreated || v.sbp >= 130 || v.dbp >= 85) met.push(v.htnTreated ? 'Treated hypertension' : 'Blood pressure ≥130/85 mmHg');
      else unmet.push('Blood pressure');
    } else unknown.push('Blood pressure');
    if (v.lipidTreated || has(v.tgMg)) {
      if (v.lipidTreated || v.tgMg >= 150) met.push(v.lipidTreated ? 'Lipid-lowering treatment' : 'Triglycerides ≥150 mg/dL');
      else unmet.push('Triglycerides');
    } else unknown.push('Triglycerides');
    if (v.lipidTreated || has(v.hdlMg)) {
      var hCut = v.female ? 50 : 40;
      if (v.lipidTreated || v.hdlMg <= hCut) met.push(v.lipidTreated ? 'Lipid-lowering treatment (HDL criterion)' : 'HDL ≤' + hCut + ' mg/dL');
      else unmet.push('HDL');
    } else unknown.push('HDL');
    return { count: met.length, met: met, unmet: unmet, unknown: unknown, satisfied: met.length >= 1 };
  }

  return {
    UNITS: UNITS, unitLabel: unitLabel, convert: convert, toBase: toBase, num: num, round: round,
    bmi: bmi, bmiClass: bmiClass, whtr: whtr, whr: whr,
    fib4: fib4, nfs: nfs, apri: apri, elfBand: elfBand, fli: fli, hsi: hsi, homa: homa,
    agile3: agile3, agile4: agile4, fast: fast, lsmBand: lsmBand, capBand: capBand, mreBand: mreBand, baveno: baveno,
    childPugh: childPugh, meld3: meld3, egfr: egfr, auditC: auditC, alcoholClass: alcoholClass, packYears: packYears,
    cardiometabolic: cardiometabolic
  };
});
