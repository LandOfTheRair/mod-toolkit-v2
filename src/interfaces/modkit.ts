import { Rollable } from './building-blocks';
import { IItemDefinition } from './item';
import { INPCDefinition } from './npc';
import { INPCScript } from './npcscript';
import { IQuest } from './quest';
import { IRecipe } from './recipe';
import { ISpawnerData } from './spawner';

export interface IModKit {
  meta: {
    name: string;
    author: string;
    version: number;
    savedAt: number;
    _backup: any;
  };

  npcs: INPCDefinition[];
  items: IItemDefinition[];
  drops: Array<{ mapName?: string; regionName?: string; drops: Rollable[] }>;
  spawners: ISpawnerData[];
  recipes: IRecipe[];
  maps: any[];
  quests: IQuest[];
  dialogs: INPCScript[];
}
