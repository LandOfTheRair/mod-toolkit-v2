import * as fs from 'fs-extra';

export function saveSpecificJSON(path: string, json: any) {
  fs.writeJSONSync(path, json, { spaces: 2, EOL: '\n' });
}
