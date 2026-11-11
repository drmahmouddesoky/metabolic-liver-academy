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
      exportPdf: function (html, name) { return api.exportPdf(html, name); },
      printHtml: function (html) { return api.printHtml(html); },
      exportCsv: function (csv, name) { return api.exportCsv(csv, name); },
      version: function () { return api.version(); }
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
      exportCsv: function (csv, name) { var a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,﻿' + encodeURIComponent(csv); a.download = name; document.body.appendChild(a); a.click(); a.remove(); return Promise.resolve({ ok: true }); },
      version: function () { return Promise.resolve('browser'); }
    };
  }
  window.Store = Store;
})();
