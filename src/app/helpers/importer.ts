import { IModKit } from '../../interfaces';
import { ensureIds } from './import';

export function importMod(mod: IModKit): IModKit {
  ensureIds(mod);

  return mod;
}

export function importExportedMod(mod: IModKit): IModKit {
  ensureIds(mod);

  return mod;
}
