/* Fatty Liver Clinic: Electron main process. Works fully offline: every network request is blocked.
   Data folder (default: Desktop/Fatty Liver Clinic):
     Patients/<URN> - <Name>/patient.json      the patient and all visits
     Patients/<URN> - <Name>/<date> note.txt   the note of each visit
     Patients/<URN> - <Name>/<date> report.pdf the PDF report (when exported)
     Patients/<URN> - <Name>/history/          earlier versions of patient.json
     Registry/MASLD registry.csv               one row per visit, rebuilt after every save
     Registry/Patient index.csv                one row per patient
     Backups/                                  backup files for moving data between laptops
     Trash/                                    deleted patients
   Settings (letterhead, folder choice) live in the app's own settings file on this computer. */
const { app, BrowserWindow, ipcMain, dialog, shell, Menu, clipboard, globalShortcut, screen, session } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const fsp = fs.promises;
const Registry = require('./app/registry.js');
const Rules = require('./app/rules.js');
const Emr = require('./app/emr.js');

const SETTINGS_FILE = () => path.join(app.getPath('userData'), 'settings.json');
const DEFAULT_DATA_DIR = () => process.env.FLC_TEST_DIR || path.join(app.getPath('desktop'), 'Fatty Liver Clinic');

let settings = {};
let win;
/* TrakCare copy sequence: the main process holds the list so global shortcuts work while TrakCare has focus */
let queue = [], qi = -1, normalBounds = null;
function qSend(extra) { if (win && !win.isDestroyed()) win.webContents.send('queue:pos', Object.assign({ index: qi, total: queue.length }, extra || {})); }
function qCopy(i) {
  if (!queue.length) return { ok: false };
  if (i < 0) i = 0;
  if (i >= queue.length) { qi = queue.length; qSend({ done: true }); return { ok: true, done: true }; }
  qi = i; clipboard.writeText(String(queue[qi].value || ''));
  qSend({ label: queue[qi].label, key: queue[qi].key });
  return { ok: true, index: qi };
}
function reg(list, fn) { for (const a of list) { try { if (globalShortcut.register(a, fn)) return a; } catch (e) { /* try next */ } } return null; }

/* ---------------- settings and folders ---------------- */
async function loadSettings() {
  try { settings = JSON.parse(await fsp.readFile(SETTINGS_FILE(), 'utf8')); } catch (e) { settings = {}; }
  if (process.env.FLC_TEST_DIR) settings.dataDir = process.env.FLC_TEST_DIR;
  if (!settings.dataDir) settings.dataDir = DEFAULT_DATA_DIR();
  if (!settings.clinicName) settings.clinicName = 'Fatty liver clinic';
  if (!settings.units) settings.units = 'base';
  await ensureDirs();
  await migrateOldLayout();
  return settings;
}
async function saveSettings(s) {
  settings = Object.assign({}, settings, s);
  await fsp.mkdir(path.dirname(SETTINGS_FILE()), { recursive: true });
  await fsp.writeFile(SETTINGS_FILE(), JSON.stringify(settings, null, 2), 'utf8');
  await ensureDirs();
  return settings;
}
function dirs() {
  const d = settings.dataDir || DEFAULT_DATA_DIR();
  return { root: d, patients: path.join(d, 'Patients'), registry: path.join(d, 'Registry'), backups: path.join(d, 'Backups'), trash: path.join(d, 'Trash') };
}
async function ensureDirs() { const d = dirs(); for (const k of Object.keys(d)) await fsp.mkdir(d[k], { recursive: true }); }
function exists(p) { try { fs.accessSync(p); return true; } catch (e) { return false; } }
function safeName(s, max) { return String(s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').replace(/\s+/g, ' ').replace(/^[ .]+|[ .]+$/g, '').slice(0, max || 80); }

/* Is the data folder inside a cloud-synced folder? Then files would leave this computer. */
function cloudSync(dir) {
  const d = String(dir || '');
  const m = /(OneDrive[^\\/]*|Dropbox|Google Drive|GoogleDrive|iCloud Drive|Mobile Documents|Box Sync)/i.exec(d);
  if (m) return m[1];
  if (process.platform === 'darwin') {
    const desk = path.join(os.homedir(), 'Desktop');
    const icloudDesk = path.join(os.homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs', 'Desktop');
    if ((d === desk || d.indexOf(desk + path.sep) === 0) && exists(icloudDesk)) return 'iCloud (Desktop & Documents)';
  }
  return null;
}

/* ---------------- patient folders ---------------- */
let folderOf = {};   // patient id -> folder name
function folderName(p) { return safeName((p.fileNo ? p.fileNo : 'no URN') + ' - ' + (p.name || 'unnamed'), 90) || ('patient ' + p.id); }
async function scan() {
  const d = dirs(); folderOf = {};
  const out = [];
  let names = [];
  try { names = await fsp.readdir(d.patients, { withFileTypes: true }); } catch (e) { names = []; }
  for (const n of names) {
    if (!n.isDirectory()) continue;
    const f = path.join(d.patients, n.name, 'patient.json');
    if (!exists(f)) continue;
    try { const p = JSON.parse(await fsp.readFile(f, 'utf8')); if (p && p.id) { folderOf[p.id] = n.name; out.push(p); } }
    catch (e) { out.push({ id: 'corrupt-' + n.name, name: '(unreadable: ' + n.name + ')', corrupt: true, visits: [] }); }
  }
  return out;
}
async function writeJsonAtomic(file, obj) {
  const tmp = file + '.tmp';
  await fsp.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf8');
  await fsp.rename(tmp, file);
}
async function keepHistory(dir) {
  const f = path.join(dir, 'patient.json'); if (!exists(f)) return;
  const h = path.join(dir, 'history'); await fsp.mkdir(h, { recursive: true });
  const list = (await fsp.readdir(h)).filter(x => x.endsWith('.json')).sort();
  const last = list[list.length - 1];
  if (last) { const st = await fsp.stat(path.join(h, last)); if (Date.now() - st.mtimeMs < 10 * 60 * 1000) return; }   // at most one copy per 10 minutes
  await fsp.copyFile(f, path.join(h, 'patient ' + new Date().toISOString().replace(/[:.]/g, '-') + '.json'));
  for (const old of list.slice(0, Math.max(0, list.length - 29))) await fsp.unlink(path.join(h, old)).catch(() => {});
}
async function resolveFolder(p) {
  const d = dirs();
  let cur = folderOf[p.id];
  if (cur && !exists(path.join(d.patients, cur))) cur = null;
  let want = folderName(p);
  const taken = (n) => exists(path.join(d.patients, n)) && n !== cur;
  if (taken(want)) want = safeName(want + ' (' + String(p.id).slice(-5) + ')', 100);
  if (!cur) { await fsp.mkdir(path.join(d.patients, want), { recursive: true }); folderOf[p.id] = want; return want; }
  if (cur !== want && !taken(want)) {
    try { await fsp.rename(path.join(d.patients, cur), path.join(d.patients, want)); folderOf[p.id] = want; return want; }
    catch (e) { return cur; }   // a file inside is open (e.g. a PDF): keep the old name for now
  }
  return cur;
}
async function savePatient(p) {
  if (!p || !p.id) return { ok: false, error: 'No patient id' };
  try {
    const folder = await resolveFolder(p);
    const dir = path.join(dirs().patients, folder);
    await keepHistory(dir);
    await writeJsonAtomic(path.join(dir, 'patient.json'), p);
    scheduleAfterSave(p.id);
    return { ok: true, folder: dir };
  } catch (e) { return { ok: false, error: e.message }; }
}
async function getPatient(id) {
  if (!folderOf[id]) await scan();
  const f = folderOf[id] && path.join(dirs().patients, folderOf[id], 'patient.json');
  if (!f) return null;
  try { return JSON.parse(await fsp.readFile(f, 'utf8')); } catch (e) { return null; }
}
async function deletePatient(id) {
  if (!folderOf[id]) await scan();
  const folder = folderOf[id]; if (!folder) return { ok: false, error: 'Not found' };
  const d = dirs();
  try { await fsp.rename(path.join(d.patients, folder), path.join(d.trash, folder + ' (deleted ' + new Date().toISOString().slice(0, 10) + ' ' + Date.now() % 100000 + ')')); delete folderOf[id]; scheduleAfterSave(null); return { ok: true }; }
  catch (e) { return { ok: false, error: 'Could not move the folder (is a file from it open?): ' + e.message }; }
}

/* old layout (single folder of <id>.json files) -> one folder per patient */
async function migrateOldLayout() {
  const d = dirs();
  for (const oldDir of [d.patients, path.join(d.root, 'patients')]) {
    let files = [];
    try { files = (await fsp.readdir(oldDir, { withFileTypes: true })).filter(x => x.isFile() && x.name.endsWith('.json')); } catch (e) { continue; }
    for (const f of files) {
      try {
        const p = JSON.parse(await fsp.readFile(path.join(oldDir, f.name), 'utf8'));
        if (!p || !p.id) continue;
        await scan(); const folder = await resolveFolder(p);
        await writeJsonAtomic(path.join(d.patients, folder, 'patient.json'), p);
        await fsp.unlink(path.join(oldDir, f.name));
        scheduleAfterSave(p.id);
      } catch (e) { /* leave the file where it is */ }
    }
    if (oldDir !== d.patients) await fsp.rmdir(oldDir).catch(() => {});   // removes it only if empty
  }
}

/* ---------------- after every save: notes and registry ---------------- */
let pending = new Set(), timer = null, registryStatus = { ok: true };
function scheduleAfterSave(id) { if (id) pending.add(id); clearTimeout(timer); timer = setTimeout(afterSave, 1500); }
function visitFileBase(p, v) {
  const same = (p.visits || []).filter(x => x.date === v.date);
  const n = same.length > 1 ? ' (' + (same.indexOf(v) + 1) + ')' : '';
  return (v.date || 'undated') + n;
}
async function writeNotes(p) {
  const folder = folderOf[p.id]; if (!folder) return;
  const dir = path.join(dirs().patients, folder);
  for (const v of p.visits || []) {
    try {
      const r = Rules.evaluate(p, v, settings);
      const txt = Emr.consultText(p, v, r, settings, 'note');
      await fsp.writeFile(path.join(dir, visitFileBase(p, v) + ' note.txt'), txt.replace(/\n/g, os.EOL), 'utf8');
    } catch (e) { /* a visit that cannot be evaluated yet */ }
  }
}
async function rebuildRegistry() {
  const all = (await scan()).filter(p => !p.corrupt);
  const d = dirs();
  const files = [[path.join(d.registry, 'MASLD registry.csv'), Registry.visitRows(all, settings)],
    [path.join(d.registry, 'Patient index.csv'), Registry.indexRows(all, settings, p => folderOf[p.id] || '')]];
  const errors = [];
  for (const [f, rows] of files) {
    try { await fsp.writeFile(f + '.tmp', '﻿' + Registry.toCsv(rows), 'utf8'); await fsp.rename(f + '.tmp', f); }
    catch (e) { errors.push(path.basename(f)); fsp.unlink(f + '.tmp').catch(() => {}); }
  }
  registryStatus = errors.length ? { ok: false, error: errors.join(' and ') + ' is open in another program (Excel?). It will update after you close it.' } : { ok: true, patients: all.length, at: new Date().toISOString() };
  return registryStatus;
}
async function afterSave() {
  const ids = Array.from(pending); pending.clear();
  for (const id of ids) { const p = await getPatient(id); if (p) await writeNotes(p).catch(() => {}); }
  await rebuildRegistry().catch(() => {});
  if (win && !win.isDestroyed()) win.webContents.send('registry:status', registryStatus);
}

/* ---------------- backup and import (for moving data between laptops) ---------------- */
async function makeBackup(target) {
  const all = (await scan()).filter(p => !p.corrupt);
  const letter = {}; ['clinicName', 'doctorName', 'doctorTitle', 'clinicAddress', 'clinicPhone', 'astUln', 'units'].forEach(k => { if (settings[k] != null) letter[k] = settings[k]; });
  const data = { app: 'Fatty Liver Clinic', kind: 'backup', version: 1, createdAt: new Date().toISOString(), computer: os.hostname(), settings: letter, patients: all };
  await fsp.writeFile(target, JSON.stringify(data), 'utf8');
  return { ok: true, file: target, patients: all.length, visits: all.reduce((n, p) => n + (p.visits || []).length, 0) };
}
async function importBackup(file) {
  let data;
  try { data = JSON.parse(await fsp.readFile(file, 'utf8')); } catch (e) { return { ok: false, error: 'This is not a Fatty Liver Clinic backup file.' }; }
  if (!data || data.app !== 'Fatty Liver Clinic' || !Array.isArray(data.patients)) return { ok: false, error: 'This is not a Fatty Liver Clinic backup file.' };
  // safety copy of this laptop's data before merging
  await makeBackup(path.join(dirs().backups, 'Before import ' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.flcbackup'));
  const local = (await scan()).filter(p => !p.corrupt);
  let newP = 0, mergedP = 0, addedV = 0, updatedV = 0;
  for (const inc of data.patients) {
    if (!inc || !inc.id) continue;
    const twin = Registry.findTwin(local, inc);
    const m = Registry.mergePatient(twin, inc);
    if (twin && twin.id !== inc.id) m.patient.id = twin.id;
    if (m.isNew) newP++; else if (m.added || m.updated) mergedP++;
    addedV += m.isNew ? 0 : m.added; updatedV += m.updated;
    if (m.isNew || m.added || m.updated || String(inc.updatedAt || '') > String((twin || {}).updatedAt || '')) await savePatient(m.patient);
    if (m.isNew) local.push(m.patient);
  }
  if (data.settings && !settings.doctorName) await saveSettings(data.settings);
  await afterSave();
  return { ok: true, newPatients: newP, mergedPatients: mergedP, addedVisits: addedV, updatedVisits: updatedV, from: data.computer || '', createdAt: data.createdAt || '' };
}

/* ---------------- offline: refuse every network request ---------------- */
function lockOffline() {
  const ses = session.defaultSession;
  ses.webRequest.onBeforeRequest((d, cb) => cb({ cancel: !/^(file|data|blob|devtools|chrome|about):/i.test(d.url) }));
  try { ses.setSpellCheckerEnabled(false); } catch (e) { /* older Electron */ }
  app.on('web-contents-created', (e, wc) => {
    wc.setWindowOpenHandler(() => ({ action: 'deny' }));
    wc.on('will-navigate', (ev, url) => { if (!/^file:/i.test(url)) ev.preventDefault(); });
  });
}

async function renderPdf(html) {
  const w = new BrowserWindow({ show: false, webPreferences: { sandbox: true, javascript: false, spellcheck: false } });
  try {
    await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    return await w.webContents.printToPDF({ pageSize: 'A4', printBackground: true, margins: { marginType: 'custom', top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 } });
  } finally { w.destroy(); }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 1000, minHeight: 650,
    title: 'Fatty Liver Clinic',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  const menu = Menu.buildFromTemplate([
    { label: 'File', submenu: [
      { label: 'Open data folder', click: () => shell.openPath(dirs().root) },
      { label: 'Open registry (Excel)', click: () => rebuildRegistry().then(() => shell.openPath(path.join(dirs().registry, 'MASLD registry.csv'))) },
      { type: 'separator' }, { role: 'quit' }] },
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }, { role: 'toggleDevTools' }] },
    { label: 'Help', submenu: [{ label: 'About', click: () => dialog.showMessageBox(win, { message: 'Fatty Liver Clinic ' + app.getVersion(), detail: 'MASLD / MASH evaluation, report and registry.\nWorks offline: no internet connection is used.\nData folder: ' + dirs().root }) }] }
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  lockOffline();
  await loadSettings();
  ipcMain.handle('settings:get', () => Object.assign({}, settings, { cloud: cloudSync(settings.dataDir) }));
  ipcMain.handle('settings:save', (e, s) => saveSettings(s));
  ipcMain.handle('patients:list', () => scan());
  ipcMain.handle('patient:get', (e, id) => getPatient(id));
  ipcMain.handle('patient:save', (e, p) => savePatient(p));
  ipcMain.handle('patient:delete', (e, id) => deletePatient(id));
  ipcMain.handle('patient:folder', async (e, id) => { if (!folderOf[id]) await scan(); if (!folderOf[id]) return { ok: false }; await shell.openPath(path.join(dirs().patients, folderOf[id])); return { ok: true }; });
  ipcMain.handle('app:version', () => app.getVersion());
  ipcMain.handle('clipboard:write', (e, t) => { clipboard.writeText(String(t == null ? '' : t)); return { ok: true }; });
  ipcMain.handle('queue:set', (e, items) => {
    queue = Array.isArray(items) ? items : []; qi = -1;
    globalShortcut.unregisterAll();
    if (!queue.length) return { ok: true };
    const next = reg(['CommandOrControl+Shift+Space', 'F9'], () => qCopy(qi + 1));
    const prev = reg(['CommandOrControl+Shift+Backspace', 'F8'], () => qCopy(qi - 1));
    return { ok: true, next, prev };
  });
  ipcMain.handle('queue:goto', (e, i) => qCopy(i));
  ipcMain.handle('window:compact', (e, on) => {
    if (!win) return { ok: false };
    if (on) {
      normalBounds = win.getBounds();
      const wa = screen.getDisplayMatching(normalBounds).workArea;
      win.setMinimumSize(340, 400);
      win.setBounds({ x: wa.x + wa.width - 460, y: wa.y, width: 460, height: wa.height });
      win.setAlwaysOnTop(true, 'floating');
    } else {
      win.setAlwaysOnTop(false);
      win.setMinimumSize(1000, 650);
      if (normalBounds) win.setBounds(normalBounds);
    }
    return { ok: true };
  });
  ipcMain.handle('folder:open', () => shell.openPath(dirs().root).then(() => ({ ok: true })));
  ipcMain.handle('folder:choose', async () => {
    const r = await dialog.showOpenDialog(win, { title: 'Choose where to keep the clinic files (a folder on this computer)', defaultPath: dirs().root, properties: ['openDirectory', 'createDirectory'] });
    if (r.canceled || !r.filePaths.length) return { ok: false };
    const oldDir = dirs().root;
    let target = r.filePaths[0];
    if (path.basename(target) !== 'Fatty Liver Clinic' && !exists(path.join(target, 'Patients'))) target = path.join(target, 'Fatty Liver Clinic');
    const hadData = (await scan()).length > 0 && target !== oldDir;
    await saveSettings({ dataDir: target });
    if (hadData && (await scan()).length === 0) {
      const ans = await dialog.showMessageBox(win, { type: 'question', buttons: ['Copy patients to the new folder', 'Start empty'], defaultId: 0, message: 'Copy the existing patients to the new folder?', detail: 'From: ' + oldDir + '\nTo: ' + target + '\nThe old folder is left as it is; you can delete it yourself afterwards.' });
      if (ans.response === 0) await fsp.cp(oldDir, target, { recursive: true, force: false, errorOnExist: false });
    }
    await afterSave();
    return { ok: true, dataDir: target, cloud: cloudSync(target) };
  });
  ipcMain.handle('pdf:export', async (e, { html, name, patientId, date }) => {
    try {
      if (patientId && !folderOf[patientId]) await scan();
      const dir = patientId && folderOf[patientId] ? path.join(dirs().patients, folderOf[patientId]) : dirs().root;
      const file = path.join(dir, safeName((date || new Date().toISOString().slice(0, 10)) + ' report', 60) + '.pdf');
      const buf = await renderPdf(html);
      await fsp.writeFile(file, buf);
      if (!process.env.FLC_TEST_DIR) shell.openPath(file);
      return { ok: true, file };
    } catch (err) { return { ok: false, error: /EBUSY|EPERM/.test(err.code || '') ? 'The previous PDF is open; close it and try again.' : err.message }; }
  });
  ipcMain.handle('print', async (e, { html }) => {
    const w = new BrowserWindow({ show: false, webPreferences: { sandbox: true, javascript: false, spellcheck: false } });
    await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    return new Promise(resolve => w.webContents.print({ printBackground: true }, (ok, reason) => { w.destroy(); resolve({ ok, error: reason }); }));
  });
  ipcMain.handle('registry:open', async () => {
    const s = await rebuildRegistry();
    if (!s.ok) return s;
    if (!process.env.FLC_TEST_DIR) await shell.openPath(path.join(dirs().registry, 'MASLD registry.csv'));
    return Object.assign({ file: path.join(dirs().registry, 'MASLD registry.csv') }, s);
  });
  ipcMain.handle('registry:status', () => registryStatus);
  ipcMain.handle('backup:make', async () => {
    const def = path.join(dirs().backups, 'Fatty Liver Clinic backup ' + new Date().toISOString().slice(0, 10) + ' ' + safeName(os.hostname(), 30) + '.flcbackup');
    const r = process.env.FLC_TEST_DIR ? { filePath: def } : await dialog.showSaveDialog(win, { title: 'Save backup (choose your USB stick to move it to another laptop)', defaultPath: def, filters: [{ name: 'Fatty Liver Clinic backup', extensions: ['flcbackup'] }] });
    if (r.canceled || !r.filePath) return { ok: false };
    try { const out = await makeBackup(r.filePath); if (!process.env.FLC_TEST_DIR) shell.showItemInFolder(r.filePath); return out; }
    catch (err) { return { ok: false, error: err.message }; }
  });
  ipcMain.handle('backup:import', async (e, testFile) => {
    let file = process.env.FLC_TEST_DIR ? testFile : null;
    if (!file) {
      const r = await dialog.showOpenDialog(win, { title: 'Import a backup from another laptop', defaultPath: dirs().backups, properties: ['openFile'], filters: [{ name: 'Fatty Liver Clinic backup', extensions: ['flcbackup', 'json'] }] });
      if (r.canceled || !r.filePaths.length) return { ok: false };
      file = r.filePaths[0];
    }
    return importBackup(file);
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
