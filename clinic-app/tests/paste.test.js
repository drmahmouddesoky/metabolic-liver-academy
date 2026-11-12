const test = require('node:test');
const assert = require('node:assert');
const E = require('../app/emr.js');
const R = require('../app/rules.js');

const NOTE = '56 y/o M, known T2DM for 8 years on metformin, HTN, dyslipidemia. Non-smoker. No alcohol. Obese. No history of cirrhosis.\n' +
  'BP 140/90, HR 82, Wt 98 kg, Ht 172 cm, waist 108\nAST 45 U/L  ALT 62 U/L  GGT 80\nPlatelets 180  Albumin 42 g/L  T. Bilirubin 15 umol/L\n' +
  'HbA1c 7.6 %  FBS 7.2 mmol/L  TG 2.4 mmol/L  HDL 0.9 LDL 3.6 Creatinine 80 umol/L\nHBsAg negative, Anti-HCV non-reactive\n' +
  'US abdomen: fatty liver grade II, spleen 11 cm\nFibroScan: LSM 9.5 kPa, CAP 310 dB/m\nNo portal hypertension.';
const get = (list, k) => (list.find(x => x.k === k) || {}).value;

test('reads labs and converts SI units to conventional', () => {
  const f = E.parseClinical(NOTE, 'base');
  assert.strictEqual(get(f, 'lab_ast'), 45);
  assert.strictEqual(get(f, 'lab_plt'), 180);
  assert.strictEqual(get(f, 'lab_alb'), 4.2);
  assert.strictEqual(get(f, 'lab_glu'), 130);
  assert.strictEqual(get(f, 'lab_tg'), 213);
  assert.strictEqual(get(f, 'lab_creat'), 0.9);
  assert.strictEqual(get(f, 'te_lsm'), 9.5);
  assert.strictEqual(get(f, 'te_cap'), 310);
  assert.strictEqual(get(f, 'us_steatosis'), '2');
  assert.strictEqual(get(f, 'lab_hbsag'), 'neg');
});
test('keeps SI units when the visit uses SI', () => {
  const f = E.parseClinical('FBS 7.2 mmol/L, TG 2.4, albumin 42 g/L', 'si');
  assert.strictEqual(get(f, 'lab_glu'), 7.2);
  assert.strictEqual(get(f, 'lab_alb'), 42);
});
test('reads conditions and respects negation', () => {
  const f = E.parseClinical(NOTE, 'base');
  assert.strictEqual(get(f, 'pm_dm'), 't2');
  assert.strictEqual(get(f, 'pm_dm_years'), 8);
  assert.strictEqual(get(f, 'pm_htn'), 'yes');
  assert.strictEqual(get(f, 'pm_lipid'), 'yes');
  assert.strictEqual(get(f, 'pm_obesity'), 'yes');
  assert.deepStrictEqual(get(f, 'pm_liver'), ['steatosis']);   // "No history of cirrhosis" ignored
  assert.strictEqual(get(f, 'hab_smoking'), 'never');
  assert.strictEqual(get(f, 'sex'), 'male');
  assert.strictEqual(get(f, 'age'), 56);
  const g = E.parseClinical('Portal hypertension on imaging. Non diabetic.', 'base');
  assert.strictEqual(get(g, 'pm_htn'), undefined);
  assert.strictEqual(get(g, 'pm_dm'), undefined);
});
test('vital signs', () => {
  const f = E.parseClinical(NOTE, 'base');
  assert.deepStrictEqual([get(f, 'ex_sbp'), get(f, 'ex_dbp'), get(f, 'ex_wt'), get(f, 'ex_ht'), get(f, 'ex_waist')], [140, 90, 98, 172, 108]);
});
test('known obesity and known fatty liver count when not measured', () => {
  const p = { name: 'X', sex: 'female', age: 50 };
  const r = R.evaluate(p, { date: '2026-11-12', pm_obesity: 'yes', pm_liver: ['steatosis'] }, {});
  assert.ok(r.cm.met.some(m => /Known obesity/.test(m)));
  assert.strictEqual(r.steatosis.status, 'present');
  assert.match(r.diagnosis.primary, /MASLD/);
  const r2 = R.evaluate(p, { date: '2026-11-12', pm_obesity: 'yes', ex_wt: 55, ex_ht: 165, ex_waist: 70 }, {});
  assert.ok(!r2.cm.met.some(m => /obesity|BMI/i.test(m)), 'measured normal weight wins over history');
});
