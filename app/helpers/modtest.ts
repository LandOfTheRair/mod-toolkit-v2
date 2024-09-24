import * as childProcess from 'child_process';
import * as fs from 'fs-extra';

import { SendToUI } from '../types';
import { baseUrl } from './constants';

let mongoProcess: any = null;
let lotrProcess: any = null;

process.on('exit', () => {
  console.log('Attempting to clean up stray processes...');
  killMod();
});

export function testMod(sendToUI: SendToUI, modData: any) {
  const { mod, openClient, map, settings } = modData;

  // check mongodb install
  if (!fs.existsSync(`${baseUrl}/resources/mongodb/bin/mongod.exe`)) {
    sendToUI('notify', { type: 'error', text: 'MongoDB is not installed.' });
    return;
  }

  // check lotr server install
  if (!fs.existsSync(`${baseUrl}/resources/rair/lotr-server.exe`)) {
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
  fs.writeJsonSync(`${baseUrl}/resources/rair/content/mods/mod.rairmod`, mod);
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

  // run mongo if not running
  if (!mongoProcess) {
    sendToUI('notify', { type: 'info', text: 'Starting MongoDB...' });
    mongoProcess = childProcess.exec(
      `${baseUrl}/resources/mongodb/bin/mongod.exe --port 35353 --dbpath ${baseUrl}/resources/mongodb/data/db`,
      {},
      () => {}
    );
  }

  // run lotr server if not running (kill old install)
  if (lotrProcess) {
    try {
      sendToUI('notify', { type: 'info', text: 'Stopping old Rair Server...' });
      childProcess.exec('taskkill /F /IM lotr-server.exe');
    } catch (e) {
      console.error(e);
    }
  }

  // re/start lotr server
  sendToUI('notify', { type: 'info', text: 'Starting Rair Server...' });
  lotrProcess = childProcess.exec(
    `${baseUrl}/resources/rair/lotr-server.exe`,
    { cwd: `${baseUrl}/resources/rair` },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    }
  );

  // open lotr client
  if (openClient) {
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
    childProcess.exec('taskkill /F /IM lotr-server.exe');
    lotrProcess = null;
    sendToUI?.('notify', { type: 'info', text: 'Killed Rair server!' });
  } catch (e) {
    sendToUI?.('notify', { type: 'error', text: `Could not kill Rair: ${e}` });
  }

  try {
    childProcess.exec('taskkill /F /IM mongod.exe');
    mongoProcess = null;
    sendToUI?.('notify', { type: 'info', text: 'Killed MongoDB!' });
  } catch (e) {
    sendToUI?.('notify', {
      type: 'error',
      text: `Could not kill MongoDB: ${e}`,
    });
  }
}
