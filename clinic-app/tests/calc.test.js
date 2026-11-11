const test = require('node:test');
const assert = require('node:assert');
const C = require('../app/calc.js');

test('FIB-4 known values and cut-offs', () => {
  assert.strictEqual(C.fib4(55, 40, 35, 200).value, 1.86);
  assert.strictEqual(C.fib4(55, 40, 35, 200).band, 'indeterminate');
  assert.strictEqual(C.fib4(50, 20, 25, 250).band, 'low');
  assert.strictEqual(C.fib4(60, 80, 40, 120).band, 'high');
  assert.strictEqual(C.fib4(70, 30, 25, 250).band, 'low');        // 1.68, age-adjusted cut-off 2.0
  assert.strictEqual(C.fib4(64, 30, 25, 250).band, 'indeterminate');
  assert.strictEqual(C.fib4(null, 30, 25, 250), null);
});
test('NFS', () => {
  const r = C.nfs(55, 30, 1, 40, 35, 200, 4.2);
  assert.ok(Math.abs(r.value - 0.07) < 0.01);
  assert.strictEqual(C.nfs(50, 24, 0, 20, 30, 250, 4.5).band, 'low');
  assert.strictEqual(C.nfs(70, 26, 0, 20, 30, 250, 4.5).low, 0.12);
});
test('Agile, FAST and LSM bands', () => {
  assert.strictEqual(C.agile3(5, 25, 30, 250, 0, 1, 45).band, 'low');
  assert.strictEqual(C.agile3(25, 80, 50, 110, 1, 1, 65).band, 'high');
  assert.strictEqual(C.agile4(30, 80, 50, 90, 1, 1).band, 'high');
  assert.strictEqual(C.fast(5, 220, 25).band, 'low');
  assert.strictEqual(C.fast(15, 340, 90).band, 'high');
  assert.strictEqual(C.lsmBand(7.9).band, 'low');
  assert.strictEqual(C.lsmBand(8).band, 'indeterminate');
  assert.strictEqual(C.lsmBand(12).band, 'high');
  assert.strictEqual(C.lsmBand(15).band, 'cacld');
  assert.strictEqual(C.lsmBand(25).band, 'csph');
  assert.strictEqual(C.baveno(18, 160).endoscopy, false);
  assert.strictEqual(C.baveno(18, 140).endoscopy, true);
  assert.strictEqual(C.baveno(22, 200).endoscopy, true);
});
test('steatosis and metabolic scores', () => {
  assert.strictEqual(C.fli(60, 22, 20, 75).band, 'low');
  assert.strictEqual(C.fli(250, 34, 90, 110).band, 'high');
  assert.strictEqual(C.hsi(60, 30, 32, true, true).band, 'high');
  assert.strictEqual(C.homa(90, 10).value, 2.22);
  assert.strictEqual(C.homa(126, 20).band, 'high');
});
test('cirrhosis scores', () => {
  assert.deepStrictEqual(C.childPugh(1, 4, 1.1, 'none', 0), { points: 5, cls: 'A' });
  assert.deepStrictEqual(C.childPugh(2.5, 2.9, 1.8, 'mild', 1), { points: 10, cls: 'C' });
  assert.strictEqual(C.meld3(1, 1, 1, 137, 3.5, false).value, 6);
  assert.strictEqual(C.meld3(2.5, 1.8, 1.1, 133, 2.9, false).value, 20);
  assert.strictEqual(C.egfr(1.0, 55, false).value, 89);
  assert.ok(Math.abs(C.egfr(0.8, 40, true).value - 95.5) < 1);
});
test('units', () => {
  assert.ok(Math.abs(C.convert('glucose', 100, 'base', 'si') - 5.55) < 0.01);
  assert.ok(Math.abs(C.convert('hba1c', 48, 'si', 'base') - 6.5) < 0.05);
  assert.ok(Math.abs(C.convert('hba1c', 7, 'base', 'si') - 53) < 0.5);
  assert.ok(Math.abs(C.convert('bili', 17.1, 'si', 'base') - 1.0) < 0.01);
  assert.strictEqual(C.convert('tg', 150, 'base', 'base'), 150);
});
test('alcohol class and cardiometabolic criteria', () => {
  assert.strictEqual(C.alcoholClass(100, false).band, 'low');
  assert.strictEqual(C.alcoholClass(210, false).band, 'indeterminate');
  assert.strictEqual(C.alcoholClass(140, true).band, 'indeterminate');
  assert.strictEqual(C.alcoholClass(421, false).band, 'high');
  const cm = C.cardiometabolic({ bmi: 24, waist: 95, female: false, glucoseMg: 95, hba1c: 5.5, sbp: 120, dbp: 78, tgMg: 160, hdlMg: 45 });
  assert.strictEqual(cm.count, 2); // waist ≥94 and TG ≥150
  const cm2 = C.cardiometabolic({ bmi: 22, female: true, glucoseMg: 90 });
  assert.strictEqual(cm2.count, 0); assert.strictEqual(cm2.unknown.length, 3);
});
