import { ICoreContent } from './core';
import { IDroptable } from './droptable';
import { IItemDefinition } from './item';
import { IEditorMap } from './map';
import { INPCDefinition } from './npc';
import { INPCScript } from './npcscript';
import { IQuest } from './quest';
import { IRecipe } from './recipe';
import { ISpawnerData } from './spawner';
import { ISTEM } from './stem';
import { ITraitTree } from './trait-tree';

export interface IModKit {
  meta: {
    id: string;
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
  cores: ICoreContent[];
  stems: ISTEM[];
  traitTrees: ITraitTree[];
}
