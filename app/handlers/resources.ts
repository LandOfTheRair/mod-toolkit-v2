import * as admZip from 'adm-zip';
import * as dlgit from 'download-github-repo';
import * as fs from 'fs-extra';

import { baseUrl } from '../helpers';
import { SendToUI } from '../types';

let isUpdating = false;

export async function updateResources(sendToUI: SendToUI) {
  if (isUpdating) throw new Error('Currently updating, please wait.');
  isUpdating = true;

  if (fs.existsSync(`${baseUrl}/resources/.loaded`)) {
    fs.rmSync(`${baseUrl}/resources/.loaded`);
  }

  sendToUI('notify', { type: 'info', text: 'Creating directory structure...' });

  fs.ensureDirSync(`${baseUrl}/resources/json`);
  fs.ensureDirSync(`${baseUrl}/resources/maps/__assets/spritesheets`);
  fs.ensureDirSync(
    `${baseUrl}/resources/maps/src/content/__assets/spritesheets`
  );
  fs.ensureDirSync(`${baseUrl}/resources/maps/src/content/maps/custom`);

  fs.ensureDirSync(`${baseUrl}/resources/content`);
  fs.rmdirSync(`${baseUrl}/resources/content`, { recursive: true });

  const sheets = async () => {
    const spritesheets = ['creatures', 'decor', 'items', 'terrain', 'walls'];

    for await (let sheet of spritesheets) {
      sendToUI('notify', {
        type: 'info',
        text: `Downloading spritesheet "${sheet}"...`,
      });

      try {
        const url = `https://play.rair.land/assets/spritesheets/${sheet}.png`;
        const res = await fetch(url);
        const buffer = Buffer.from(await res.arrayBuffer());

        await fs.writeFile(
          `${baseUrl}/resources/maps/src/content/__assets/spritesheets/${sheet}.png`,
          buffer
        );

        await fs.copyFile(
          `${baseUrl}/resources/maps/src/content/__assets/spritesheets/${sheet}.png`,
          `${baseUrl}/resources/maps/__assets/spritesheets/${sheet}.png`
        );
      } catch (e) {
        sendToUI('notify', {
          type: 'error',
          text: `Error downloading "${sheet}": ${e}`,
        });
        isUpdating = false;
      }
    }
  };

  const json = async () => {
    const jsons = [
      'challenge',
      'effect-data',
      'holidaydescs',
      'items',
      'npc-scripts',
      'npcs',
      'quests',
      'recipes',
      'spawners',
      'spells',
      'traits',
      'trait-trees',
    ];

    for await (let json of jsons) {
      sendToUI('notify', {
        type: 'info',
        text: `Downloading content "${json}"...`,
      });

      try {
        const templateUrl = `https://play.rair.land/assets/content/_output/${json}.json`;
        const templateRes = await fetch(templateUrl);
        const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

        await fs.writeFile(
          `${baseUrl}/resources/json/${json}.json`,
          templateBuffer
        );
      } catch (e) {
        sendToUI('notify', {
          type: 'error',
          text: `Error downloading "${json}": ${e}`,
        });
        isUpdating = false;
      }
    }
  };

  const template = async () => {
    sendToUI('notify', {
      type: 'info',
      text: 'Downloading template & TestArea...',
    });

    try {
      const templateUrl = 'https://server.rair.land/editor/map?map=Template';
      const templateRes = await fetch(templateUrl);
      const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

      await fs.writeFile(
        `${baseUrl}/resources/maps/src/content/maps/custom/Template.json`,
        templateBuffer
      );
    } catch (e) {
      sendToUI('notify', {
        type: 'error',
        text: `Error downloading Template: ${e}`,
      });
      isUpdating = false;
    }

    try {
      const templateUrl = 'https://server.rair.land/editor/map?map=TestArea';
      const templateRes = await fetch(templateUrl);
      const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

      await fs.writeFile(
        `${baseUrl}/resources/maps/src/content/maps/custom/TestArea.json`,
        templateBuffer
      );
    } catch (e) {
      sendToUI('notify', {
        type: 'error',
        text: `Error downloading TestArea: ${e}`,
      });
      isUpdating = false;
    }
  };

  const tiled = async () => {
    sendToUI('notify', { type: 'info', text: 'Downloading Tiled (~65mb)...' });

    try {
      const tiledUrl = 'https://rair.land/Tiled.zip';
      const tiledRes = await fetch(tiledUrl);
      const tiledBuffer = Buffer.from(await tiledRes.arrayBuffer());
      await fs.writeFile(`${baseUrl}/resources/Tiled.zip`, tiledBuffer);

      const adm = new admZip(`${baseUrl}/resources/Tiled.zip`);
      adm.extractAllTo(`${baseUrl}/resources`);

      fs.rmSync(`${baseUrl}/resources/Tiled.zip`);
    } catch (e) {
      sendToUI('notify', {
        type: 'error',
        text: `Error downloading Tiled: ${e}`,
      });
      isUpdating = false;
    }
  };

  const validators = async () => {
    sendToUI('notify', { type: 'info', text: 'Downloading validators...' });
    dlgit(
      'LandOfTheRair/Content',
      `${baseUrl}/resources/content`,
      async () => {}
    );
  };

  await sheets();
  await json();
  await template();
  await tiled();
  await validators();

  fs.writeFileSync(`${baseUrl}/resources/.loaded`, '');

  isUpdating = false;
}
