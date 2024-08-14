import { app, BrowserWindow, ipcMain, protocol, screen, shell } from 'electron';
import log from 'electron-log';
import * as fs from 'fs';
import * as path from 'path';
import * as handlers from './handlers';
import { baseUrl } from './helpers';
import { setupIPC, watchMaps } from './ipc';
import { SendToUI } from './types';

const isDevelopment = process.env.NODE_ENV !== 'production';

console.log(`Starting in ${isDevelopment ? 'dev' : 'prod'} mode...`);

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
};

async function createWindow(): Promise<BrowserWindow> {
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

  // Create the browser window.
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

  win.setMenu(null);

  win.once('ready-to-show', () => {
    win?.show();
    handleSetup();
  });

  // load intercepter for image loading
  protocol.interceptFileProtocol('file', (req, callback) => {
    const url = req.url.substr(7);
    callback({ path: path.normalize(app.getAppPath() + url) });
  });

  win.webContents.setWindowOpenHandler(({ url }: any) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('close', () => {
    config.set('winBounds', win?.getBounds());
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  if (isDevelopment) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
