const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('akoflow', {
  getDockerStatus: async () => {
    console.log('[preload] getDockerStatus invoked');
    try {
      const res = await ipcRenderer.invoke('docker:get-status');
      console.log('[preload] getDockerStatus result', res);
      return res;
    } catch (err) {
      console.error('[preload] getDockerStatus error', err);
      throw err;
    }
  },
  getSystemInfo: async () => {
    console.log('[preload] getSystemInfo invoked');
    try {
      const res = await ipcRenderer.invoke('system:get-info');
      console.log('[preload] getSystemInfo result', res);
      return res;
    } catch (err) {
      console.error('[preload] getSystemInfo error', err);
      throw err;
    }
  },
  getDiagnostics: async () => {
    console.log('[preload] getDiagnostics invoked');
    try {
      const res = await ipcRenderer.invoke('diagnostics:get');
      console.log('[preload] getDiagnostics result', res);
      return res;
    } catch (err) {
      console.error('[preload] getDiagnostics error', err);
      throw err;
    }
  },
  openDockerAction: (actionUrl) => {
    console.log('[preload] openDockerAction', actionUrl);
    return ipcRenderer.invoke('docker:open-action', actionUrl);
  },
});