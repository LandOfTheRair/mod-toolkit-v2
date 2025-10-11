import * as fs from 'fs-extra';

import { baseUrl } from '../helpers';
import { mainError } from '../helpers/logging';
import { SendToUI } from '../types';

export async function downloadRair(sendToUI: SendToUI) {
  sendToUI('notify', {
    type: 'info',
    text: 'Downloading Rair Server (~70mb)...',
  });

  try {
    if (fs.existsSync(`${baseUrl}/resources/rair`)) {
      fs.removeSync(`${baseUrl}/resources/rair`);
    }

    fs.mkdirSync(`${baseUrl}/resources/rair`);

    const releaseUrl =
      'https://api.github.com/repos/LandOfTheRair/landoftherair/releases/latest';
    const releaseRes = await fetch(releaseUrl);
    const releaseData = await releaseRes.json();

    const serverUrl = releaseData.assets.find(
      (x: any) => x.name === 'lotr-server.exe',
    ).browser_download_url;
    const serverRes = await fetch(serverUrl);
    const serverBuffer = Buffer.from(await serverRes.arrayBuffer());
    fs.writeFileSync(`${baseUrl}/resources/rair/lotr-server.exe`, serverBuffer);
  } catch (e) {
    mainError(e);
    sendToUI('notify', { type: 'error', text: 'Rair Server download failed!' });
  }
}
