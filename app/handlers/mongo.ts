import admZip from 'adm-zip';
import * as fs from 'fs-extra';

import { baseUrl } from '../helpers';
import { mainError } from '../helpers/logging';
import { SendToUI } from '../types';

export async function downloadMongo(sendToUI: SendToUI) {
  sendToUI('notify', { type: 'info', text: 'Downloading MongoDB (~300mb)...' });

  try {
    if (fs.existsSync(`${baseUrl}/resources/mongodb`)) {
      fs.removeSync(`${baseUrl}/resources/mongodb`);
    }

    if (
      fs.existsSync(`${baseUrl}/resources/mongodb-win32-x86_64-windows-5.0.6`)
    ) {
      fs.removeSync(`${baseUrl}/resources/mongodb-win32-x86_64-windows-5.0.6`);
    }

    const mongoUrl =
      'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-5.0.6.zip';
    const mongoRes = await fetch(mongoUrl);
    const mongoBuffer = Buffer.from(await mongoRes.arrayBuffer());
    fs.writeFileSync(`${baseUrl}/resources/MongoDB.zip`, mongoBuffer);

    const adm = new admZip(`${baseUrl}/resources/MongoDB.zip`);
    adm.extractAllTo(`${baseUrl}/resources`);

    fs.removeSync(`${baseUrl}/resources/MongoDB.zip`);

    fs.renameSync(
      `${baseUrl}/resources/mongodb-win32-x86_64-windows-5.0.6`,
      `${baseUrl}/resources/mongodb`,
    );
    fs.ensureDirSync(`${baseUrl}/resources/mongodb/data`);
    fs.ensureDirSync(`${baseUrl}/resources/mongodb/data/db`);
  } catch (e) {
    mainError(e);
    sendToUI('notify', { type: 'error', text: 'MongoDB download failed!' });
  }
}
