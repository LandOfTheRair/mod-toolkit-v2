import { Rollable } from './building-blocks';
import { HasIdentification } from './identified';

export interface IDroptable extends HasIdentification {
  mapName?: string;
  regionName?: string;
  isGlobal?: boolean;

  drops: Rollable[];
}
