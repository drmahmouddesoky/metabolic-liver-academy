const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  listPatients: () => ipcRenderer.invoke('patients:list'),
  getPatient: (id) => ipcRenderer.invoke('patient:get', id),
  savePatient: (p) => ipcRenderer.invoke('patient:save', p),
  deletePatient: (id) => ipcRenderer.invoke('patient:delete', id),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (s) => ipcRenderer.invoke('settings:save', s),
  chooseFolder: () => ipcRenderer.invoke('folder:choose'),
  openFolder: () => ipcRenderer.invoke('folder:open'),
  exportPdf: (html, name) => ipcRenderer.invoke('pdf:export', { html, name }),
  printHtml: (html) => ipcRenderer.invoke('print', { html }),
  exportCsv: (csv, name) => ipcRenderer.invoke('csv:export', { csv, name }),
  version: () => ipcRenderer.invoke('app:version'),
  copy: (text) => ipcRenderer.invoke('clipboard:write', text),
  setQueue: (items) => ipcRenderer.invoke('queue:set', items),
  queueGoto: (i) => ipcRenderer.invoke('queue:goto', i),
  onQueue: (cb) => { ipcRenderer.removeAllListeners('queue:pos'); ipcRenderer.on('queue:pos', (e, d) => cb(d)); },
  compact: (on) => ipcRenderer.invoke('window:compact', on)
});
