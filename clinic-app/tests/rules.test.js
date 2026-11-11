const test = require('node:test');
const assert = require('node:assert');
const R = require('../app/rules.js');
const Rep = require('../app/report.js');

const base = { name: 'A', sex: 'male', dob: '1970-05-01', ethnicity: 'other' };
const visit = (o) => Object.assign({ date: '2026-11-11', units: 'base', hab_alcohol: 'never', lab_hbsag: 'neg', lab_antihcv: 'neg' }, o);

test('obese diabetic with grey-zone stiffness: MASLD, indeterminate, MASH-therapy candidate', () => {
  const r = R.evaluate(base, visit({ pm_dm: 't2', ex_wt: 98, ex_ht: 172, ex_waist: 108, lab_ast: 45, lab_alt: 60, lab_plt: 180, lab_alb: 4.1, lab_tg: 210, lab_hdl: 36, lab_hba1c: 7.4, te_lsm: 9.5, te_cap: 310, us_steatosis: '2' }), {});
  assert.strictEqual(r.age, 56);
  assert.strictEqual(r.cm.count, 4);
  assert.strictEqual(r.steatosis.status, 'present');
  assert.strictEqual(r.fibrosis.level, 'indeterminate');
  assert.match(r.diagnosis.primary, /^MASLD/);
  assert.ok(r.diagnosis.codes.includes('K76.0') && r.diagnosis.codes.includes('E11.9'));
  const rx = r.recommendations.find(g => g.title === 'Pharmacotherapy').items.join(' ');
  assert.match(rx, /resmetirom/);
  assert.strictEqual(r.followUp.months, 6);
});
test('SI units give the same assessment', () => {
  const r1 = R.evaluate(base, visit({ lab_glu: 126, lab_tg: 150, lab_hdl: 40, ex_wt: 80, ex_ht: 170 }), {});
  const r2 = R.evaluate(base, visit({ units: 'si', lab_glu: 7.0, lab_tg: 1.70, lab_hdl: 1.03, ex_wt: 80, ex_ht: 170 }), {});
  assert.strictEqual(r1.cm.count, 4); assert.strictEqual(r2.cm.count, 4);
});
test('cirrhosis with decompensation', () => {
  const r = R.evaluate({ name: 'B', sex: 'female', age: 62 }, visit({ te_lsm: 28, lab_plt: 90, lab_ast: 70, lab_alt: 40, lab_alb: 2.8, lab_tbil: 2.6, lab_inr: 1.7, lab_creat: 1.0, lab_na: 131, ex_ascites_grade: 'moderate', ex_abd_normal: false, us_steatosis: '1', pm_dm: 't2', ex_wt: 90, ex_ht: 160 }), {});
  assert.strictEqual(r.fibrosis.level, 'cirrhosis');
  assert.strictEqual(r.fibrosis.decompensated, true);
  assert.ok(r.scores.childPugh.cls === 'B' || r.scores.childPugh.cls === 'C');
  assert.ok(r.scores.meld.value > 10);
  assert.ok(r.diagnosis.codes.includes('K74.60'));
  const cc = r.recommendations.find(g => g.title === 'Cirrhosis care');
  assert.ok(cc && cc.items.some(t => /every 6 months/.test(t)));
  assert.ok(cc.items.some(t => /transplant/.test(t)));
  assert.strictEqual(r.followUp.months, 1);
});
test('lean patient with low FIB-4 and no steatosis', () => {
  const r = R.evaluate({ name: 'C', sex: 'female', age: 40 }, visit({ ex_wt: 55, ex_ht: 165, lab_ast: 20, lab_alt: 18, lab_plt: 260, lab_glu: 85, lab_tg: 90, lab_hdl: 60, ex_sbp: 110, ex_dbp: 70, us_steatosis: '0' }), {});
  assert.strictEqual(r.steatosis.status, 'absent');
  assert.strictEqual(r.fibrosis.level, 'low');
  assert.strictEqual(r.cm.count, 0);
  assert.match(r.diagnosis.primary, /No hepatic steatosis/);
});
test('alcohol in MetALD range and hepatitis B flag', () => {
  const r = R.evaluate(base, visit({ hab_alcohol: 'current', hab_alc_g: 300, us_steatosis: '2', ex_wt: 95, ex_ht: 175, lab_hbsag: 'pos' }), {});
  assert.match(r.diagnosis.primary, /MetALD/);
  assert.ok(r.otherCauses.some(t => /HBsAg/.test(t)));
});
test('report builds valid HTML with the plan', () => {
  const v = visit({ complaint: 'fat on my liver', reasons: ['steatosis_imaging'], ex_wt: 98, ex_ht: 172, lab_ast: 45, lab_alt: 60, lab_plt: 180, te_lsm: 9.5, us_steatosis: '2', plan_items: [{ group: 'Lifestyle', text: 'Lose 7 kg', on: true }, { group: 'Lifestyle', text: 'hidden', on: false }] });
  const r = R.evaluate(base, v, {});
  const html = Rep.build(base, v, r, { clinicName: 'Fatty liver clinic', doctorName: 'Dr X' });
  assert.match(html, /Fatty liver clinic/);
  assert.match(html, /SNOMED CT 197321007/);
  assert.match(html, /Lose 7 kg/);
  assert.doesNotMatch(html, /hidden/);
  assert.match(html, /FIB-4/);
});
