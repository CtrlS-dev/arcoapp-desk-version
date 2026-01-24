const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  restoreWindow: () => ipcRenderer.send('window-restore'),
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),
  quitApp: () => ipcRenderer.send('app-quit'),
  onSleepMode: (callback) => ipcRenderer.on('sleep-mode', (_event, value) => callback(value)),
  getAutoLaunchStatus: () => ipcRenderer.invoke('get-autolaunch-status'),
  setAutoLaunchStatus: (flag) => ipcRenderer.send('set-autolaunch-status', flag),
  setNotificationsStatus: (flag) => ipcRenderer.send('set-notifications-status', flag),
  sendRateNotification: (title, body) => ipcRenderer.send('send-rate-notification', { title, body })
});
