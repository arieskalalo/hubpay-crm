const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Hubpay CRM',
    backgroundColor: '#F4F1EB',
    show: false,
  });

  win.loadFile('index.html');
  Menu.setApplicationMenu(null);

  win.once('ready-to-show', () => win.show());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
