import { app, BrowserWindow, ipcMain, protocol, screen, shell } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import * as fs from 'fs';
import * as path from 'path';
import * as handlers from './handlers';
import { baseUrl } from './helpers';
import { setupIPC, watchMaps } from './ipc';
import { SendToUI } from './types';

const isDevelopment = !app.isPackaged;

log.transports.file.level = 'info';

log.transports.file.resolvePath = () =>
  path.join(app.getAppPath(), 'logs/main.log');

process.on('uncaughtException', (err) => {
  log.error(err);
});

const Config = require('electron-config');
const config = new Config();

let win: BrowserWindow | null = null;
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');

const sendToUI: SendToUI = (d: string, i?: any) => {
  win?.webContents.send(d, i);
};

const handleSetup = async () => {
  // check for and load resources if they're not present
  let isReady = false;

  sendToUI('version', require('./package.json').version);
  sendToUI('baseurl', baseUrl);

  if (!fs.existsSync(baseUrl + '/resources/.loaded')) {
    sendToUI('firstload');
    sendToUI('notify', {
      type: 'info',
      text: 'Loading resources for first time launch...',
    });
    await handlers.updateResources(sendToUI);
    watchMaps(sendToUI);
    sendToUI('notify', {
      type: 'success',
      text: 'Spritesheets and game data have been installed.',
    });
    sendToUI('ready');
    isReady = true;
  } else {
    sendToUI('ready');
    isReady = true;
  }

  // watch IPC stuff
  ipcMain.on('READY_CHECK', async () => {
    if (!isReady) return;
    sendToUI('ready');
  });

  setupIPC(sendToUI);

  autoUpdater.on('update-available', () => {
    sendToUI('notify', {
      type: 'info',
      text: 'Update available for ModKit. Downloading...',
    });
  });

  autoUpdater.on('update-downloaded', () => {
    sendToUI('notify', {
      type: 'success',
      text: 'Update downloaded! It will be installed after next restart of ModKit',
    });
  });

  autoUpdater.logger = log;
  autoUpdater.checkForUpdatesAndNotify();
};

async function createWindow(): Promise<BrowserWindow> {
  await app.whenReady();

  const opts = {
    show: false,
    icon: __dirname + '/favicon.ico',
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  };

  Object.assign(opts, config.get('winBounds'));

  const size = screen.getPrimaryDisplay().workAreaSize;

  if (!opts.height) opts.height = size.height;
  if (!opts.width) opts.width = size.width;

  /*
  opts.x += 4;
  opts.y += 7;
  opts.width += 60;
  opts.height += 25;
  */

  win = new BrowserWindow({
    ...opts,
    minWidth: 1300,
    minHeight: 900,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: true,
      allowRunningInsecureContent: serve,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (!isDevelopment) {
    win.setMenu(null);
  }

  win.once('ready-to-show', () => {
    win?.show();
    handleSetup();

    if (isDevelopment) {
      win?.webContents.openDevTools();
    }
  });

  // load intercepter for image loading
  protocol.interceptFileProtocol('lotr', (req, callback) => {
    const url = req.url.substr(7);
    callback({ path: path.normalize(baseUrl + url) });
  });

  win.webContents.setWindowOpenHandler(({ url }: any) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('close', () => {
    config.set('winBounds', win?.getBounds());
  });

  win.on('closed', () => {
    win = null;
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    await win.loadURL('http://localhost:4200');
  } else {
    const url = new URL(path.join('file:', __dirname, 'index.html'));
    await win.loadURL(url.href);
  }

  return win;
}

try {
  console.log(`Starting in ${isDevelopment ? 'dev' : 'prod'} mode...`);

  protocol.registerSchemesAsPrivileged([
    { scheme: 'lotr', privileges: { bypassCSP: true, supportFetchAPI: true } },
  ]);

  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  throw e;
}
