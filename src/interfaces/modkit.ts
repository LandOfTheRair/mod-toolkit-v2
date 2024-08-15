import { IDroptable } from './droptable';
import { IItemDefinition } from './item';
import { IEditorMap } from './map';
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
  drops: IDroptable[];
  spawners: ISpawnerData[];
  recipes: IRecipe[];
  maps: IEditorMap[];
  quests: IQuest[];
  dialogs: INPCScript[];
}
