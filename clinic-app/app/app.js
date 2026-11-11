/* Fatty Liver Clinic: user interface. Schema-driven form, live assessment, report, registry. */
(function () {
  'use strict';
  var S = window.Schema, C = window.Calc, R = window.Rules, Rep = window.Report, Store = window.Store;
  var TABS = [['patient', 'Personal'], ['encounter', 'Complaint'], ['hpi', 'Present illness'], ['past', 'Past & drugs'], ['family', 'Family'],
    ['exam', 'Examination'], ['labs', 'Laboratory'], ['imaging', 'Imaging'], ['assess', 'Assessment & plan'], ['report', 'Report']];
  var HISTORY_SECTIONS = ['past', 'family'];
  var st = { patients: [], p: null, vi: 0, settings: {}, tab: 'patient', filter: '', dirty: false, saveTimer: null };
  var $ = function (s, root) { return (root || document).querySelector(s); };
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') e.className = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (k) { if (k == null) return; e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    return e;
  }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function esc(s) { return Rep.esc(s); }
  function toast(msg, bad) { var t = $('#toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : ''); clearTimeout(t._t); t._t = setTimeout(function () { t.className = ''; }, 2600); }
  function visit() { return st.p ? st.p.visits[st.vi] : null; }

  /* ---------- model ---------- */
  function newVisit(type, prev) {
    var v = { id: uid(), date: today(), type: type || 'initial', units: st.settings.units || 'base', createdAt: new Date().toISOString() };
    S.allFields('visit').forEach(function (fd) { if (fd.t === 'check' && fd.def) v[fd.k] = true; });
    if (prev) {
      S.SECTIONS.forEach(function (sec) {
        if (HISTORY_SECTIONS.indexOf(sec.id) < 0) return;
        sec.groups.forEach(function (g) { g.fields.forEach(function (fd) { if (prev[fd.k] != null) v[fd.k] = JSON.parse(JSON.stringify(prev[fd.k])); }); });
      });
      v.units = prev.units || v.units;
    }
    return v;
  }
  function nextFileNo() {
    var max = 0;
    st.patients.forEach(function (p) { var n = parseInt(String(p.fileNo || '').replace(/\D/g, ''), 10); if (n > max) max = n; });
    return String(max + 1);
  }
  function newPatient() {
    var p = { id: uid(), schemaVersion: 1, fileNo: nextFileNo(), name: '', sex: '', ethnicity: 'other', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), visits: [newVisit('initial')] };
    st.p = p; st.vi = 0; st.tab = 'patient';
    st.patients.push(p);
    save(true);
    renderAll();
    setTimeout(function () { var n = $('[data-k="name"]'); if (n) n.focus(); }, 50);
  }
  function save(now) {
    if (!st.p) return Promise.resolve();
    st.dirty = true; setStatus('Unsaved changes');
    clearTimeout(st.saveTimer);
    var doSave = function () {
      st.p.updatedAt = new Date().toISOString();
      var copy = JSON.parse(JSON.stringify(st.p));
      return Store.savePatient(copy).then(function (r) {
        if (r && r.ok === false) { setStatus('Save failed: ' + (r.error || ''), true); toast('Could not save: ' + (r.error || ''), true); return; }
        st.dirty = false; setStatus('Saved ' + new Date().toLocaleTimeString());
        renderList();
      }).catch(function (e) { setStatus('Save failed', true); toast('Could not save: ' + e.message, true); });
    };
    if (now) return doSave();
    st.saveTimer = setTimeout(doSave, 700);
    return Promise.resolve();
  }
  function setStatus(t, bad) { var s = $('#save-status'); if (s) { s.textContent = t; s.className = bad ? 'bad' : ''; } }

  /* ---------- sidebar ---------- */
  function patientLine(p) {
    var v = p.visits && p.visits[p.visits.length - 1];
    var age = R.ageAt(p, v && v.date);
    return [p.fileNo ? '#' + p.fileNo : null, age != null ? age + ' y' : null, p.sex === 'female' ? 'F' : p.sex === 'male' ? 'M' : null, v && v.date ? 'last ' + Rep.fmtDate(v.date) : null].filter(Boolean).join(' · ');
  }
  function renderList() {
    var box = $('#patients'); box.innerHTML = '';
    var q = st.filter.trim().toLowerCase();
    var list = st.patients.slice().sort(function (a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); })
      .filter(function (p) { return !q || (p.name || '').toLowerCase().indexOf(q) >= 0 || String(p.fileNo || '').indexOf(q) >= 0 || (p.phone || '').indexOf(q) >= 0; });
    $('#count').textContent = list.length + ' of ' + st.patients.length;
    if (!list.length) { box.appendChild(el('p', { class: 'muted pad', text: st.patients.length ? 'No match.' : 'No patients yet. Click "New patient".' })); return; }
    list.forEach(function (p) {
      var summary = '';
      try { var v = p.visits[p.visits.length - 1]; if (v) summary = R.evaluate(p, v, st.settings).summary; } catch (e) { summary = ''; }
      box.appendChild(el('button', { class: 'pt' + (st.p && st.p.id === p.id ? ' active' : ''), onclick: function () { openPatient(p.id); } }, [
        el('b', { text: p.name || '(no name)' }), el('span', { class: 'meta', text: patientLine(p) }), el('span', { class: 'sum', text: summary })]));
    });
  }
  function openPatient(id) {
    if (st.p && st.dirty) save(true);
    Store.getPatient(id).then(function (p) {
      if (!p) { toast('Could not open this patient', true); return; }
      if (!p.visits || !p.visits.length) p.visits = [newVisit('initial')];
      st.p = p; st.vi = p.visits.length - 1; st.tab = 'patient';
      var i = st.patients.findIndex(function (x) { return x.id === p.id; }); if (i >= 0) st.patients[i] = p; else st.patients.push(p);
      renderAll();
    });
  }

  /* ---------- main ---------- */
  function renderAll() { renderList(); renderHeader(); renderTabs(); renderSection(); renderSummary(); }
  function renderHeader() {
    var h = $('#ph'); h.innerHTML = '';
    if (!st.p) { $('#main').hidden = true; $('#welcome').hidden = false; return; }
    $('#main').hidden = false; $('#welcome').hidden = true;
    var p = st.p, v = visit(), age = R.ageAt(p, v.date);
    var sel = el('select', { id: 'visit-sel', onchange: function () { st.vi = +this.value; st.tab = st.tab === 'patient' ? 'encounter' : st.tab; renderHeader(); renderTabs(); renderSection(); renderSummary(); } });
    p.visits.forEach(function (x, i) { sel.appendChild(el('option', { value: i, text: (i + 1) + '. ' + Rep.fmtDate(x.date) + ' · ' + (S.optLabel(S.fieldMap().type, x.type) || x.type), selected: i === st.vi ? '' : null })); });
    h.appendChild(el('div', { class: 'who' }, [el('h2', { text: p.name || 'New patient' }), el('span', { class: 'meta', text: [p.fileNo ? 'File ' + p.fileNo : null, age != null ? age + ' years' : null, p.sex === 'female' ? 'Female' : p.sex === 'male' ? 'Male' : null].filter(Boolean).join(' · ') })]));
    h.appendChild(el('div', { class: 'visits' }, [el('label', { text: 'Visit ' }), sel,
      el('button', { class: 'btn', onclick: addVisit, text: '+ New visit' }),
      el('button', { class: 'btn ghost', onclick: deleteVisit, text: 'Delete visit' }),
      el('button', { class: 'btn ghost danger', onclick: deletePatient, text: 'Delete patient' }),
      el('span', { id: 'save-status', class: '' })]));
  }
  function addVisit() {
    var prev = visit();
    if (st.dirty) save(true);
    st.p.visits.push(newVisit('followup', prev));
    st.vi = st.p.visits.length - 1; st.tab = 'encounter';
    save(); renderAll(); toast('Follow-up visit created; history copied from the previous visit.');
  }
  function deleteVisit() {
    if (st.p.visits.length <= 1) { toast('A patient needs at least one visit. Delete the patient instead.', true); return; }
    if (!confirm('Delete this visit? This cannot be undone.')) return;
    st.p.visits.splice(st.vi, 1); st.vi = Math.max(0, st.vi - 1); save(true); renderAll();
  }
  function deletePatient() {
    if (!confirm('Delete ' + (st.p.name || 'this patient') + ' and all visits? The file is moved to the trash folder inside the data folder.')) return;
    var id = st.p.id;
    Store.deletePatient(id).then(function () { st.patients = st.patients.filter(function (x) { return x.id !== id; }); st.p = null; renderAll(); toast('Patient deleted'); });
  }
  function renderTabs() {
    var t = $('#tabs'); t.innerHTML = '';
    TABS.forEach(function (x) { t.appendChild(el('button', { class: 'tab' + (st.tab === x[0] ? ' active' : ''), onclick: function () { st.tab = x[0]; renderTabs(); renderSection(); }, text: x[1] })); });
  }

  /* ---------- schema-driven form ---------- */
  var rendered = []; // [{fd, wrap, data}]
  function renderSection() {
    var m = $('#section'); m.innerHTML = ''; rendered = [];
    if (!st.p) return;
    if (st.tab === 'assess') return renderAssess(m);
    if (st.tab === 'report') return renderReport(m);
    var sec = S.SECTIONS.filter(function (s) { return s.id === st.tab; })[0];
    var data = sec.level === 'patient' ? st.p : visit();
    if (sec.id === 'labs') m.appendChild(unitsBar());
    sec.groups.forEach(function (g) {
      var card = el('section', { class: 'card' }, [el('h3', { text: g.title })]);
      var grid = el('div', { class: 'fields' });
      g.fields.forEach(function (fd) { var w = buildField(fd, data); grid.appendChild(w); rendered.push({ fd: fd, wrap: w, data: data, group: g, card: card }); });
      card.appendChild(grid); m.appendChild(card);
    });
    updateVisibility();
  }
  function unitsBar() {
    var v = visit();
    function sw(u) {
      if (v.units === u) return;
      var ent = v.labs_entered || {};
      S.allFields('visit').forEach(function (fd) {
        if (fd.t !== 'lab' || !fd.kind || v[fd.k] == null || v[fd.k] === '') return;
        var e = ent[fd.k];
        if (e && e.units === u) { v[fd.k] = e.value; return; }               // back to the units it was typed in: exact
        var from = e ? e.units : (v.units || 'base'), val = e ? e.value : v[fd.k];
        var x = C.convert(fd.kind, val, from, u);
        v[fd.k] = x == null ? v[fd.k] : C.round(x, u === 'si' ? 2 : (fd.kind === 'enzyme' || fd.kind === 'plt' || fd.kind === 'wbc' || fd.kind === 'ferritin' || fd.kind === 'glucose' || fd.kind === 'chol' || fd.kind === 'tg' ? 0 : 2));
      });
      v.units = u; save(); renderSection(); renderSummary();
    }
    return el('div', { class: 'unitsbar' }, [el('span', { text: 'Units: ' }),
      el('button', { class: 'btn small' + (v.units !== 'si' ? ' on' : ''), onclick: function () { sw('base'); }, text: 'Conventional (mg/dL)' }),
      el('button', { class: 'btn small' + (v.units === 'si' ? ' on' : ''), onclick: function () { sw('si'); }, text: 'SI (mmol/L)' }),
      el('span', { class: 'muted', text: ' Switching converts the values already entered. Flags: H above and L below the reference range.' })]);
  }
  function labFlag(fd, v) {
    var x = C.num(v[fd.k]); if (x == null) return '';
    var base = fd.kind ? C.toBase(fd.kind, x, v.units || 'base') : x;
    var r = S.REF[fd.k]; if (!r) return '';
    var lim = Array.isArray(r) ? r : (st.p.sex === 'female' ? r.f : r.m);
    if (lim[0] != null && base < lim[0]) return 'L'; if (lim[1] != null && base > lim[1]) return 'H'; return '';
  }
  function buildField(fd, data) {
    var wrap = el('div', { class: 'f c' + (fd.cols || 1) + ' t-' + fd.t });
    var id = 'f-' + fd.k;
    var label = el('label', { for: id, text: fd.label + (fd.req ? ' *' : '') });
    var input, v = data[fd.k];
    function set(val) { data[fd.k] = val; afterChange(fd); }
    switch (fd.t) {
      case 'textarea':
        input = el('textarea', { id: id, rows: fd.rows || 3, placeholder: fd.ph || '', 'data-k': fd.k, oninput: function () { set(this.value); } }); input.value = v || ''; break;
      case 'number':
        input = el('input', { id: id, type: 'number', step: fd.step || 'any', placeholder: fd.ph || '', 'data-k': fd.k, oninput: function () { set(this.value === '' ? '' : this.value); } }); input.value = v == null ? '' : v; break;
      case 'lab':
        var unitLbl = el('span', { class: 'unit', text: C.unitLabel(fd.kind, data.units || 'base') });
        var flagEl = el('span', { class: 'flag', text: labFlag(fd, data) });
        input = el('input', { id: id, type: 'number', step: 'any', 'data-k': fd.k, oninput: function () {
          if (!data.labs_entered) data.labs_entered = {};
          if (this.value === '') delete data.labs_entered[fd.k]; else data.labs_entered[fd.k] = { value: this.value, units: data.units || 'base' };
          set(this.value === '' ? '' : this.value); flagEl.textContent = labFlag(fd, data); flagEl.className = 'flag ' + flagEl.textContent; } });
        input.value = v == null ? '' : v; flagEl.className = 'flag ' + flagEl.textContent;
        wrap.appendChild(label); wrap.appendChild(el('div', { class: 'labrow' }, [input, unitLbl, flagEl])); return wrap;
      case 'date':
        input = el('input', { id: id, type: 'date', 'data-k': fd.k, onchange: function () { set(this.value); } }); input.value = v || ''; break;
      case 'select': case 'yn':
        input = el('select', { id: id, 'data-k': fd.k, onchange: function () { set(this.value); } });
        input.appendChild(el('option', { value: '', text: fd.t === 'yn' ? 'Not asked' : '—' }));
        (fd.t === 'yn' ? [['yes', 'Yes'], ['no', 'No'], ['unknown', 'Unknown']] : fd.opts).forEach(function (o) { input.appendChild(el('option', { value: o[0], text: o[1] })); });
        input.value = v == null ? '' : String(v); break;
      case 'check':
        input = el('input', { id: id, type: 'checkbox', 'data-k': fd.k, onchange: function () { set(this.checked); } }); input.checked = !!v;
        wrap.appendChild(el('label', { class: 'chk', for: id }, [input, ' ' + fd.label])); return wrap;
      case 'multi':
        var box = el('div', { class: 'multi', 'data-k': fd.k });
        var cur = Array.isArray(v) ? v.slice() : [];
        fd.opts.forEach(function (o) {
          var cb = el('input', { type: 'checkbox', value: o[0], onchange: function () { if (this.checked) { if (cur.indexOf(o[0]) < 0) cur.push(o[0]); } else cur = cur.filter(function (x) { return x !== o[0]; }); set(cur.slice()); } });
          cb.checked = cur.indexOf(o[0]) >= 0;
          box.appendChild(el('label', { class: 'chk' }, [cb, ' ' + o[1]]));
        });
        wrap.appendChild(label); wrap.appendChild(box); return wrap;
      case 'table':
        wrap.appendChild(label); wrap.appendChild(buildTable(fd, data)); return wrap;
      default:
        input = el('input', { id: id, type: 'text', placeholder: fd.ph || '', 'data-k': fd.k, oninput: function () { set(this.value); } }); input.value = v || '';
    }
    wrap.appendChild(label); wrap.appendChild(input);
    if (fd.help) wrap.appendChild(el('small', { class: 'muted', text: fd.help }));
    return wrap;
  }
  function buildTable(fd, data) {
    var rows = Array.isArray(data[fd.k]) ? data[fd.k] : (data[fd.k] = []);
    var t = el('table', { class: 'rows' });
    function draw() {
      t.innerHTML = '';
      t.appendChild(el('tr', null, fd.columns.map(function (c) { return el('th', { text: c[1] }); }).concat([el('th')])));
      rows.forEach(function (r, i) {
        t.appendChild(el('tr', null, fd.columns.map(function (c) {
          var inp = el('input', { type: 'text', value: r[c[0]] || '', oninput: function () { r[c[0]] = this.value; afterChange(fd); } });
          return el('td', null, [inp]);
        }).concat([el('td', null, [el('button', { class: 'btn tiny ghost', text: '×', title: 'Remove', onclick: function () { rows.splice(i, 1); afterChange(fd); draw(); } })])])));
      });
      var add = el('tr', null, [el('td', { colspan: fd.columns.length + 1 }, [el('button', { class: 'btn tiny', text: '+ Add row', onclick: function () { rows.push({}); draw(); var last = t.querySelector('tr:nth-last-child(2) input'); if (last) last.focus(); } })])]);
      t.appendChild(add);
    }
    draw(); return t;
  }
  function afterChange(fd) {
    updateVisibility();
    if (fd.k === 'name' || fd.k === 'fileNo' || fd.k === 'sex' || fd.k === 'dob' || fd.k === 'age' || fd.k === 'date' || fd.k === 'type') renderHeader();
    save(); renderSummary();
  }
  function updateVisibility() {
    rendered.forEach(function (r) {
      var show = !(r.fd.show && !r.fd.show(r.data, st.p));
      if (r.group.show && !r.group.show(r.data, st.p)) { r.card.hidden = true; return; } else r.card.hidden = false;
      r.wrap.hidden = !show;
    });
  }

  /* ---------- live summary ---------- */
  function evaluate() { try { return R.evaluate(st.p, visit(), st.settings); } catch (e) { console.error(e); return null; } }
  function chip(label, val, band) { return el('div', { class: 'chip ' + (band || '') }, [el('span', { class: 'k', text: label }), el('b', { text: val })]); }
  function renderSummary() {
    var box = $('#summary'); box.innerHTML = '';
    if (!st.p) return;
    var r = evaluate(); if (!r) return;
    var s = r.scores;
    box.appendChild(el('h3', { text: 'Live assessment' }));
    if (r.body.bmi != null) box.appendChild(chip('BMI', r.body.bmi + ' · ' + r.body.bmiClass, r.body.bmi < 25 ? 'low' : r.body.bmi < 30 ? 'indeterminate' : 'high'));
    box.appendChild(chip('Cardiometabolic criteria', r.cm.count + ' / 5' + (r.cm.unknown.length ? ' (' + r.cm.unknown.length + ' unknown)' : ''), r.cm.count ? 'high' : 'low'));
    box.appendChild(chip('Steatosis', r.steatosis.status, r.steatosis.status === 'present' ? 'high' : r.steatosis.status === 'absent' ? 'low' : ''));
    if (s.fib4) box.appendChild(chip('FIB-4', s.fib4.value + ' · ' + s.fib4.band, s.fib4.band));
    if (s.nfs) box.appendChild(chip('NFS', s.nfs.value + ' · ' + s.nfs.band, s.nfs.band));
    if (s.lsm) box.appendChild(chip('Stiffness', s.lsm.value + ' kPa', s.lsm.band));
    if (s.cap) box.appendChild(chip('CAP', s.cap.value + ' dB/m', s.cap.band));
    if (s.agile3) box.appendChild(chip('Agile 3+', s.agile3.value + ' · ' + s.agile3.band, s.agile3.band));
    if (s.agile4) box.appendChild(chip('Agile 4', s.agile4.value + ' · ' + s.agile4.band, s.agile4.band));
    if (s.fast) box.appendChild(chip('FAST', s.fast.value + ' · ' + s.fast.band, s.fast.band));
    if (s.elf) box.appendChild(chip('ELF', s.elf.value + ' · ' + s.elf.band, s.elf.band));
    if (s.homa) box.appendChild(chip('HOMA-IR', s.homa.value, s.homa.band));
    if (s.alcohol && s.alcohol.cls !== 'none') box.appendChild(chip('Alcohol', s.alcohol.cls, s.alcohol.band));
    if (s.childPugh) box.appendChild(chip('Child-Pugh', s.childPugh.cls + ' (' + s.childPugh.points + ')', s.childPugh.cls === 'A' ? 'indeterminate' : 'high'));
    if (s.meld) box.appendChild(chip('MELD 3.0', s.meld.value, s.meld.value >= 15 ? 'high' : 'indeterminate'));
    box.appendChild(el('div', { class: 'fibrosis ' + r.fibrosis.level }, [el('b', { text: r.fibrosis.label }), el('span', { text: r.fibrosis.basis.join('; ') })]));
    box.appendChild(el('div', { class: 'dx' }, [el('b', { text: r.diagnosis.primary }), r.diagnosis.qualifier ? el('span', { text: r.diagnosis.qualifier }) : null]));
    if (r.otherCauses.length) box.appendChild(el('div', { class: 'warn' }, [el('b', { text: 'Check other causes' }), el('span', { text: r.otherCauses.length + ' flag(s), see Assessment' })]));
  }

  /* ---------- assessment and plan ---------- */
  function renderAssess(m) {
    var v = visit(), r = evaluate(); if (!r) return;
    var FM = S.fieldMap();
    var dxSuggested = r.diagnosis.primary + (r.diagnosis.qualifier ? ', ' + r.diagnosis.qualifier : '');
    var c1 = el('section', { class: 'card' }, [el('h3', { text: 'Suggested assessment' }),
      el('p', { html: '<b>Diagnosis:</b> ' + esc(dxSuggested) + ' <span class="muted">(ICD-10: ' + esc(r.diagnosis.codes.join(', ')) + ')</span>' }),
      r.mash ? el('p', { html: '<b>Steatohepatitis:</b> ' + esc(r.mash) }) : null,
      el('p', { html: '<b>Fibrosis:</b> <span class="band ' + r.fibrosis.level + '">' + esc(r.fibrosis.label) + '</span>' + (r.fibrosis.stage ? ' (' + esc(r.fibrosis.stage) + ')' : '') + (r.fibrosis.basis.length ? ' <span class="muted">— ' + esc(r.fibrosis.basis.join('; ')) + '</span>' : '') }),
      el('p', { html: '<b>Steatosis:</b> ' + esc(r.steatosis.status) + (r.steatosis.evidence.length ? ' <span class="muted">— ' + esc(r.steatosis.evidence.join('; ')) + '</span>' : '') + (r.steatosis.against.length ? ' <span class="muted">— ' + esc(r.steatosis.against.join('; ')) + '</span>' : '') }),
      el('p', { html: '<b>Cardiometabolic criteria:</b> ' + r.cm.count + ' of 5' + (r.cm.met.length ? ' <span class="muted">— ' + esc(r.cm.met.join('; ')) + '</span>' : '') + (r.cm.unknown.length ? ' <span class="muted">(not assessed: ' + esc(r.cm.unknown.join(', ')) + ')</span>' : '') }),
      r.otherCauses.length ? el('div', null, [el('p', { html: '<b>Other causes to consider</b>' }), el('ul', { html: r.otherCauses.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') })]) : null,
      r.diagnosis.problems.length ? el('p', { html: '<b>Problem list:</b> ' + esc(r.diagnosis.problems.join('; ')) }) : null,
      el('details', null, [el('summary', { text: 'Scores' }), el('div', { html: Rep.scoresTable(r) })])]);
    m.appendChild(c1);

    var c2 = el('section', { class: 'card' }, [el('h3', { text: 'Final diagnosis (editable)' })]);
    var g = el('div', { class: 'fields' });
    g.appendChild(fieldFree('dx_final', 'textarea', 'Diagnosis as it will appear in the report', v, { cols: 3, rows: 2, ph: dxSuggested }));
    g.appendChild(fieldFree('dx_codes', 'text', 'ICD-10 codes', v, { cols: 1, ph: r.diagnosis.codes.join(', ') }));
    g.appendChild(fieldFree('assessment_text', 'textarea', 'Clinical reasoning / comment', v, { cols: 4, rows: 3 }));
    c2.appendChild(g); m.appendChild(c2);

    var c3 = el('section', { class: 'card' }, [el('h3', { text: 'Recommendations and plan' }),
      el('p', { class: 'muted', text: 'Generated from the assessment. Untick what you do not want in the report, edit the wording, add your own items. Items in brackets cite the guideline.' })]);
    var list = el('div', { class: 'plan' });
    if (!v.plan_items || !v.plan_items.length) v.plan_items = flatten(r.recommendations);
    function drawPlan() {
      list.innerHTML = '';
      var lastGroup = null;
      v.plan_items.forEach(function (it, i) {
        if (it.group !== lastGroup) { list.appendChild(el('h4', { text: it.group || 'Plan' })); lastGroup = it.group; }
        var cb = el('input', { type: 'checkbox', onchange: function () { it.on = this.checked; save(); } }); cb.checked = it.on !== false;
        var ta = el('textarea', { rows: 1, oninput: function () { it.text = this.value; autosize(this); save(); } }); ta.value = it.text;
        list.appendChild(el('div', { class: 'item' + (it.on === false ? ' off' : '') }, [cb, ta, el('button', { class: 'btn tiny ghost', text: '×', title: 'Remove', onclick: function () { v.plan_items.splice(i, 1); save(); drawPlan(); } })]));
        setTimeout(function () { autosize(ta); }, 0);
      });
    }
    drawPlan();
    c3.appendChild(list);
    c3.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn', text: '+ Add item', onclick: function () { var grp = prompt('Group (e.g. Investigations, Lifestyle, Pharmacotherapy, Plan):', 'Plan') || 'Plan'; v.plan_items.push({ group: grp, text: '', on: true }); save(); drawPlan(); var tas = list.querySelectorAll('textarea'); tas[tas.length - 1].focus(); } }),
      el('button', { class: 'btn ghost', text: 'Regenerate from assessment', onclick: function () { if (confirm('Replace the list with freshly generated recommendations? Your edits will be lost.')) { v.plan_items = flatten(evaluate().recommendations); save(); drawPlan(); } } })]));
    m.appendChild(c3);

    var c4 = el('section', { class: 'card' }, [el('h3', { text: 'Additional plan and follow-up' })]);
    var g4 = el('div', { class: 'fields' });
    g4.appendChild(fieldFree('plan_text', 'textarea', 'Additional plan (prescriptions, instructions)', v, { cols: 4, rows: 3 }));
    g4.appendChild(fieldFree('followup_text', 'text', 'Follow-up', v, { cols: 3, ph: r.followUp.text }));
    var sug = new Date(v.date || today()); sug.setMonth(sug.getMonth() + r.followUp.months);
    g4.appendChild(fieldFree('followup_date', 'date', 'Next visit date (suggested ' + Rep.fmtDate(sug) + ')', v, { cols: 1 }));
    c4.appendChild(g4); m.appendChild(c4);
  }
  function flatten(groups) { var out = []; groups.forEach(function (g) { g.items.forEach(function (t) { out.push({ group: g.title, text: t, on: true }); }); }); return out; }
  function autosize(ta) { ta.style.height = 'auto'; ta.style.height = (ta.scrollHeight + 2) + 'px'; }
  function fieldFree(k, t, label, data, extra) { var fd = { k: k, t: t, label: label }; for (var x in extra) fd[x] = extra[x]; return buildField(fd, data); }

  /* ---------- report ---------- */
  function reportName() { var p = st.p, v = visit(); return [p.fileNo ? 'File' + p.fileNo : null, p.name, v.date].filter(Boolean).join(' - '); }
  function renderReport(m) {
    var r = evaluate(); if (!r) return;
    var html = Rep.build(st.p, visit(), r, st.settings);
    var bar = el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', text: 'Export PDF', onclick: function () { Store.exportPdf(html, reportName()).then(function (x) { if (x && x.ok) toast('PDF saved' + (x.file ? ': ' + x.file : '')); else if (x && x.error) toast(x.error, true); }); } }),
      el('button', { class: 'btn', text: 'Print', onclick: function () { Store.printHtml(html); } }),
      el('button', { class: 'btn ghost', text: 'Copy report text', onclick: function () { var d = document.createElement('div'); d.innerHTML = html; navigator.clipboard.writeText(d.innerText).then(function () { toast('Copied'); }); } }),
      el('span', { class: 'muted', text: 'Letterhead and signature come from Settings.' })]);
    m.appendChild(bar);
    var fr = el('iframe', { class: 'preview', title: 'Report preview' });
    m.appendChild(fr);
    fr.srcdoc = html;
  }

  /* ---------- registry export ---------- */
  function csvCell(x) { if (x == null) return ''; var s = String(x); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function exportRegistry() {
    var cols = ['File no', 'Name', 'Sex', 'Age', 'Visit date', 'Visit type', 'Weight kg', 'BMI', 'Waist cm', 'Waist/height', 'SBP', 'DBP', 'Diabetes', 'Hypertension', 'Dyslipidaemia', 'Smoking', 'Alcohol g/week', 'Alcohol class',
      'AST', 'ALT', 'GGT', 'Platelets', 'Albumin g/dL', 'HbA1c %', 'Glucose mg/dL', 'TG mg/dL', 'HDL mg/dL', 'LDL mg/dL', 'Ferritin', 'HBsAg', 'Anti-HCV',
      'US steatosis', 'LSM kPa', 'CAP', 'MRI-PDFF', 'MRE', 'Biopsy fibrosis', 'FIB-4', 'FIB-4 band', 'NFS', 'APRI', 'Agile 3+', 'Agile 4', 'FAST', 'ELF', 'FLI', 'HOMA-IR', 'eGFR',
      'CM criteria', 'Steatosis', 'Fibrosis level', 'Stage', 'Decompensated', 'MASH', 'Diagnosis (suggested)', 'Diagnosis (final)', 'ICD-10', 'Follow-up months', 'Patient id', 'Visit id'];
    var lines = [cols.map(csvCell).join(',')];
    var n = 0;
    st.patients.forEach(function (p) {
      (p.visits || []).forEach(function (v) {
        var r; try { r = R.evaluate(p, v, st.settings); } catch (e) { return; }
        var s = r.scores, L = r.labs;
        function b(x) { return x ? x.value : ''; }
        var row = [p.fileNo, p.name, p.sex, r.age, v.date, v.type, v.ex_wt, r.body.bmi, v.ex_waist, r.body.whtr, v.ex_sbp, v.ex_dbp, v.pm_dm, v.pm_htn, v.pm_lipid, v.hab_smoking, v.hab_alc_g, s.alcohol ? s.alcohol.cls : '',
          L.ast, L.alt, L.ggt, L.plt, L.alb, L.hba1c, L.glu, L.tg, L.hdl, L.ldl, L.ferritin, v.lab_hbsag, v.lab_antihcv,
          v.us_steatosis, v.te_lsm, v.te_cap, v.mri_pdff, v.mri_mre, v.bx_fibrosis, b(s.fib4), s.fib4 ? s.fib4.band : '', b(s.nfs), b(s.apri), b(s.agile3), b(s.agile4), b(s.fast), b(s.elf), b(s.fli), b(s.homa), b(s.egfr),
          r.cm.count, r.steatosis.status, r.fibrosis.level, r.fibrosis.stage, r.fibrosis.decompensated ? 'yes' : 'no', r.mash || '', r.diagnosis.primary, v.dx_final || '', v.dx_codes || r.diagnosis.codes.join(' '), r.followUp.months, p.id, v.id];
        lines.push(row.map(csvCell).join(',')); n++;
      });
    });
    Store.exportCsv(lines.join('\r\n'), 'MASLD registry ' + today()).then(function (x) { if (x && x.ok) toast('Registry exported: ' + n + ' visit rows'); });
  }

  /* ---------- settings ---------- */
  function openSettings() {
    var s = st.settings, d = $('#settings'); d.innerHTML = '';
    var fields = [['clinicName', 'Clinic name (report header)'], ['doctorName', 'Doctor name'], ['doctorTitle', 'Title / qualifications'], ['clinicAddress', 'Address'], ['clinicPhone', 'Phone / email'], ['astUln', 'Laboratory AST upper limit of normal (U/L), for APRI']];
    var form = el('form', { class: 'fields', onsubmit: function (e) { e.preventDefault(); fields.forEach(function (f) { s[f[0]] = $('#s-' + f[0]).value; }); s.units = $('#s-units').value; Store.saveSettings(s).then(function (x) { st.settings = Object.assign({}, s, x && x.dataDir ? { dataDir: x.dataDir } : {}); d.close(); toast('Settings saved'); renderSummary(); if (st.tab === 'report') renderSection(); }); } });
    fields.forEach(function (f) { form.appendChild(el('div', { class: 'f c4' }, [el('label', { text: f[1] }), el('input', { id: 's-' + f[0], type: 'text', value: s[f[0]] || (f[0] === 'clinicName' ? 'Fatty liver clinic' : f[0] === 'astUln' ? '40' : '') })])); });
    var us = el('select', { id: 's-units' }); [['base', 'Conventional (mg/dL)'], ['si', 'SI (mmol/L)']].forEach(function (o) { us.appendChild(el('option', { value: o[0], text: o[1], selected: (s.units || 'base') === o[0] ? '' : null })); });
    form.appendChild(el('div', { class: 'f c4' }, [el('label', { text: 'Default units for new visits' }), us]));
    form.appendChild(el('div', { class: 'f c4' }, [el('label', { text: 'Data folder (one JSON file per patient, reports and exports)' }), el('div', { class: 'row' }, [el('code', { text: s.dataDir || (Store.kind === 'browser' ? 'browser storage (no folder in browser mode)' : '') }),
      el('button', { class: 'btn small', type: 'button', text: 'Change folder', onclick: function () { Store.chooseFolder().then(function (x) { if (x && x.ok) { st.settings.dataDir = x.dataDir; d.close(); reload(); toast('Data folder changed'); } else if (x && x.error) toast(x.error, true); }); } }),
      el('button', { class: 'btn small ghost', type: 'button', text: 'Open folder', onclick: function () { Store.openFolder(); } })])]));
    form.appendChild(el('div', { class: 'row end' }, [el('button', { class: 'btn ghost', type: 'button', text: 'Cancel', onclick: function () { d.close(); } }), el('button', { class: 'btn primary', type: 'submit', text: 'Save settings' })]));
    d.appendChild(el('h3', { text: 'Settings' })); d.appendChild(form); d.showModal();
  }

  /* ---------- boot ---------- */
  function reload() { return Store.listPatients().then(function (list) { st.patients = list.filter(function (p) { return !p.corrupt; }); var bad = list.filter(function (p) { return p.corrupt; }); if (bad.length) toast(bad.length + ' patient file(s) could not be read; see the data folder.', true); renderAll(); }); }
  function init() {
    Store.getSettings().then(function (s) { st.settings = s || {}; if (!st.settings.clinicName) st.settings.clinicName = 'Fatty liver clinic'; return reload(); }).then(function () {
      $('#new').onclick = newPatient;
      $('#export').onclick = exportRegistry;
      $('#settings-btn').onclick = openSettings;
      $('#welcome-new').onclick = newPatient;
      $('#search').oninput = function () { st.filter = this.value; renderList(); };
      Store.version().then(function (v) { $('#ver').textContent = Store.kind === 'browser' ? 'browser mode' : 'v' + v; });
      document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(true).then(function () { toast('Saved'); }); } });
      window.addEventListener('beforeunload', function () { if (st.dirty) { clearTimeout(st.saveTimer); Store.savePatient(JSON.parse(JSON.stringify(st.p))); } });
    });
  }
  window.FLC = { state: st, evaluate: evaluate, save: save, newPatient: newPatient, reload: reload };
  document.addEventListener('DOMContentLoaded', init);
})();
