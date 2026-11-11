/* Fatty Liver Clinic: builds the final medical report as a self-contained HTML document.
   Input: patient, visit, evaluation (Rules.evaluate), settings. Output: HTML string. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./schema.js'), require('./calc.js'));
  else root.Report = factory(root.Schema, root.Calc);
})(typeof self !== 'undefined' ? self : this, function (Schema, C) {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtDate(d) { if (!d) return ''; var x = new Date(d); if (isNaN(x)) return esc(d); return x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  function empty(x) { return x == null || x === '' || (Array.isArray(x) && !x.length); }
  var FM = Schema.fieldMap();

  function fieldValue(fd, v, units) {
    var x = v[fd.k];
    if (empty(x)) return null;
    switch (fd.t) {
      case 'yn': return x === 'yes' ? 'Yes' : x === 'no' ? 'No' : 'Unknown';
      case 'check': return x ? 'Yes' : null;
      case 'select': return Schema.optLabel(fd, x);
      case 'multi': return x.map(function (o) { return Schema.optLabel(fd, o).replace(/ · \d+$/, ''); }).join(', ');
      case 'date': return fmtDate(x);
      case 'lab': return x + ' ' + C.unitLabel(fd.kind, units);
      case 'table': return x.filter(function (r) { return r && Object.keys(r).some(function (k) { return !empty(r[k]); }); }).map(function (r) { return fd.columns.map(function (c) { return r[c[0]]; }).filter(Boolean).join(' – '); }).join('; ') || null;
      default: return String(x);
    }
  }

  /* render a schema section as label/value pairs (skipping empty fields) */
  function renderSection(sec, v, p, units, opts) {
    opts = opts || {};
    var html = '';
    sec.groups.forEach(function (g) {
      if (g.show && !g.show(v, p)) return;
      var rows = [];
      g.fields.forEach(function (fd) {
        if (opts.skip && opts.skip.indexOf(fd.k) >= 0) return;
        if (fd.show && !fd.show(v, p)) return;
        var val = fieldValue(fd, v, units);
        if (val == null) return;
        if (fd.t === 'check') rows.push('<div class="row full"><span class="val">' + esc(fd.label) + '.</span></div>');
        else if (fd.t === 'textarea') rows.push('<div class="row full"><span class="lab">' + esc(fd.label) + '</span><span class="val pre">' + esc(val) + '</span></div>');
        else rows.push('<div class="row"><span class="lab">' + esc(fd.label) + '</span><span class="val">' + esc(val) + '</span></div>');
      });
      if (rows.length) html += '<h3>' + esc(g.title) + '</h3><div class="grid">' + rows.join('') + '</div>';
    });
    return html;
  }

  function flag(k, baseVal, female) {
    var r = Schema.REF[k]; if (!r || baseVal == null) return '';
    var lim = Array.isArray(r) ? r : (female ? r.f : r.m);
    if (lim[0] != null && baseVal < lim[0]) return 'L';
    if (lim[1] != null && baseVal > lim[1]) return 'H';
    return '';
  }

  function labsTable(v, p, units) {
    var sec = Schema.SECTIONS.filter(function (s) { return s.id === 'labs'; })[0];
    var html = '';
    sec.groups.forEach(function (g) {
      if (g.title === 'Sample') return;
      var cells = [];
      g.fields.forEach(function (fd) {
        if (fd.show && !fd.show(v, p)) return;
        var x = v[fd.k]; if (empty(x)) return;
        if (fd.t === 'textarea') { cells.push('<td colspan="4" class="pre">' + esc(x) + '</td>'); return; }
        var val = fieldValue(fd, v, units), fl = '';
        if (fd.t === 'lab' || fd.t === 'number') { var base = fd.kind ? C.toBase(fd.kind, x, units) : C.num(x); fl = flag(fd.k, base, p.sex === 'female'); }
        if (fd.t === 'select' && /pos/.test(String(x))) fl = 'H';
        cells.push('<td class="k">' + esc(fd.label) + '</td><td class="v' + (fl ? ' ' + fl : '') + '">' + esc(val) + (fl ? ' <b>' + fl + '</b>' : '') + '</td>');
      });
      if (!cells.length) return;
      var rows = ''; for (var i = 0; i < cells.length; i += 3) rows += '<tr>' + cells.slice(i, i + 3).join('') + '</tr>';
      html += '<h3>' + esc(g.title) + '</h3><table class="labs">' + rows + '</table>';
    });
    var sample = [];
    if (v.lab_date) sample.push('Date ' + fmtDate(v.lab_date)); if (v.lab_lab) sample.push(v.lab_lab); if (v.lab_fasting === 'yes') sample.push('fasting');
    return (sample.length ? '<p class="muted">' + esc(sample.join(' · ')) + '</p>' : '') + html;
  }

  function scoresTable(R) {
    var S = R.scores, rows = [];
    function row(name, sc, fmt, interp) { if (!sc) return; rows.push('<tr><td>' + name + '</td><td class="num">' + fmt + '</td><td><span class="band ' + esc(sc.band || '') + '">' + esc(interp) + '</span></td></tr>'); }
    var B = { low: 'Low', indeterminate: 'Indeterminate', high: 'High', cacld: 'cACLD likely', csph: 'CSPH likely' };
    if (R.body.bmi != null) rows.push('<tr><td>BMI</td><td class="num">' + R.body.bmi + ' kg/m²</td><td>' + esc(R.body.bmiClass) + '</td></tr>');
    if (R.body.whtr != null) rows.push('<tr><td>Waist-to-height ratio</td><td class="num">' + R.body.whtr + '</td><td>' + (R.body.whtr < 0.5 ? 'Healthy' : R.body.whtr < 0.6 ? 'Increased risk' : 'High risk') + '</td></tr>');
    row('FIB-4', S.fib4, S.fib4 && S.fib4.value, S.fib4 && (B[S.fib4.band] + ' (cut-offs ' + S.fib4.low + ' / 2.67)'));
    row('NAFLD fibrosis score', S.nfs, S.nfs && S.nfs.value, S.nfs && B[S.nfs.band]);
    row('APRI', S.apri, S.apri && S.apri.value, S.apri && B[S.apri.band]);
    row('ELF', S.elf, S.elf && S.elf.value, S.elf && B[S.elf.band]);
    row('Liver stiffness (VCTE)', S.lsm, S.lsm && S.lsm.value + ' kPa', S.lsm && S.lsm.text);
    row('CAP', S.cap, S.cap && S.cap.value + ' dB/m', S.cap && S.cap.text);
    row('Agile 3+ (F3–F4)', S.agile3, S.agile3 && S.agile3.value, S.agile3 && B[S.agile3.band] + ' (0.451 / 0.679)');
    row('Agile 4 (F4)', S.agile4, S.agile4 && S.agile4.value, S.agile4 && B[S.agile4.band] + ' (0.251 / 0.565)');
    row('FAST (at-risk MASH)', S.fast, S.fast && S.fast.value, S.fast && B[S.fast.band] + ' (0.35 / 0.67)');
    row('MR elastography', S.mre, S.mre && S.mre.value + ' kPa', S.mre && B[S.mre.band]);
    row('Fatty Liver Index', S.fli, S.fli && S.fli.value, S.fli && B[S.fli.band] + ' (30 / 60)');
    row('Hepatic Steatosis Index', S.hsi, S.hsi && S.hsi.value, S.hsi && B[S.hsi.band] + ' (30 / 36)');
    row('HOMA-IR', S.homa, S.homa && S.homa.value, S.homa && (S.homa.band === 'high' ? 'Insulin resistance (≥2.5)' : 'No clear insulin resistance'));
    row('eGFR (CKD-EPI 2021)', S.egfr, S.egfr && S.egfr.value + ' mL/min/1.73m²', S.egfr && S.egfr.stage);
    if (S.childPugh) rows.push('<tr><td>Child-Pugh</td><td class="num">' + S.childPugh.points + '</td><td>Class ' + S.childPugh.cls + '</td></tr>');
    if (S.meld) rows.push('<tr><td>MELD 3.0</td><td class="num">' + S.meld.value + '</td><td>' + (S.meld.value >= 15 ? 'Consider transplant referral' : '') + '</td></tr>');
    if (S.alcohol && S.alcohol.cls !== 'none') rows.push('<tr><td>Alcohol</td><td class="num">' + esc(S.alcohol.cls) + '</td><td>' + esc(S.alcohol.text) + '</td></tr>');
    if (S.auditC) rows.push('<tr><td>AUDIT-C</td><td class="num">' + S.auditC.value + '</td><td>' + (S.auditC.positive ? 'Positive screen' : 'Negative screen') + '</td></tr>');
    if (S.packYears != null) rows.push('<tr><td>Smoking</td><td class="num">' + S.packYears + ' pack-years</td><td></td></tr>');
    if (!rows.length) return '<p class="muted">No scores could be calculated yet.</p>';
    var notes = [];
    ['fib4', 'nfs'].forEach(function (k) { if (S[k] && S[k].notes) notes = notes.concat(S[k].notes); });
    return '<table class="scores"><tr><th>Score</th><th>Value</th><th>Interpretation</th></tr>' + rows.join('') + '</table>' + (notes.length ? '<p class="muted">' + esc(notes.join(' ')) + '</p>' : '');
  }

  function build(p, v, R, settings) {
    settings = settings || {};
    var units = v.units || 'base';
    var age = R.age;
    var sec = {}; Schema.SECTIONS.forEach(function (s) { sec[s.id] = s; });
    var head = settings.clinicName || 'Fatty liver clinic';
    var sub = [settings.doctorName, settings.doctorTitle, settings.clinicAddress, settings.clinicPhone].filter(Boolean);

    var planItems = (v.plan_items || []).filter(function (i) { return i.on !== false && i.text; });
    var planHtml;
    if (planItems.length) {
      var groups = {}; var order = [];
      planItems.forEach(function (i) { var g = i.group || 'Plan'; if (!groups[g]) { groups[g] = []; order.push(g); } groups[g].push(i.text); });
      planHtml = order.map(function (g) { return '<h3>' + esc(g) + '</h3><ol>' + groups[g].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>'; }).join('');
    } else {
      planHtml = R.recommendations.map(function (g) { return '<h3>' + esc(g.title) + '</h3><ol>' + g.items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>'; }).join('');
    }

    var reasons = (v.reasons || []).map(function (r) { var m = Schema.REASONS.filter(function (x) { return x[0] === r; })[0]; return m ? m[1] + (m[2] ? ' (SNOMED CT ' + m[2] + ')' : '') : r; });
    if (v.reason_other) reasons.push(v.reason_other);

    var dxFinal = v.dx_final || (R.diagnosis.primary + (R.diagnosis.qualifier ? ', ' + R.diagnosis.qualifier : ''));
    var codes = v.dx_codes || R.diagnosis.codes.join(', ');

    var html = '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(p.name) + ' – report</title><style>' + CSS + '</style></head><body>' +
      '<header class="lh"><div><h1>' + esc(head) + '</h1>' + (sub.length ? '<p>' + sub.map(esc).join(' · ') + '</p>' : '') + '</div>' +
      '<div class="lh-right"><div class="doc-title">Comprehensive MASLD / MASH evaluation</div><div>' + fmtDate(v.date) + (v.type ? ' · ' + esc(Schema.optLabel(FM.type, v.type)) : '') + '</div></div></header>' +

      '<section class="pt"><table class="ptbl"><tr><td><b>' + esc(p.name) + '</b></td><td>' + (age != null ? age + ' years' : '') + '</td><td>' + esc(p.sex === 'female' ? 'Female' : p.sex === 'male' ? 'Male' : '') + '</td><td>File ' + esc(p.fileNo || '—') + '</td><td>' + esc(p.phone || '') + '</td></tr>' +
      '<tr><td>' + esc(p.occupation || '') + '</td><td>' + esc(Schema.optLabel(FM.marital, p.marital) || '') + '</td><td>' + esc(p.residence || '') + '</td><td>' + (p.referrer ? 'Referred by ' + esc(p.referrer) : '') + '</td><td>' + (p.dob ? 'DOB ' + fmtDate(p.dob) : '') + '</td></tr></table></section>' +

      '<section><h2>Reason for encounter</h2>' + (v.complaint ? '<p class="quote">“' + esc(v.complaint) + '”' + (v.complaint_duration ? ' <span class="muted">(' + esc(v.complaint_duration) + ')</span>' : '') + '</p>' : '') +
      (reasons.length ? '<ul class="plain">' + reasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' : '') + '</section>' +

      '<section><h2>History of present illness</h2>' + (renderSection(sec.hpi, v, p, units) || '<p class="muted">Nothing recorded.</p>') + '</section>' +
      '<section><h2>Past, drug and social history</h2>' + (renderSection(sec.past, v, p, units) || '<p class="muted">Nothing recorded.</p>') + '</section>' +
      '<section><h2>Family history</h2>' + (renderSection(sec.family, v, p, units) || '<p class="muted">Nothing relevant recorded.</p>') + '</section>' +
      '<section><h2>Examination</h2>' + (renderSection(sec.exam, v, p, units) || '<p class="muted">Not recorded.</p>') +
      (R.body.bmi != null ? '<p><b>BMI ' + R.body.bmi + ' kg/m²</b> (' + esc(R.body.bmiClass) + ')' + (R.body.whtr != null ? ', waist-to-height ' + R.body.whtr : '') + (R.body.whr != null ? ', waist-to-hip ' + R.body.whr : '') + '</p>' : '') + '</section>' +
      '<section><h2>Investigations</h2>' + (labsTable(v, p, units) || '<p class="muted">No laboratory results recorded.</p>') +
      (renderSection(sec.imaging, v, p, units) ? '<h3 class="sub">Imaging, elastography and histology</h3>' + renderSection(sec.imaging, v, p, units) : '') + '</section>' +
      '<section><h2>Non-invasive scores</h2>' + scoresTable(R) + '</section>' +

      '<section class="assess"><h2>Assessment</h2>' +
      '<p class="dx"><b>Diagnosis:</b> ' + esc(dxFinal) + (codes ? ' <span class="muted">(ICD-10: ' + esc(codes) + ')</span>' : '') + '</p>' +
      (R.mash ? '<p><b>Steatohepatitis:</b> ' + esc(R.mash) + '</p>' : '') +
      '<p><b>Fibrosis:</b> ' + esc(R.fibrosis.label) + (R.fibrosis.stage ? ' (' + esc(R.fibrosis.stage) + ')' : '') + (R.fibrosis.basis.length ? ' <span class="muted">— ' + esc(R.fibrosis.basis.join('; ')) + '</span>' : '') + '</p>' +
      '<p><b>Steatosis:</b> ' + esc(R.steatosis.status) + (R.steatosis.evidence.length ? ' <span class="muted">— ' + esc(R.steatosis.evidence.join('; ')) + '</span>' : '') + (R.steatosis.against.length ? ' <span class="muted">— ' + esc(R.steatosis.against.join('; ')) + '</span>' : '') + '</p>' +
      '<p><b>Cardiometabolic criteria:</b> ' + R.cm.count + ' of 5' + (R.cm.met.length ? ' <span class="muted">— ' + esc(R.cm.met.join('; ')) + '</span>' : '') + (R.cm.unknown.length ? ' <span class="muted">(not assessed: ' + esc(R.cm.unknown.join(', ')) + ')</span>' : '') + '</p>' +
      (R.otherCauses.length ? '<p><b>Other causes to consider:</b></p><ul class="plain">' + R.otherCauses.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      (R.diagnosis.problems.length ? '<p><b>Problem list:</b> ' + esc(R.diagnosis.problems.join('; ')) + '</p>' : '') +
      (v.assessment_text ? '<p class="pre">' + esc(v.assessment_text) + '</p>' : '') + '</section>' +

      '<section class="plan"><h2>Recommendations and plan</h2>' + planHtml +
      (v.plan_text ? '<h3>Additional plan</h3><p class="pre">' + esc(v.plan_text) + '</p>' : '') +
      '<p><b>Follow-up:</b> ' + esc(v.followup_text || R.followUp.text) + (v.followup_date ? ' Next visit: <b>' + fmtDate(v.followup_date) + '</b>.' : '') + '</p></section>' +

      '<footer><div class="sig"><div>' + esc(settings.doctorName || '') + (settings.doctorTitle ? '<br><span class="muted">' + esc(settings.doctorTitle) + '</span>' : '') + '</div><div class="line">Signature</div></div>' +
      '<p class="fine">Scores and suggestions follow published guidelines (EASL–EASD–EASO 2024, AASLD 2023/2024, Baveno VII) and support, but do not replace, clinical judgement. Generated ' + fmtDate(new Date().toISOString()) + ' with the Fatty Liver Clinic application.</p></footer>' +
      '</body></html>';
    return html;
  }

  var CSS = 'body{font:11pt/1.4 "Segoe UI",Helvetica,Arial,sans-serif;color:#1a1a1a;margin:0;padding:18mm 16mm}' +
    'h1{font-size:18pt;margin:0;color:#0b4f6c}h2{font-size:12.5pt;margin:14px 0 6px;padding-bottom:2px;border-bottom:1.5px solid #0b4f6c;color:#0b4f6c}' +
    'h3{font-size:10.5pt;margin:8px 0 3px;color:#333}h3.sub{margin-top:12px}p{margin:3px 0}' +
    '.lh{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px double #0b4f6c;padding-bottom:6px}.lh p{margin:2px 0;color:#444}.lh-right{text-align:right}.doc-title{font-weight:600;font-size:12pt}' +
    '.ptbl{width:100%;border-collapse:collapse;margin:8px 0;background:#f3f7f9}.ptbl td{padding:4px 8px;font-size:10.5pt}' +
    '.grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px}.row{display:flex;gap:6px}.row.full{grid-column:1/-1}.lab{color:#555;min-width:140px;flex:0 0 auto}.lab:after{content:":"}.val{font-weight:500}.pre{white-space:pre-wrap}' +
    'table.labs,table.scores{width:100%;border-collapse:collapse;font-size:10pt;margin:2px 0 6px}table.labs td{padding:2px 6px;border-bottom:1px solid #e5e5e5}table.labs td.k{color:#555;width:19%}table.labs td.v{width:14%;font-weight:500}td.H{color:#b00020}td.L{color:#1a5fb4}' +
    'table.scores th{text-align:left;background:#eef3f6;padding:3px 6px}table.scores td{padding:3px 6px;border-bottom:1px solid #e5e5e5}td.num{white-space:nowrap;font-weight:600}' +
    '.band.low{color:#1b7f3b}.band.indeterminate{color:#b26a00}.band.high,.band.cacld,.band.csph{color:#b00020}' +
    '.quote{font-style:italic}.plain{margin:2px 0 2px 18px;padding:0}.muted{color:#666}.fine{font-size:8.5pt;color:#666;margin-top:10px}' +
    '.assess{background:#f7f9fb;padding:4px 10px 8px;border-left:4px solid #0b4f6c;margin-top:10px}.dx{font-size:11.5pt}' +
    'ol{margin:2px 0 4px 20px;padding:0}ol li{margin:1px 0}' +
    'footer{margin-top:20px}.sig{display:flex;justify-content:space-between;align-items:flex-end;margin-top:30px}.line{border-top:1px solid #333;min-width:200px;text-align:center;padding-top:3px;color:#555}' +
    '@media print{body{padding:0}section{break-inside:auto}h2{break-after:avoid}table{break-inside:auto}tr{break-inside:avoid}}';

  return { build: build, esc: esc, fmtDate: fmtDate, fieldValue: fieldValue, scoresTable: scoresTable };
});
