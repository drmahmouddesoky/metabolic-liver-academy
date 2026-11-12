const test = require('node:test');
const assert = require('node:assert');
const G = require('../app/registry.js');

const base = { id: 'p1', name: 'A', fileNo: '100', sex: 'male', age: 50, updatedAt: '2026-11-10T10:00:00Z',
  visits: [{ id: 'v1', date: '2026-10-01', updatedAt: '2026-10-01T10:00:00Z', lab_ast: 40 }] };
const clone = (o) => JSON.parse(JSON.stringify(o));

test('merge adds new visits from the other laptop', () => {
  const inc = clone(base); inc.visits.push({ id: 'v2', date: '2026-11-11', updatedAt: '2026-11-11T09:00:00Z' }); inc.updatedAt = '2026-11-11T09:00:00Z';
  const m = G.mergePatient(base, inc);
  assert.strictEqual(m.added, 1); assert.strictEqual(m.patient.visits.length, 2);
});
test('merge keeps the newest edit of the same visit', () => {
  const inc = clone(base); inc.visits[0].lab_ast = 55; inc.visits[0].updatedAt = '2026-11-12T08:00:00Z';
  assert.strictEqual(G.mergePatient(base, inc).patient.visits[0].lab_ast, 55);
  const old = clone(base); old.visits[0].lab_ast = 20; old.visits[0].updatedAt = '2026-09-01T08:00:00Z';
  assert.strictEqual(G.mergePatient(base, old).patient.visits[0].lab_ast, 40);
});
test('same URN on another laptop is the same patient', () => {
  const other = { id: 'zz', fileNo: '100', name: 'A', visits: [] };
  assert.strictEqual(G.findTwin([base], other).id, 'p1');
  assert.strictEqual(G.findTwin([base], { id: 'q', fileNo: '999' }), null);
});
test('registry tables', () => {
  const rows = G.visitRows([base], {});
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0][0], 'URN');
  const idx = G.indexRows([base], {}, () => '100 - A');
  assert.strictEqual(idx[1][G.INDEX_COLS.indexOf('Folder')], '100 - A');
  assert.match(G.toCsv([['a,b', 'c"d']]), /^"a,b","c""d"$/);
});
