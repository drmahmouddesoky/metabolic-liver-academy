/* Fatty Liver Clinic: registry tables and backup merge. Pure functions, used by the window and the main process. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./rules.js'));
  else root.Registry = factory(root.Rules);
})(typeof self !== 'undefined' ? self : this, function (R) {
  'use strict';

  function cell(x) { if (x == null) return ''; var s = String(x); return /[",\n\r;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function toCsv(rows) { return rows.map(function (r) { return r.map(cell).join(','); }).join('\r\n'); }
  function sortVisits(p) { return (p.visits || []).slice().sort(function (a, b) { return String(a.date || '').localeCompare(String(b.date || '')); }); }

  var VISIT_COLS = ['URN', 'Name', 'Sex', 'Age', 'Visit date', 'Visit type', 'Weight kg', 'BMI', 'Waist cm', 'Waist/height', 'SBP', 'DBP', 'Diabetes', 'Hypertension', 'Dyslipidaemia', 'Obesity (history)', 'Smoking', 'Alcohol g/week', 'Alcohol class',
    'AST', 'ALT', 'GGT', 'Platelets', 'Albumin g/dL', 'HbA1c %', 'Glucose mg/dL', 'TG mg/dL', 'HDL mg/dL', 'LDL mg/dL', 'Ferritin', 'HBsAg', 'Anti-HCV',
    'US steatosis', 'LSM kPa', 'CAP', 'MRI-PDFF', 'MRE', 'Biopsy fibrosis', 'FIB-4', 'FIB-4 band', 'NFS', 'APRI', 'Agile 3+', 'Agile 4', 'FAST', 'ELF', 'FLI', 'HOMA-IR', 'eGFR',
    'CM criteria', 'Steatosis', 'Fibrosis level', 'Stage', 'Decompensated', 'MASH', 'Diagnosis (suggested)', 'Diagnosis (final)', 'ICD-10', 'Follow-up months', 'Next visit', 'Patient id', 'Visit id'];

  function visitRows(patients, settings) {
    var rows = [VISIT_COLS];
    patients.forEach(function (p) {
      sortVisits(p).forEach(function (v) {
        var r; try { r = R.evaluate(p, v, settings || {}); } catch (e) { return; }
        var s = r.scores, L = r.labs;
        function b(x) { return x ? x.value : ''; }
        rows.push([p.fileNo, p.name, p.sex, r.age, v.date, v.type, v.ex_wt, r.body.bmi, v.ex_waist, r.body.whtr, v.ex_sbp, v.ex_dbp, v.pm_dm, v.pm_htn, v.pm_lipid, v.pm_obesity, v.hab_smoking, v.hab_alc_g, s.alcohol ? s.alcohol.cls : '',
          L.ast, L.alt, L.ggt, L.plt, L.alb, L.hba1c, L.glu, L.tg, L.hdl, L.ldl, L.ferritin, v.lab_hbsag, v.lab_antihcv,
          v.us_steatosis, v.te_lsm, v.te_cap, v.mri_pdff, v.mri_mre, v.bx_fibrosis, b(s.fib4), s.fib4 ? s.fib4.band : '', b(s.nfs), b(s.apri), b(s.agile3), b(s.agile4), b(s.fast), b(s.elf), b(s.fli), b(s.homa), b(s.egfr),
          r.cm.count, r.steatosis.status, r.fibrosis.level, r.fibrosis.stage, r.fibrosis.decompensated ? 'yes' : 'no', r.mash || '', r.diagnosis.primary, v.dx_final || '', v.dx_codes || r.diagnosis.codes.join(' '), r.followUp.months, v.followup_date || '', p.id, v.id]);
      });
    });
    return rows;
  }

  var INDEX_COLS = ['URN', 'Name', 'Sex', 'Age', 'Phone', 'Visits', 'First visit', 'Last visit', 'Next visit', 'Latest diagnosis', 'Fibrosis', 'Latest FIB-4', 'Latest LSM kPa', 'Latest BMI', 'Folder', 'Patient id'];
  function indexRows(patients, settings, folderOf) {
    var rows = [INDEX_COLS];
    patients.slice().sort(function (a, b) { return String(a.name || '').localeCompare(String(b.name || '')); }).forEach(function (p) {
      var vs = sortVisits(p), last = vs[vs.length - 1], r = null;
      if (last) { try { r = R.evaluate(p, last, settings || {}); } catch (e) { r = null; } }
      var lastFib4 = '', lastLsm = '';
      vs.forEach(function (v) { try { var x = R.evaluate(p, v, settings || {}); if (x.scores.fib4) lastFib4 = x.scores.fib4.value; } catch (e) { /* skip */ } if (v.te_lsm) lastLsm = v.te_lsm; });
      rows.push([p.fileNo, p.name, p.sex, r ? r.age : '', p.phone, vs.length, vs[0] ? vs[0].date : '', last ? last.date : '', last ? last.followup_date || '' : '',
        last ? (last.dx_final || (r ? r.diagnosis.primary : '')) : '', r ? r.fibrosis.label : '', lastFib4, lastLsm, r ? r.body.bmi : '', folderOf ? folderOf(p) : '', p.id]);
    });
    return rows;
  }

  /* merge a patient from another laptop into this one: visits by id, newest edit wins */
  function mergePatient(local, incoming) {
    if (!local) return { patient: incoming, added: (incoming.visits || []).length, updated: 0, isNew: true };
    var out = JSON.parse(JSON.stringify(local)), added = 0, updated = 0;
    var newer = String(incoming.updatedAt || '') > String(local.updatedAt || '');
    if (newer) Object.keys(incoming).forEach(function (k) { if (k !== 'visits' && k !== 'id') out[k] = incoming[k]; });
    var byId = {}; out.visits = out.visits || []; out.visits.forEach(function (v, i) { byId[v.id] = i; });
    (incoming.visits || []).forEach(function (v) {
      if (!(v.id in byId)) { out.visits.push(v); added++; return; }
      var cur = out.visits[byId[v.id]];
      if (String(v.updatedAt || '') > String(cur.updatedAt || '') || (!v.updatedAt && !cur.updatedAt && newer)) { out.visits[byId[v.id]] = v; updated++; }
    });
    out.visits.sort(function (a, b) { return String(a.date || '').localeCompare(String(b.date || '')); });
    if (newer || added || updated) out.updatedAt = [local.updatedAt, incoming.updatedAt].sort().pop();
    return { patient: out, added: added, updated: updated, isNew: false };
  }
  /* find the local twin of an incoming patient: same internal id, or same URN */
  function findTwin(localList, incoming) {
    return localList.filter(function (p) { return p.id === incoming.id; })[0] ||
      (incoming.fileNo ? localList.filter(function (p) { return p.fileNo && String(p.fileNo) === String(incoming.fileNo); })[0] : null) || null;
  }

  return { toCsv: toCsv, visitRows: visitRows, indexRows: indexRows, mergePatient: mergePatient, findTwin: findTwin, VISIT_COLS: VISIT_COLS, INDEX_COLS: INDEX_COLS };
});
