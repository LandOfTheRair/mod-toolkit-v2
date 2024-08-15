import { ISpawnerData } from '../../../interfaces';

export function formatSpawners(spawners: ISpawnerData[]): ISpawnerData[] {
  return spawners.map((spawner) => {
    delete spawner._paths;
    return spawner;
  });
}
