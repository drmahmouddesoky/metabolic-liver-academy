const test = require('node:test');
const assert = require('node:assert');
const R = require('../app/rules.js');
const E = require('../app/emr.js');

// synthetic patient only
const p = { name: 'Test Patient', sex: 'male', dob: '1970-05-01', fileNo: '00000001' };
const v = { date: '2026-11-12', type: 'initial', units: 'base', complaint: 'fat on my liver', complaint_duration: '3 months',
  reasons: ['steatosis_imaging', 'oedema'], pm_dm: 't2', pm_dm_years: 6, pm_htn: 'yes', dh_meds: [{ drug: 'Metformin', dose: '1 g bd' }],
  dh_allergy: 'none', fh: ['dm'], hab_smoking: 'current', hab_cigs: 20, hab_smoke_years: 20, hab_alcohol: 'never',
  hpi_symptoms: ['fatigue'], hpi_decomp_none: true, ex_general_normal: true, ex_abd_normal: true, ex_sbp: 138, ex_dbp: 88,
  ex_wt: 98, ex_ht: 172, ex_waist: 108, lab_ast: 45, lab_alt: 60, lab_plt: 180, lab_alb: 4.1, lab_hba1c: 7.4, lab_tg: 210, lab_hdl: 36,
  te_lsm: 9.5, te_cap: 310, us_steatosis: '2' };
const T = E.trakcare(p, v, R.evaluate(p, v, {}), { doctorName: 'Dr X' });
const form = (id) => T.forms.find(f => f.id === id);
const field = (f, label) => f.fields.find(x => x.label === label);

test('forms follow the TrakCare Actions Panel order', () => {
  const ids = T.forms.map(f => f.id);
  assert.deepStrictEqual(ids.slice(0, 7), ['rfe', 'allergy', 'pmh', 'psh', 'fh', 'social', 'meds']);
  assert.ok(ids.indexOf('fib4') < ids.indexOf('nfs') && ids.indexOf('nfs') < ids.indexOf('tp'));
  assert.strictEqual(ids[ids.length - 1], 'report');
});
test('reason for encounter: search term, main RFE, onset date from duration, comments', () => {
  const e = form('rfe').entries;
  assert.strictEqual(e.length, 2);
  assert.strictEqual(field(e[0], 'Description (Snomed) translated').value, 'Steatosis of liver');
  assert.ok(field(e[0], 'Main RFE'));
  assert.ok(!field(e[1], 'Main RFE'));
  assert.strictEqual(field(e[0], 'Onset Date').value, '12/08/2026');
  assert.match(field(e[0], 'Comments').value, /fat on my liver/);
  assert.strictEqual(field(e[1], 'Right / Left / Both').value, 'Both');
});
test('past history, allergies and medications', () => {
  assert.ok(field(form('allergy'), 'No known allergies'));
  const pmh = form('pmh').entries.map(e => e.title);
  assert.deepStrictEqual(pmh, ['Type 2 diabetes mellitus', 'Essential hypertension']);
  assert.strictEqual(form('pmh').entries[0].fields.find(x => x.label === 'Onset (approx.)').value, '2020');
  assert.strictEqual(form('meds').entries[0].fields[0].value, 'Metformin');
  assert.match(form('social').entries[0].fields.find(x => x.label === 'Details').value, /20 pack-years/);
});
test('score forms carry the inputs TrakCare asks for', () => {
  assert.deepStrictEqual(form('fib4').fields.map(x => x.value), ['56', '45', '60', '180']);
  assert.match(form('fib4').result, /^FIB-4 1\.81/);
  assert.strictEqual(field(form('nfs'), 'Albumin (g/L)').value, '41');
  assert.strictEqual(field(form('nfs'), 'Impaired fasting glucose / diabetes').value, 'Yes');
});
test('diagnosis and orders', () => {
  const dx = form('dx').entries;
  assert.strictEqual(dx[0].fields[0].value, 'Fatty liver');
  assert.ok(dx.some(e => /Type 2 diabetes/.test(e.title)));
  const ord = form('orders').entries.map(e => e.title);
  assert.ok(ord.includes('Hepatitis B surface antigen') && ord.includes('ELF test'));
  assert.ok(!ord.includes('MR elastography'), 'alternatives: only the first choice is ordered');
});
test('outpatient note contains every part of the sheet once', () => {
  const t = form('note').text;
  ['REASON FOR ENCOUNTER', 'HISTORY OF PRESENT ILLNESS', 'PAST HISTORY', 'EXAMINATION', 'INVESTIGATIONS', 'SCORES', 'ASSESSMENT', 'PLAN'].forEach(h => assert.ok(t.includes(h), h));
  assert.strictEqual((t.match(/Positive: Fatigue/g) || []).length, 1);
  assert.doesNotMatch(t, /\[EASL/);
});
test('copy queue skips tick boxes and empty values', () => {
  const q = E.queue(T);
  assert.ok(q.length > 40);
  assert.ok(q.every(x => x.value !== '' && x.value !== 'Tick'));
  assert.strictEqual(q[0].value, 'Steatosis of liver');
});
test('onset date parsing', () => {
  assert.strictEqual(E.onsetFromText('2 years', '2026-11-12'), '2024-11-12');
  assert.strictEqual(E.onsetFromText('6 weeks', '2026-11-12'), '2026-10-01');
  assert.strictEqual(E.onsetFromText('since 2019', '2026-11-12'), '2019-01-01');
  assert.strictEqual(E.onsetFromText('long time', '2026-11-12'), null);
});
test('TrakCare banner: multi-line and single-line copies', () => {
  const multi = 'Test Patient One\nاختبار مريض\nURN: : 00000001\nEpisode No: OP0000001\nGender: Male\nFull Age: 56Y 4M 11D | DOB: 01/05/1970 [10/07/1389]\nMobile Phone: 0500000000 | Telephone: 0500000000\nHeight: 172 cm | Weight: 98 kg\nBSA: 2.1 | BMI: 33.1\nPayor: Test Payor';
  const b = E.parseBanner(multi);
  assert.deepStrictEqual([b.name, b.fileNo, b.episodeNo, b.sex, b.dob, b.phone, b.height, b.weight, b.insurance],
    ['Test Patient One', '00000001', 'OP0000001', 'male', '1970-05-01', '0500000000', 172, 98, 'Test Payor']);
  const one = E.parseBanner('Jane Sample اختبار URN: 12345 Episode No: OP1 Gender: Female Full Age: 40Y DOB: 09/02/1986 Height: 160 cm | Weight: 70.5 kg Payor: Self');
  assert.deepStrictEqual([one.name, one.fileNo, one.sex, one.dob, one.weight, one.insurance], ['Jane Sample', '12345', 'female', '1986-02-09', 70.5, 'Self']);
});
