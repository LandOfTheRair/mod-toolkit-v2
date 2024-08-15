import { IDroptable } from '../../interfaces';
import { id } from './id';

export const defaultDroptable: () => IDroptable = () => ({
  _id: id(),
  isGlobal: false,
  mapName: undefined as unknown as string,
  regionName: undefined as unknown as string,
  drops: [],
});
