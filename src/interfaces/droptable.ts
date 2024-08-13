import { HasIdentification } from './identified';

export interface IDroptable extends HasIdentification {
  result: string;
  maxChance: number;
  noLuckBonus: boolean;
  mapName: string;
  regionName: string;
  requireHoliday: string;
  isGlobal: boolean;
}

export interface IDroptableMap {
  mapName: string;
  drops: IDroptable[];
}

export interface IDroptableRegion {
  regionName: string;
  drops: IDroptable[];
}
