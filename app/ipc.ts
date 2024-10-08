import * as chokidar from 'chokidar';
import { dialog, ipcMain } from 'electron';
import * as fs from 'fs-extra';
import * as md5File from 'md5-file';
import * as recursiveReaddir from 'recursive-readdir';

import * as path from 'path';

import * as handlers from './handlers';
import * as helpers from './helpers';

import { baseUrl } from './helpers';
import { SendToUI } from './types';

let watcher: any = null;

const fileHashes: Record<string, string> = {};

export async function watchMaps(sendToUI: SendToUI) {
  if (!fs.existsSync(`${baseUrl}/resources/.loaded`)) return;
  if (watcher) return;

  const allFiles = await recursiveReaddir(
    `${baseUrl}/resources/maps/src/content/maps/custom`
  );
  const allFilesToHash = allFiles.map((f) => path.resolve(f));
  allFilesToHash.forEach(async (f) => {
    fileHashes[f] = await md5File(f);
  });

  watcher = chokidar.watch(
    `${baseUrl}/resources/maps/src/content/maps/custom/*.json`,
    {
      persistent: true,
    }
  );

  const updateMap = (name: string) => {
    const map = fs.readJSONSync(
      `${baseUrl}/resources/maps/src/content/maps/custom/${name}.json`
    );
    sendToUI('newmap', { name, map });
  };

  watcher.on('change', async (filePath: string) => {
    const pathToHash = path.resolve(filePath);
    const newHash = await md5File(pathToHash);

    if (fileHashes[pathToHash] === newHash) {
      console.log(`Ignoring file update; contents unchanged.`);
      return;
    }

    fileHashes[pathToHash] = newHash;

    console.log(
      `[Map Update]`,
      `${pathToHash} has changed. Sending update to client...`
    );
    const map = path.basename(filePath, '.json');
    updateMap(map);
  });
}

export function setupIPC(sendToUI: SendToUI) {
  watchMaps(sendToUI);

  ipcMain.on('GET_VERSION', async () => {
    sendToUI('version', require('./package.json').version);
  });

  ipcMain.on('GET_BASEURL', async () => {
    sendToUI('baseurl', baseUrl);
  });

  ipcMain.on('UPDATE_RESOURCES', async () => {
    try {
      sendToUI('notify', { type: 'info', text: 'Updating resources...' });
      await handlers.updateResources(sendToUI);
      watchMaps(sendToUI);
      sendToUI('notify', {
        type: 'success',
        text: 'Spritesheets and game data have been updated.',
      });
      sendToUI('resourcedone');
    } catch (e: any) {
      sendToUI('notify', { type: 'error', text: e.message });
    }
  });

  ipcMain.on('ENSURE_MAP', async (e: any, data: any) => {
    if (!data.name || !data.map) return;
    handlers.ensureMap(data.name, data.map);
  });

  ipcMain.on('ENSURE_MAPS', async (e: any, allMaps: any) => {
    allMaps.forEach((data: any) => {
      if (!data.name || !data.map) return;
      handlers.ensureMap(data.name, data.map);
    });
  });

  ipcMain.on('NEW_MAP', async (e: any, data: any) => {
    const name = data.name;
    if (!name) return;

    try {
      const map = handlers.newMap(name, data.creator);
      sendToUI('newmap', { name, map });
    } catch (e) {
      sendToUI('notify', {
        type: 'error',
        text: 'Could not create that map name.',
      });
    }
  });

  ipcMain.on('RENAME_MAP', async (e: any, data: any) => {
    try {
      handlers.renameMap(data.oldName, data.newName);
      sendToUI('renamemap', data);
    } catch (e) {
      sendToUI('notify', {
        type: 'error',
        text: 'A map by that name already exists.',
      });
    }
  });

  ipcMain.on('REMOVE_MAP', async (e: any, data: any) => {
    try {
      handlers.removeMap(data.mapName);
    } catch (e) {
      sendToUI('notify', {
        type: 'error',
        text: 'Could not fully delete map for some reason.',
      });
    }
  });

  ipcMain.on('COPY_MAP', async (e: any, data: any) => {
    try {
      handlers.copyMap(data.mapName);
      sendToUI('copymap', data);
    } catch (e) {
      sendToUI('notify', {
        type: 'error',
        text: 'A map by that name already exists.',
      });
    }
  });

  ipcMain.on('EDIT_MAP', async (e: any, data: any) => {
    const name = data.name;
    const map = data.map;
    if (!name || !map) return;

    try {
      handlers.editMap(name, map);
    } catch (e) {
      sendToUI('notify', { type: 'error', text: 'Tiled is not installed.' });
    }
  });

  ipcMain.on('EDIT_MAP_OBJECTS', async (e: any, data: any) => {
    const { oldName, newName, layer, propName } = data;
    if (
      !oldName ||
      !newName ||
      oldName === newName ||
      data.layer < 0 ||
      !data.propName
    )
      return;

    handlers.editMapObjects(oldName, newName, layer, propName);
  });

  ipcMain.on('EDIT_MAP_SPAWNER', async (e: any, data: any) => {
    const { oldName, newName } = data;
    if (!oldName || !newName || oldName === newName) return;

    handlers.editMapSpawnerNames(oldName, newName);
  });

  ipcMain.on('EDIT_MAP_CREATURE', async (e: any, data: any) => {
    const { oldName, newName } = data;
    if (!oldName || !newName || oldName === newName) return;

    handlers.editMapCreatureNames(oldName, newName);
  });

  ipcMain.on('JSON', async (e: any, data: any) => {
    const json = data.json;
    if (!json) return;

    const jsonData = handlers.loadJSON(json);
    sendToUI('json', { name: json, data: jsonData });
  });

  ipcMain.on('BACKUP_MOD', async (e: any, mod: any) => {
    fs.ensureDirSync(`${baseUrl}/resources/modbackup`);

    await fs.writeJSON(
      `${baseUrl}/resources/modbackup/${mod.meta.name}.rairdevmod.bak`,
      mod,
      { spaces: 2 }
    );
  });

  ipcMain.on('SAVE_MOD', (e: any, { modData, shouldExport }: any) => {
    const extname = shouldExport ? 'Rair Mods' : 'Rair In-Dev Mods';
    const ext = shouldExport ? 'rairmod' : 'rairdevmod';

    const res = dialog.showSaveDialogSync(null, {
      title: 'Save Land of the Rair Mod',
      defaultPath: modData.meta.name,
      filters: [{ name: extname, extensions: [ext] }],
    });

    if (!res) return;

    try {
      const fullMod = modData;

      helpers.saveSpecificJSON(res, fullMod);
      sendToUI('notify', { type: 'info', text: `Saved ${res}!` });
      sendToUI('updatesetting', { setting: 'autosaveFilePath', value: res });
    } catch {
      sendToUI('notify', { type: 'error', text: `Failed to save ${res}!` });
    }
  });

  ipcMain.on(
    'SAVE_MOD_WITH_BACKUP',
    async (e: any, { modData, quicksaveFilepath }: any) => {
      if (!quicksaveFilepath || !modData) return;

      if (!fs.existsSync(quicksaveFilepath)) return;

      try {
        const fullMod = modData;
        const backupPath = `${baseUrl}/resources/backup.rairmod`;

        await fs.writeJSON(backupPath, fullMod, { spaces: 2 });
        await fs.move(backupPath, quicksaveFilepath, { overwrite: true });
      } catch (e) {
        console.error('Could not quick save?');
        console.error(e);
      }
    }
  );

  ipcMain.on('LOAD_MOD_QUIETLY', (e: any, { path }: any) => {
    try {
      const json = fs.readJSONSync(path);

      const shouldImport = !!json.meta._backup;

      if (shouldImport) {
        sendToUI('importmod', json);
      } else {
        sendToUI('loadmod', json);
      }
    } catch {}
  });

  ipcMain.on('LOAD_MOD', () => {
    const res = dialog.showOpenDialogSync(null, {
      title: 'Load Land of the Rair Mod',
      filters: [
        {
          name: 'Rair In-Dev/Exported Mods',
          extensions: ['rairmod', 'rairdevmod'],
        },
      ],
      properties: ['openFile'],
    });

    if (!res) return;

    const file = res[0];
    const json = fs.readJSONSync(file);

    const shouldImport = !!json.meta._backup;

    if (shouldImport) {
      sendToUI('importmod', json);
    } else {
      sendToUI('loadmod', json);
    }

    sendToUI('notify', { type: 'info', text: `Loaded ${file}!` });
  });

  ipcMain.on('ADDITIVE_LOAD_MOD', () => {
    const res = dialog.showOpenDialogSync(null, {
      title: 'Load Land of the Rair Mod',
      filters: [
        {
          name: 'Rair In-Dev/Exported Mods',
          extensions: ['rairmod', 'rairdevmod'],
        },
      ],
      properties: ['openFile'],
    });

    if (!res) return;

    const file = res[0];
    const json = fs.readJSONSync(file);

    sendToUI('importpartialmod', json);

    sendToUI('notify', { type: 'info', text: `Imported ${file}!` });
  });

  ipcMain.on('DOWNLOAD_MONGO', async () => {
    await handlers.downloadMongo(sendToUI);
    sendToUI('notify', { type: 'info', text: 'Finished downloading MongoDB!' });
  });

  ipcMain.on('DOWNLOAD_RAIR', async () => {
    await handlers.downloadRair(sendToUI);
    sendToUI('notify', {
      type: 'info',
      text: 'Finished downloading Rair Server!',
    });
  });

  ipcMain.on('TEST_MOD', async (e: any, data: any) => {
    sendToUI('notify', { type: 'info', text: 'Testing mod...' });
    helpers.testMod(sendToUI, data);
  });

  ipcMain.on('KILL_MOD', async () => {
    sendToUI('notify', { type: 'info', text: 'Killing LotR/MongoDB...' });
    helpers.killMod(sendToUI);
  });

  ipcMain.on('GET_DEPENDENCIES', async () => {
    helpers.getAndSendDependencies(sendToUI);
  });

  ipcMain.on('ADD_DEPENDENCY', async (e: any, data: any) => {
    helpers.addDependency(sendToUI, data);
  });
}
