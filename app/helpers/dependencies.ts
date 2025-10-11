import * as fs from 'fs-extra';
import recursiveReadDir from 'recursive-readdir';
import { SendToUI } from '../types';
import { baseUrl } from './constants';
import { mainError } from './logging';

const depDir = `${baseUrl}/resources/dependencies`;

export async function addDependency(sendToUI: SendToUI, data: any) {
  sendToUI('notify', {
    type: 'info',
    text: `Attempting to download mod dependency ${data}`,
  });

  try {
    const res = await fetch(data);
    const resJson = await res.json();

    if (
      !resJson.meta ||
      !resJson.meta.name ||
      !resJson.meta.author ||
      !resJson.meta.savedAt ||
      !resJson.meta.version
    ) {
      sendToUI('notify', {
        type: 'error',
        text: 'Malformed mod!',
      });
      return;
    }

    resJson.meta._url = data;

    fs.ensureDirSync(depDir);
    fs.writeJSONSync(`${depDir}/${resJson.meta.name}.rairmod`, resJson);

    getAndSendDependencies(sendToUI);

    sendToUI('notify', {
      type: 'success',
      text: `Got dependency mod "${resJson.meta.name}"!`,
    });

    sendToUI('adddependency', { name: resJson.meta.name, url: data });
  } catch (e) {
    mainError(e);
    sendToUI('notify', {
      type: 'error',
      text: 'Malformed mod URL!',
    });
  }
}

export async function getAndSendDependencies(sendToUI: SendToUI) {
  const deps = await getDependencies();
  sendToUI('dependencies', deps);
}

export async function getDependencies() {
  fs.ensureDirSync(depDir);

  const allDeps = await recursiveReadDir(depDir);
  const allDepData = allDeps
    .filter((f) => f.includes('rairmod'))
    .map((f) => fs.readJSONSync(f));

  return allDepData;
}
