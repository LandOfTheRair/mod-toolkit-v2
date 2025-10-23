import admZip from 'adm-zip';
import dlgit from 'download-github-repo';
import * as fs from 'fs-extra';

import { baseUrl } from '../helpers';
import { mainError, mainLog } from '../helpers/logging';
import { SendToUI } from '../types';

let isUpdating = false;

export async function updateResources(sendToUI: SendToUI) {
  mainLog('Updating resources...');

  if (isUpdating) {
    mainError(new Error('Currently updating, please wait.'));
    return;
  }

  isUpdating = true;

  if (fs.existsSync(`${baseUrl}/resources/.loaded`)) {
    mainLog('Removing previous loaded indicator...');
    fs.rmSync(`${baseUrl}/resources/.loaded`);
  }

  sendToUI('notify', { type: 'info', text: 'Creating directory structure...' });

  fs.ensureDirSync(`${baseUrl}/resources`);
  fs.ensureDirSync(`${baseUrl}/resources/json`);
  fs.ensureDirSync(`${baseUrl}/resources/maps/__assets/spritesheets`);
  fs.ensureDirSync(
    `${baseUrl}/resources/maps/src/content/__assets/spritesheets`,
  );
  fs.ensureDirSync(`${baseUrl}/resources/maps/src/content/maps/custom`);

  fs.ensureDirSync(`${baseUrl}/resources/content`);
  fs.rmdirSync(`${baseUrl}/resources/content`, { recursive: true });
  fs.ensureDirSync(`${baseUrl}/resources/content`);

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
          buffer,
        );

        await fs.copyFile(
          `${baseUrl}/resources/maps/src/content/__assets/spritesheets/${sheet}.png`,
          `${baseUrl}/resources/maps/__assets/spritesheets/${sheet}.png`,
        );

        sendToUI('notify', {
          type: 'success',
          text: `Downloaded spritesheet "${sheet}"!`,
        });
      } catch (e) {
        mainError(e);
        sendToUI('notify', {
          type: 'error',
          text: `Error downloading "${sheet}": ${e}`,
        });
        isUpdating = false;
      }
    }
  };

  const json = async () => {
    const jsons: string[] = [];

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
          templateBuffer,
        );

        sendToUI('notify', {
          type: 'success',
          text: `Downloaded content "${json}"!`,
        });
      } catch (e) {
        mainError(e);
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
      text: 'Downloading map template...',
    });

    try {
      const templateUrl = 'https://server.rair.land/editor/map?map=Template';
      const templateRes = await fetch(templateUrl);
      const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

      await fs.writeFile(
        `${baseUrl}/resources/maps/src/content/maps/custom/Template.json`,
        templateBuffer,
      );

      sendToUI('notify', {
        type: 'success',
        text: `Downloaded map template!`,
      });
    } catch (e) {
      mainError(e);
      sendToUI('notify', {
        type: 'error',
        text: `Error downloading Template: ${e}`,
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

      sendToUI('notify', {
        type: 'success',
        text: `Downloaded Tiled!`,
      });
    } catch (e) {
      mainError(e);
      sendToUI('notify', {
        type: 'error',
        text: `Error downloading Tiled: ${e}`,
      });
      isUpdating = false;
    }
  };

  const assets = async () => {
    sendToUI('notify', { type: 'info', text: 'Downloading assets...' });
    dlgit('LandOfTheRair/Assets', `${baseUrl}/resources/assets`, async () => {
      const allSfx = fs
        .readdirSync(`${baseUrl}/resources/assets/sfx`)
        .map((f) => f.split('.mp3')[0]);
      const allBgm = fs
        .readdirSync(`${baseUrl}/resources/assets/bgm`)
        .map((f) => f.split('.mp3')[0]);
      const allIcon = fs
        .readdirSync(`${baseUrl}/resources/assets/macicons`)
        .map((f) => f.split('.svg')[0]);

      fs.writeJSONSync(`${baseUrl}/resources/json/sfx.json`, allSfx);
      fs.writeJSONSync(`${baseUrl}/resources/json/bgm.json`, allBgm);
      fs.writeJSONSync(`${baseUrl}/resources/json/macicons.json`, allIcon);

      sendToUI('notify', {
        type: 'success',
        text: `Downloaded core assets!`,
      });
    });
  };

  const meta = async () => {
    sendToUI('notify', { type: 'info', text: 'Downloading meta...' });

    try {
      const templateUrl = `https://play.rair.land/assets/generated/modkit-meta.json`;
      const templateRes = await fetch(templateUrl);
      const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

      await fs.writeFile(`${baseUrl}/resources/json/meta.json`, templateBuffer);

      sendToUI('notify', {
        type: 'success',
        text: `Downloaded meta data!`,
      });
    } catch (e) {
      mainError(e);
      sendToUI('notify', {
        type: 'error',
        text: `Error downloading "${json}": ${e}`,
      });
      isUpdating = false;
    }
  };

  await sheets();
  await json();
  await template();
  await tiled();
  await assets();
  await meta();

  fs.writeFileSync(`${baseUrl}/resources/.loaded`, '');

  isUpdating = false;
}
