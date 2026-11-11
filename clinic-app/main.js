/* Fatty Liver Clinic: Electron main process.
   Keeps every patient as one JSON file in the data folder (default: Documents/Fatty Liver Clinic/patients),
   settings in the app's user-data folder, and exports reports as PDF next to the data. */
const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

const SETTINGS_FILE = () => path.join(app.getPath('userData'), 'settings.json');
const DEFAULT_DATA_DIR = () => process.env.FLC_TEST_DIR || path.join(app.getPath('documents'), 'Fatty Liver Clinic');

let settings = {};
let win;

async function loadSettings() {
  try { settings = JSON.parse(await fsp.readFile(SETTINGS_FILE(), 'utf8')); } catch (e) { settings = {}; }
  if (!settings.dataDir) settings.dataDir = DEFAULT_DATA_DIR();
  if (!settings.clinicName) settings.clinicName = 'Fatty liver clinic';
  if (!settings.units) settings.units = 'base';
  await ensureDirs();
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
  return { root: d, patients: path.join(d, 'patients'), reports: path.join(d, 'reports'), trash: path.join(d, 'trash'), exports: path.join(d, 'exports') };
}
async function ensureDirs() {
  const d = dirs();
  for (const k of Object.keys(d)) await fsp.mkdir(d[k], { recursive: true });
}
function safeId(id) { return String(id || '').replace(/[^a-zA-Z0-9_-]/g, ''); }
function safeName(s) { return String(s || 'report').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80); }

async function listPatients() {
  const d = dirs();
  const files = (await fsp.readdir(d.patients)).filter(f => f.endsWith('.json'));
  const out = [];
  for (const f of files) {
    try { out.push(JSON.parse(await fsp.readFile(path.join(d.patients, f), 'utf8'))); }
    catch (e) { out.push({ id: f.replace(/\.json$/, ''), name: '(unreadable file ' + f + ')', corrupt: true, visits: [] }); }
  }
  return out;
}
async function getPatient(id) {
  try { return JSON.parse(await fsp.readFile(path.join(dirs().patients, safeId(id) + '.json'), 'utf8')); } catch (e) { return null; }
}
async function savePatient(p) {
  if (!p || !p.id) return { ok: false, error: 'No patient id' };
  const file = path.join(dirs().patients, safeId(p.id) + '.json');
  const tmp = file + '.tmp';
  await fsp.writeFile(tmp, JSON.stringify(p, null, 2), 'utf8');
  await fsp.rename(tmp, file);
  return { ok: true, file };
}
async function deletePatient(id) {
  const d = dirs();
  const file = path.join(d.patients, safeId(id) + '.json');
  try { await fsp.rename(file, path.join(d.trash, safeId(id) + '-' + Date.now() + '.json')); return { ok: true }; }
  catch (e) { return { ok: false, error: e.message }; }
}

async function renderPdf(html) {
  const w = new BrowserWindow({ show: false, webPreferences: { sandbox: true, javascript: false } });
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
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  const menu = Menu.buildFromTemplate([
    { label: 'File', submenu: [
      { label: 'Open data folder', click: () => shell.openPath(dirs().root) },
      { type: 'separator' }, { role: 'quit' }] },
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }, { role: 'toggleDevTools' }] },
    { label: 'Help', submenu: [{ label: 'About', click: () => dialog.showMessageBox(win, { message: 'Fatty Liver Clinic ' + app.getVersion(), detail: 'MASLD / MASH evaluation, report and registry.\nData folder: ' + dirs().root }) }] }
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  await loadSettings();
  ipcMain.handle('settings:get', () => settings);
  ipcMain.handle('settings:save', (e, s) => saveSettings(s));
  ipcMain.handle('patients:list', () => listPatients());
  ipcMain.handle('patient:get', (e, id) => getPatient(id));
  ipcMain.handle('patient:save', (e, p) => savePatient(p));
  ipcMain.handle('patient:delete', (e, id) => deletePatient(id));
  ipcMain.handle('app:version', () => app.getVersion());
  ipcMain.handle('folder:open', () => shell.openPath(dirs().root).then(() => ({ ok: true })));
  ipcMain.handle('folder:choose', async () => {
    const r = await dialog.showOpenDialog(win, { title: 'Choose the folder that holds patient files', defaultPath: dirs().root, properties: ['openDirectory', 'createDirectory'] });
    if (r.canceled || !r.filePaths.length) return { ok: false };
    await saveSettings({ dataDir: r.filePaths[0] });
    return { ok: true, dataDir: r.filePaths[0] };
  });
  ipcMain.handle('pdf:export', async (e, { html, name }) => {
    const def = path.join(dirs().reports, safeName(name) + '.pdf');
    const r = process.env.FLC_TEST_DIR ? { filePath: def } : await dialog.showSaveDialog(win, { title: 'Save report as PDF', defaultPath: def, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
    if (r.canceled || !r.filePath) return { ok: false };
    try { const buf = await renderPdf(html); await fsp.writeFile(r.filePath, buf); if (!process.env.FLC_TEST_DIR) shell.showItemInFolder(r.filePath); return { ok: true, file: r.filePath }; }
    catch (err) { return { ok: false, error: err.message }; }
  });
  ipcMain.handle('print', async (e, { html }) => {
    const w = new BrowserWindow({ show: false, webPreferences: { sandbox: true, javascript: false } });
    await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    return new Promise(resolve => w.webContents.print({ printBackground: true }, (ok, reason) => { w.destroy(); resolve({ ok, error: reason }); }));
  });
  ipcMain.handle('csv:export', async (e, { csv, name }) => {
    const def = path.join(dirs().exports, safeName(name) + '.csv');
    const r = process.env.FLC_TEST_DIR ? { filePath: def } : await dialog.showSaveDialog(win, { title: 'Export registry', defaultPath: def, filters: [{ name: 'CSV (Excel)', extensions: ['csv'] }] });
    if (r.canceled || !r.filePath) return { ok: false };
    await fsp.writeFile(r.filePath, '﻿' + csv, 'utf8');
    shell.showItemInFolder(r.filePath);
    return { ok: true, file: r.filePath };
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
