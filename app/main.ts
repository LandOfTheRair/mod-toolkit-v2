import { app, BrowserWindow, screen, shell } from 'electron';
import log from 'electron-log';
import * as fs from 'fs';
import * as path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

log.transports.file.resolvePath = () =>
  path.join(app.getAppPath(), 'logs/main.log');

process.on('uncaughtException', (err) => {
  log.error(err);
});

const Config = require('electron-config');
const config = new Config();

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

function createWindow(): BrowserWindow {
  const opts = {
    show: false,
    icon: __dirname + '/favicon.ico',
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  };

  Object.assign(opts, config.get('winBounds'));

  if (!opts.height) opts.height = 900;
  if (!opts.width) opts.width = 1300;

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    ...opts,
    minWidth: 1300,
    minHeight: 900,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: true,
      allowRunningInsecureContent: serve,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.setMenu(null);

  win.once('ready-to-show', win.show);

  win.webContents.setWindowOpenHandler(({ url }: any) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('close', () => {
    config.set('winBounds', win.getBounds());
  });

  if (isDevelopment) {
    win.webContents.openDevTools();
  }

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

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  const sendToUI = (d: any, i: any) => {
    win.webContents.send(d, i);
  };

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
