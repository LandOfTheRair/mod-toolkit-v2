import * as childProcess from 'child_process';
import { app } from 'electron';
import log from 'electron-log';
import * as fs from 'fs-extra';
import * as path from 'path';

import { SendToUI } from '../types';
import { baseUrl } from './constants';

let mongoProcess: childProcess.ChildProcessWithoutNullStreams | null = null;
let lotrProcess: childProcess.ChildProcessWithoutNullStreams | null = null;

const testLogger = log.create({ logId: 'modtest' });

testLogger.transports.file.level = 'info';

testLogger.transports.file.resolvePathFn = () =>
  path.join(app.getAppPath(), 'logs/modtest.log');

process.on('exit', () => {
  testLogger.log('Attempting to clean up stray processes...');
  killMod();
});

export function testMod(sendToUI: SendToUI, modData: any) {
  const { mod, openClient, map, settings } = modData;

  // check mongodb install
  if (!fs.existsSync(`${baseUrl}/resources/mongodb/bin/mongod.exe`)) {
    testLogger.log(`MongoDB is not installed.`);
    sendToUI('notify', { type: 'error', text: 'MongoDB is not installed.' });
    return;
  }

  // check lotr server install
  if (!fs.existsSync(`${baseUrl}/resources/rair/lotr-server.exe`)) {
    testLogger.log(`Rair Server is not installed.`);
    sendToUI('notify', {
      type: 'error',
      text: 'Rair Server is not installed.',
    });
    return;
  }

  // check if map exists
  if (
    !fs.existsSync(
      `${baseUrl}/resources/maps/src/content/maps/custom/${map}.json`
    )
  ) {
    testLogger.log(`Map file does not exist.`);
    sendToUI('notify', {
      type: 'error',
      text: `Map ${map} file does not exist.`,
    });
    return;
  }

  const username = 'lotrtestuser';
  const password = 'lotrtestuser';

  // ensure map dir exists, copy it over
  fs.ensureDirSync(`${baseUrl}/resources/rair/content`);

  // clean out old maps
  fs.ensureDirSync(`${baseUrl}/resources/rair/content/_output/maps`);
  fs.rmdirSync(`${baseUrl}/resources/rair/content/_output/maps`, {
    recursive: true,
  });
  fs.ensureDirSync(`${baseUrl}/resources/rair/content/_output/maps`);

  // dump all mod data
  fs.ensureDirSync(`${baseUrl}/resources/rair/content/mods`);
  fs.rmdirSync(`${baseUrl}/resources/rair/content/mods`, { recursive: true });
  fs.ensureDirSync(`${baseUrl}/resources/rair/content/mods`);
  fs.writeJSONSync(`${baseUrl}/resources/rair/content/mods/mod.rairmod`, mod);
  sendToUI('notify', { type: 'info', text: 'Copied mod file!' });

  // write .env
  fs.writeFileSync(
    `${baseUrl}/resources/rair/.env`,
    `
DATABASE_URI=mongodb://localhost:35353/lotr2
TEST_MODE=1
TEST_USER_NAME=${username}
TEST_USER_PASSWORD=${password}
TEST_USER_PROPS=${settings}
MODS_TO_LOAD=mod
  `
  );
  sendToUI('notify', { type: 'info', text: 'Wrote .env file!' });

  // run mongodb if not running (kill old install)
  if (mongoProcess) {
    try {
      testLogger.log(`Stopping old MongoDB...`);
      sendToUI('notify', { type: 'info', text: 'Stopping old MongoDB...' });
      mongoProcess.kill();
    } catch (e) {
      testLogger.error(e);
    }
  }

  // run mongo if not running
  testLogger.log(`Starting MongoDB...`);
  sendToUI('notify', { type: 'info', text: 'Starting MongoDB...' });
  mongoProcess = childProcess.spawn(
    `${baseUrl}/resources/mongodb/bin/mongod.exe`,
    [
      '--quiet',
      '--port',
      '35353',
      '--dbpath',
      `${baseUrl}/resources/mongodb/data/db`,
    ]
  );

  mongoProcess.stdout.on('data', (data: any) => {
    testLogger.log(`mongo stdout: ${data}`);
  });

  mongoProcess.stderr.on('data', (data) => {
    testLogger.log(`mongo stderr: ${data}`);
  });

  // run lotr server if not running (kill old install)
  if (lotrProcess) {
    try {
      testLogger.log(`Stopping old Rair Server...`);
      sendToUI('notify', { type: 'info', text: 'Stopping old Rair Server...' });
      lotrProcess.kill();
    } catch (e) {
      testLogger.error(e);
    }
  }

  // re/start lotr server
  testLogger.log(`Starting Rair Server...`);
  sendToUI('notify', { type: 'info', text: 'Starting Rair Server...' });
  lotrProcess = childProcess.spawn(
    `${baseUrl}/resources/rair/lotr-server.exe`,
    [],
    { cwd: `${baseUrl}/resources/rair` }
  );

  lotrProcess.stdout.on('data', (data: any) => {
    testLogger.log(`rair stdout: ${data}`);
  });

  lotrProcess.stderr.on('data', (data) => {
    testLogger.log(`rair stderr: ${data}`);
  });

  // open lotr client
  if (openClient) {
    testLogger.log(`Opening client for user...`);
    sendToUI('notify', { type: 'info', text: 'Opening client...' });

    setTimeout(() => {
      require('electron').shell.openExternal(
        `https://testplay.rair.land/?apiUrl=localhost:6975&username=${username}&password=${password}`
      );
    }, 3000);
  }
}

export function killMod(sendToUI?: SendToUI) {
  try {
    lotrProcess?.kill();
    lotrProcess = null;
    testLogger.log(`Killed Rair Server!`);
    sendToUI?.('notify', { type: 'info', text: 'Killed Rair server!' });
  } catch (e) {
    testLogger.log(`Could not kill Rair: ${e}`);
    sendToUI?.('notify', { type: 'error', text: `Could not kill Rair: ${e}` });
  }

  try {
    mongoProcess?.kill();
    mongoProcess = null;
    testLogger.log(`Killed MongoDB!`);
    sendToUI?.('notify', { type: 'info', text: 'Killed MongoDB!' });
  } catch (e) {
    testLogger.log(`Could not kill MongoDB: ${e}`);
    sendToUI?.('notify', {
      type: 'error',
      text: `Could not kill MongoDB: ${e}`,
    });
  }
}
