import * as chokidar from 'chokidar';
import { dialog, ipcMain } from 'electron';
import * as fs from 'fs-extra';
import * as path from 'path';

import * as handlers from './handlers';
import * as helpers from './helpers';

import { baseUrl } from './helpers';
import { SendToUI } from './types';

let watcher: any = null;

export function watchMaps(sendToUI: SendToUI) {
  if (!fs.existsSync(`${baseUrl}/resources/.loaded`)) return;
  if (watcher) return;

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

  watcher.on('change', (filePath: string) => {
    const map = path.basename(filePath, '.json');
    updateMap(map);
  });
}

export function setupIPC(sendToUI: SendToUI) {
  watchMaps(sendToUI);

  ipcMain.on('UPDATE_RESOURCES', async () => {
    try {
      sendToUI('notify', { type: 'info', text: 'Updating resources...' });
      await handlers.updateResources(sendToUI);
      watchMaps(sendToUI);
      sendToUI('notify', {
        type: 'success',
        text: 'Spritesheets and game data have been updated.',
      });
    } catch (e: any) {
      sendToUI('notify', { type: 'error', text: e.message });
    }
  });

  ipcMain.on('ENSURE_MAP', async (e: any, data: any) => {
    if (!data.name || !data.map) return;
    handlers.ensureMap(data.name, data.map);
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
    if (!name) return;

    try {
      handlers.editMap(name);
    } catch (e) {
      sendToUI('notify', { type: 'error', text: 'Tiled is not installed.' });
    }
  });

  ipcMain.on('EDIT_MAP_SPAWNER', async (e: any, data: any) => {
    const { oldName, newName } = data;
    if (!oldName || !newName) return;

    handlers.editMapSpawnerNames(oldName, newName);
  });

  ipcMain.on('JSON', async (e: any, data: any) => {
    const json = data.json;
    if (!json) return;

    const jsonData = handlers.loadJSON(json);
    sendToUI('json', { name: json, data: jsonData });
  });

  ipcMain.on('BACKUP_MOD', (e: any, mod: any) => {
    fs.ensureDirSync(`${baseUrl}/resources/modbackup`);
    fs.writeJSONSync(
      `${baseUrl}/resources/modbackup/${mod.meta.name}.rairdevmod.bak`,
      mod,
      { spaces: 2 }
    );
  });

  ipcMain.on('SAVE_MOD', (e: any, { modData, shouldExport }: any) => {
    if (shouldExport && !fs.existsSync(`${baseUrl}/resources/rair`)) {
      sendToUI('notify', {
        type: 'error',
        text: 'Mod cannot be formatted for saving, install Rair Server first!',
      });
      return;
    }

    const extname = shouldExport ? 'Rair Mods' : 'Rair In-Dev Mods';
    const ext = shouldExport ? 'rairmod' : 'rairdevmod';

    const res = dialog.showSaveDialogSync(null, {
      title: 'Save Land of the Rair Mod',
      defaultPath: modData.meta.name,
      filters: [{ name: extname, extensions: [ext] }],
    });

    if (!res) return;

    try {
      const fullMod = shouldExport ? handlers.formatMod(modData) : modData;

      fs.writeJSONSync(res, fullMod, { spaces: 2 });
      sendToUI('notify', { type: 'info', text: `Saved ${res}!` });
    } catch {
      sendToUI('notify', { type: 'error', text: `Failed to save ${res}!` });
    }
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
}
