import * as childProcess from 'child_process';
import * as fs from 'fs-extra';
import { baseUrl } from '../helpers';

export const fixTiledMapPaths = (map: any) => {
  map.tilesets.forEach((tileset: any) => {
    tileset.image = `../../__assets/spritesheets/${tileset.name.toLowerCase()}.png`;
  });
};

export function ensureMap(mapName: string, mapData: any) {
  const path = `${baseUrl}/resources/maps/src/content/maps/custom/${mapName}.json`;
  if (fs.existsSync(path)) return;

  fs.writeFileSync(path, JSON.stringify(mapData));
}

export function newMap(mapName: string, mapAuthor: string) {
  const fileName = mapName.replace(/[^a-zA-Z-]/g, '');
  const templatePath = `${baseUrl}/resources/maps/src/content/maps/custom/Template.json`;
  const path = `${baseUrl}/resources/maps/src/content/maps/custom/${fileName}.json`;

  if (!fs.existsSync(templatePath)) {
    throw new Error('Template is gone.');
  }

  if (fs.existsSync(path)) {
    throw new Error('Map already exists');
  }

  const json = fs.readJSONSync(templatePath);
  json.properties.creator = mapAuthor;
  json.propertytypes.creator = 'string';

  editMap(fileName, json);

  return json;
}

export function copyMap(mapName: string) {
  const oldPath = `${baseUrl}/resources/maps/src/content/maps/custom/${mapName}.json`;
  const newPath = `${baseUrl}/resources/maps/src/content/maps/custom/${mapName} (copy).json`;

  if (fs.existsSync(newPath)) {
    throw new Error('A map by that name already exists.');
  }

  fs.copySync(oldPath, newPath);
}

export function renameMap(oldName: string, newName: string) {
  const oldPath = `${baseUrl}/resources/maps/src/content/maps/custom/${oldName}.json`;
  const newPath = `${baseUrl}/resources/maps/src/content/maps/custom/${newName}.json`;

  if (fs.existsSync(newPath)) {
    throw new Error('A map by that name already exists.');
  }

  fs.moveSync(oldPath, newPath);
}

export function removeMap(mapName: string) {
  const oldPath = `${baseUrl}/resources/maps/src/content/maps/custom/${mapName}.json`;
  const newPath = `${baseUrl}/resources/maps/src/content/maps/custom/${mapName}.bak.json`;

  fs.moveSync(oldPath, newPath, { overwrite: true });
}

// TODO: for some reason, when editing a map, it gets an old version instead of using the one in memory - maybe EDIT_MAP also needs to send the map contents?
export function editMap(mapName: string, map: any) {
  if (!fs.existsSync(`${baseUrl}/resources/Tiled`)) {
    throw new Error('Tiled is not installed.');
  }

  const path = `${baseUrl}/resources/maps/src/content/maps/custom/${mapName}.json`;

  // const map = fs.readJsonSync(path);
  fixTiledMapPaths(map);
  fs.writeJsonSync(path, map);

  childProcess.exec(`${baseUrl}/resources/Tiled/tiled.exe "${path}"`);
}

export function editMapSpawnerNames(oldName: string, newName: string) {
  fs.readdirSync(`${baseUrl}/resources/maps/src/content/maps/custom`).forEach(
    (file) => {
      const path = `${baseUrl}/resources/maps/src/content/maps/custom/${file}`;
      const json = fs.readJSONSync(path);

      let didWrite = false;

      json.layers[10].objects.forEach((spawner: any) => {
        if (spawner.properties.tag !== oldName) return;

        console.log(
          `[Propagate Spawner] Updated spawner "${oldName}" in map "${file}": ${oldName} -> ${newName}`
        );

        spawner.properties.tag = newName;
        didWrite = true;
      });

      if (didWrite) {
        fs.writeJSONSync(path, json);
      }
    }
  );
}

export function editMapCreatureNames(oldName: string, newName: string) {
  fs.readdirSync(`${baseUrl}/resources/maps/src/content/maps/custom`).forEach(
    (file) => {
      const path = `${baseUrl}/resources/maps/src/content/maps/custom/${file}`;
      const json = fs.readJSONSync(path);

      let didWrite = false;

      json.layers[10].objects.forEach((spawner: any) => {
        if (spawner.properties.lairName !== oldName) return;

        console.log(
          `[Propagate NPC] Updated lair name "${oldName}" in map "${file}": ${oldName} -> ${newName}`
        );

        spawner.properties.lairName = newName;
        didWrite = true;
      });

      if (didWrite) {
        fs.writeJSONSync(path, json);
      }
    }
  );
}
