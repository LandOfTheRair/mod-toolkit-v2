import * as childProcess from 'child_process';
import * as fs from 'fs-extra';

import { SendToUI } from '../types';
import { baseUrl } from './constants';
import { modTestError, modTestLog } from './logging';

let mongoProcess: childProcess.ChildProcessWithoutNullStreams | null = null;
let lotrProcess: childProcess.ChildProcessWithoutNullStreams | null = null;

process.on('exit', () => {
  modTestLog('Attempting to clean up stray processes...');
  killMod();
});

export function testMod(sendToUI: SendToUI, modData: any) {
  const { mod, openClient, map, settings, databaseOverrideURL } = modData;

  // check mongodb install
  if (
    !databaseOverrideURL &&
    !fs.existsSync(`${baseUrl}/resources/mongodb/bin/mongod.exe`)
  ) {
    modTestLog(`MongoDB is not installed.`);
    sendToUI('notify', { type: 'error', text: 'MongoDB is not installed.' });
    return;
  }

  // check lotr server install
  if (!fs.existsSync(`${baseUrl}/resources/rair/lotr-server.exe`)) {
    modTestLog(`Rair Server is not installed.`);
    sendToUI('notify', {
      type: 'error',
      text: 'Rair Server is not installed.',
    });
    return;
  }

  // check if map exists
  if (
    !fs.existsSync(
      `${baseUrl}/resources/maps/src/content/maps/custom/${map}.json`,
    )
  ) {
    modTestLog(`Map file does not exist.`);
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

  const defaultDatabaseURL = `mongodb://localhost:35353/lotr2`;

  // write .env
  fs.writeFileSync(
    `${baseUrl}/resources/rair/.env`,
    `
DATABASE_URI=${databaseOverrideURL || defaultDatabaseURL}
TEST_MODE=1
TEST_USER_NAME=${username}
TEST_USER_PASSWORD=${password}
TEST_USER_PROPS=${settings}
MODS_TO_LOAD=mod
  `,
  );
  sendToUI('notify', { type: 'info', text: 'Wrote .env file!' });

  if (databaseOverrideURL) {
    sendToUI('notify', { type: 'info', text: 'Using custom database!' });
  }

  // run mongodb if not running (kill old install)
  if (mongoProcess) {
    try {
      modTestLog(`Stopping old MongoDB...`);
      sendToUI('notify', { type: 'info', text: 'Stopping old MongoDB...' });
      mongoProcess.kill();
    } catch (e) {
      modTestError(e);
    }
  }

  // run mongo if not running and no override specified
  if (!databaseOverrideURL) {
    modTestLog(`Starting MongoDB...`);
    sendToUI('notify', { type: 'info', text: 'Starting MongoDB...' });
    mongoProcess = childProcess.spawn(
      `${baseUrl}/resources/mongodb/bin/mongod.exe`,
      [
        '--quiet',
        '--port',
        '35353',
        '--dbpath',
        `${baseUrl}/resources/mongodb/data/db`,
      ],
    );

    mongoProcess.stdout.on('data', (data: any) => {
      modTestLog(`mongo stdout: ${data}`);
    });

    mongoProcess.stderr.on('data', (data) => {
      modTestError(data);
    });
  }

  // run lotr server if not running (kill old install)
  if (lotrProcess) {
    try {
      modTestLog(`Stopping old Rair Server...`);
      sendToUI('notify', { type: 'info', text: 'Stopping old Rair Server...' });
      lotrProcess.kill();
    } catch (e) {
      modTestError(e);
    }
  }

  // re/start lotr server
  modTestLog(`Starting Rair Server...`);
  sendToUI('notify', { type: 'info', text: 'Starting Rair Server...' });
  lotrProcess = childProcess.spawn(
    `${baseUrl}/resources/rair/lotr-server.exe`,
    [],
    { cwd: `${baseUrl}/resources/rair` },
  );

  lotrProcess.stdout.on('data', (data: any) => {
    modTestLog(`rair stdout: ${data}`);
  });

  lotrProcess.stderr.on('data', (data) => {
    modTestError(data);
  });

  // open lotr client
  if (openClient) {
    modTestLog(`Opening client for user...`);
    sendToUI('notify', { type: 'info', text: 'Opening client...' });

    setTimeout(() => {
      require('electron').shell.openExternal(
        `https://testplay.rair.land/?apiUrl=localhost:6975&username=${username}&password=${password}`,
      );
    }, 3000);
  }
}

export function killMod(sendToUI?: SendToUI) {
  try {
    lotrProcess?.kill();
    lotrProcess = null;
    modTestLog(`Killed Rair Server!`);
    sendToUI?.('notify', { type: 'info', text: 'Killed Rair server!' });
  } catch (e) {
    modTestError(e);
    sendToUI?.('notify', { type: 'error', text: `Could not kill Rair: ${e}` });
  }

  try {
    mongoProcess?.kill();
    mongoProcess = null;
    modTestLog(`Killed MongoDB!`);
    sendToUI?.('notify', { type: 'info', text: 'Killed MongoDB!' });
  } catch (e) {
    modTestError(e);
    sendToUI?.('notify', {
      type: 'error',
      text: `Could not kill MongoDB: ${e}`,
    });
  }
}
