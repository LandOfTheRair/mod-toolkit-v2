import { IAchievement } from './achievement';
import { ICoreContent } from './core';
import { IDroptable } from './droptable';
import { IDynamicEventMeta } from './dynamicevent';
import { IItemDefinition } from './item';
import { IEditorMap } from './map';
import { INPCDefinition } from './npc';
import { INPCScript } from './npcscript';
import { IQuest } from './quest';
import { IRecipe } from './recipe';
import { ISpawnerData } from './spawner';
import { ISTEM } from './stem';
import { ITraitTree } from './trait-tree';

export type ModJSONStringKey = 'bgm' | 'sfx' | 'macicons';
export type ModJSONKey = ModJSONStringKey | 'meta';
export type ModJSON = Record<ModJSONStringKey, string[]> & {
  meta: { items: number; creatures: number };
};

export interface IModKitDependency {
  url: string;
  name: string;
}

export interface IModKit {
  meta: {
    id: string;
    name: string;
    author: string;
    version: number;
    savedAt: number;
    dependencies: IModKitDependency[];
    _url?: string;
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
  achievements: IAchievement[];
  events: IDynamicEventMeta[];
}
