import { IDroptable } from '../../interfaces';

export const defaultDroptable: () => IDroptable = () => ({
  isGlobal: false,
  mapName: null as unknown as string,
  maxChance: 0,
  noLuckBonus: false,
  regionName: null as unknown as string,
  requireHoliday: null as unknown as string,
  result: null as unknown as string,
});
