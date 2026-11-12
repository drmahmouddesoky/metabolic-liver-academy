/* Fatty Liver Clinic: data layer.
   In Electron, window.api (preload.js) reads and writes JSON files in the data folder.
   In a plain browser (for tests or a quick look) it falls back to localStorage. */
(function () {
  'use strict';
  var api = window.api;
  var Store;
  if (api) {
    Store = {
      kind: 'electron',
      listPatients: function () { return api.listPatients(); },
      getPatient: function (id) { return api.getPatient(id); },
      savePatient: function (p) { return api.savePatient(p); },
      deletePatient: function (id) { return api.deletePatient(id); },
      getSettings: function () { return api.getSettings(); },
      saveSettings: function (s) { return api.saveSettings(s); },
      chooseFolder: function () { return api.chooseFolder(); },
      openFolder: function () { return api.openFolder(); },
      exportPdf: function (html, name, pid, date) { return api.exportPdf(html, name, pid, date); },
      printHtml: function (html) { return api.printHtml(html); },
      patientFolder: function (id) { return api.patientFolder(id); },
      openRegistry: function () { return api.openRegistry(); },
      onRegistry: function (cb) { api.onRegistry(cb); },
      makeBackup: function () { return api.makeBackup(); },
      importBackup: function (f) { return api.importBackup(f); },
      version: function () { return api.version(); },
      copy: function (t) { return api.copy(t); },
      setQueue: function (items) { return api.setQueue(items); },
      queueGoto: function (i) { return api.queueGoto(i); },
      onQueue: function (cb) { api.onQueue(cb); },
      compact: function (on) { return api.compact(on); }
    };
  } else {
    var KEY = 'flc.patients', SKEY = 'flc.settings';
    function readAll() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
    function writeAll(o) { localStorage.setItem(KEY, JSON.stringify(o)); }
    function popup(html) { var w = window.open('', '_blank'); if (!w) return Promise.resolve({ ok: false, error: 'Pop-up blocked' }); w.document.open(); w.document.write(html); w.document.close(); setTimeout(function () { w.focus(); w.print(); }, 300); return Promise.resolve({ ok: true }); }
    Store = {
      kind: 'browser',
      listPatients: function () { var o = readAll(); return Promise.resolve(Object.keys(o).map(function (k) { return o[k]; })); },
      getPatient: function (id) { return Promise.resolve(readAll()[id] || null); },
      savePatient: function (p) { var o = readAll(); o[p.id] = p; writeAll(o); return Promise.resolve({ ok: true }); },
      deletePatient: function (id) { var o = readAll(); delete o[id]; writeAll(o); return Promise.resolve({ ok: true }); },
      getSettings: function () { try { return Promise.resolve(JSON.parse(localStorage.getItem(SKEY) || '{}')); } catch (e) { return Promise.resolve({}); } },
      saveSettings: function (s) { localStorage.setItem(SKEY, JSON.stringify(s)); return Promise.resolve({ ok: true }); },
      chooseFolder: function () { return Promise.resolve({ ok: false, error: 'Folder choice is only available in the desktop app.' }); },
      openFolder: function () { return Promise.resolve({ ok: false }); },
      exportPdf: function (html) { return popup(html); },
      printHtml: function (html) { return popup(html); },
      patientFolder: function () { return Promise.resolve({ ok: false, error: 'Folders are only available in the desktop app.' }); },
      openRegistry: function () {
        return Store.listPatients().then(function (list) {
          var csv = window.Registry.toCsv(window.Registry.visitRows(list, {}));
          var a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(csv); a.download = 'MASLD registry.csv'; document.body.appendChild(a); a.click(); a.remove();
          return { ok: true, patients: list.length };
        });
      },
      onRegistry: function () {},
      makeBackup: function () { return Promise.resolve({ ok: false, error: 'Backups are only available in the desktop app.' }); },
      importBackup: function () { return Promise.resolve({ ok: false, error: 'Import is only available in the desktop app.' }); },
      exportCsv: function (csv, name) { var a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,﻿' + encodeURIComponent(csv); a.download = name; document.body.appendChild(a); a.click(); a.remove(); return Promise.resolve({ ok: true }); },
      version: function () { return Promise.resolve('browser'); },
      copy: function (t) { return navigator.clipboard.writeText(String(t == null ? '' : t)).then(function () { return { ok: true }; }); },
      /* browser mode: no global shortcuts, the page steps through the list itself */
      setQueue: function (items) { Store._q = items || []; Store._qi = -1; return Promise.resolve({ ok: true }); },
      queueGoto: function (i) {
        var q = Store._q || []; if (!q.length) return Promise.resolve({ ok: false });
        if (i < 0) i = 0;
        if (i >= q.length) { Store._qi = q.length; if (Store._cb) Store._cb({ index: q.length, total: q.length, done: true }); return Promise.resolve({ ok: true, done: true }); }
        Store._qi = i;
        return navigator.clipboard.writeText(String(q[i].value)).then(function () { if (Store._cb) Store._cb({ index: i, total: q.length, label: q[i].label, key: q[i].key }); return { ok: true }; });
      },
      onQueue: function (cb) { Store._cb = cb; },
      compact: function () { return Promise.resolve({ ok: true }); }
    };
  }
  window.Store = Store;
})();
