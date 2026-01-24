const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, Notification } = require('electron');
const path = require('path');

app.name = 'Arco App';
if (process.platform === 'win32') {
  app.setAppUserModelId('com.arco.app');
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // If user tried to run a second instance, we focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) {
        animateVisibility(true);
      }
      mainWindow.focus();
    }
  });
}

let mainWindow;
let notificationsEnabled = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 550,
    show: false,
    frame: false,
    transparent: false,
    backgroundColor: '#004715',
    resizable: true,
    minWidth: 350,
    minHeight: 550,
    maxWidth: 1000,
    maxHeight: 720,
    skipTaskbar: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: app.isPackaged
      ? path.join(__dirname, '../dist/arco-logo.png')
      : path.join(__dirname, '../public/arco-logo.png'),
    alwaysOnTop: true
  });

  const isDev = !app.isPackaged;
  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.on('ready-to-show', () => {
    const { workArea } = screen.getPrimaryDisplay();
    const x = workArea.width - 410;
    const y = workArea.height - 610;
    mainWindow.setPosition(x, y);
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      animateVisibility(false, () => {
        mainWindow.hide();
      });
    }
    return false;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  const iconPath = app.isPackaged
    ? path.join(__dirname, '../dist/arco-logo.png')
    : path.join(__dirname, '../public/arco-logo.png');

  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    {
      label: 'Quit', click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('BCV Rate Tracker');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      animateVisibility(false, () => mainWindow.hide());
    } else {
      animateVisibility(true);
    }
  });
}

function animateResize(targetWidth, targetHeight, targetX, targetY) {
  const [currentWidth, currentHeight] = mainWindow.getSize();
  const [currentX, currentY] = mainWindow.getPosition();
  const steps = 15;
  const interval = 10;

  // If target position is not provided, calculate it to preserve center
  if (targetX === undefined || targetY === undefined) {
    targetX = Math.round(currentX - (targetWidth - currentWidth) / 2);
    targetY = Math.round(currentY - (targetHeight - currentHeight) / 2);
  }

  let step = 0;
  const timer = setInterval(() => {
    step++;
    const progress = step / steps;
    const eased = 1 - Math.pow(1 - progress, 3);

    const w = Math.round(currentWidth + (targetWidth - currentWidth) * eased);
    const h = Math.round(currentHeight + (targetHeight - currentHeight) * eased);
    const x = Math.round(currentX + (targetX - currentX) * eased);
    const y = Math.round(currentY + (targetY - currentY) * eased);

    mainWindow.setBounds({ x, y, width: w, height: h });

    if (step >= steps) {
      clearInterval(timer);
    }
  }, interval);
}

function animateVisibility(show, callback) {
  const steps = 20;
  const interval = 10;
  const slideDistance = 40; // Pixels to slide

  const [width, height] = mainWindow.getSize();
  const [currentX, currentY] = mainWindow.getPosition();

  // If showing, we need to know the 'final' Y. If hiding, currentY is the 'base' Y.
  const baseY = currentY;
  const baseX = currentX;

  if (show) {
    mainWindow.setOpacity(0);
    // Start slightly lower relative to its current/target position
    mainWindow.setPosition(baseX, baseY + slideDistance);
    mainWindow.show();
  }

  let step = 0;
  const timer = setInterval(() => {
    step++;
    const progress = step / steps;
    const eased = show ? (1 - Math.pow(1 - progress, 3)) : Math.pow(progress, 3);

    if (show) {
      // Slides UP to baseY
      const targetY = Math.round((baseY + slideDistance) - (slideDistance * eased));
      mainWindow.setPosition(baseX, targetY);
      mainWindow.setOpacity(eased);
    } else {
      // Slides DOWN from baseY
      const targetY = Math.round(baseY + (slideDistance * eased));
      mainWindow.setPosition(baseX, targetY);
      mainWindow.setOpacity(1 - eased);
    }

    if (step >= steps) {
      clearInterval(timer);
      if (!show) {
        mainWindow.setOpacity(0);
        // Reset to base position for next open
        mainWindow.setPosition(baseX, baseY);
      }
      if (callback) callback();
    }
  }, interval);
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('minimize-to-tray', () => {
  animateVisibility(false, () => {
    mainWindow.hide();
  });
});

ipcMain.on('window-maximize', () => {
  const [width, height] = mainWindow.getSize();
  if (width < 1000 || height < 720) {
    const bounds = mainWindow.getBounds();
    const display = screen.getDisplayMatching(bounds);
    const { x, y, width: dw, height: dh } = display.workArea;

    const targetWidth = 1000;
    const targetHeight = 720;
    const targetX = Math.round(x + (dw - targetWidth) / 2);
    const targetY = Math.round(y + (dh - targetHeight) / 2);

    animateResize(targetWidth, targetHeight, targetX, targetY);
  } else {
    animateResize(350, 550);
  }
});

ipcMain.on('window-restore', () => {
  mainWindow.unmaximize();
});

ipcMain.on('set-always-on-top', (event, flag) => {
  mainWindow.setAlwaysOnTop(flag);
});

ipcMain.on('app-quit', () => {
  app.isQuiting = true;
  app.quit();
});

ipcMain.handle('get-autolaunch-status', () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on('set-autolaunch-status', (event, flag) => {
  app.setLoginItemSettings({
    openAtLogin: flag,
    path: app.getPath('exe')
  });
});

ipcMain.on('set-notifications-status', (event, flag) => {
  notificationsEnabled = flag;
});

ipcMain.on('send-rate-notification', (event, { title, body }) => {
  if (!notificationsEnabled) return;

  const iconPath = app.isPackaged
    ? path.join(__dirname, '../dist/arco-logo.png')
    : path.join(__dirname, '../public/arco-logo.png');

  new Notification({
    title,
    body,
    icon: iconPath
  }).show();
});
