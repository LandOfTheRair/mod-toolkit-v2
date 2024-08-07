import * as fs from 'fs-extra';

import { baseUrl } from '../helpers';

export function loadJSON(json: any) {
  const file = `${baseUrl}/resources/json/${json}.json`;

  if (!fs.existsSync(file)) {
    throw new Error(`Attempting to load invalid or absent JSON: ${json}`);
  }

  return fs.readJsonSync(file);
}
