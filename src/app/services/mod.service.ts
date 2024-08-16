import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import {
  HasIdentification,
  IEditorMap,
  IItemDefinition,
  IModKit,
  ItemSlotType,
} from '../../interfaces';
import { id } from '../helpers';
import { SettingsService } from './settings.service';

export function defaultModKit(): IModKit {
  return {
    meta: {
      id: id(),
      author: 'Anonymous',
      name: 'Unnamed Mod',
      savedAt: 0,
      version: 1,
      _backup: undefined,
    },
    dialogs: [],
    drops: [],
    items: [],
    maps: [],
    npcs: [],
    quests: [],
    recipes: [],
    spawners: [],
  };
}

@Injectable({
  providedIn: 'root',
})
export class ModService {
  private localStorage = inject(LocalStorageService);
  private settingsService = inject(SettingsService);

  public mod = signal<IModKit>(defaultModKit());
  public modName = computed(() => this.mod().meta.name);
  public modAuthor = computed(() => this.mod().meta.author);

  public availableNPCs = computed(() => this.mod().npcs);
  public availableItems = computed(() => this.mod().items);
  public availableMaps = computed(() => this.mod().maps);

  public json = signal<Record<string, any>>({});

  constructor() {
    const oldModData: IModKit = this.localStorage.retrieve('mod');
    if (oldModData) {
      this.updateMod(oldModData);
    }

    effect(
      () => {
        const newModData = this.mod();
        this.settingsService.createSettingsForMod(newModData.meta.id);
        this.localStorage.store('mod', newModData);
      },
      { allowSignalWrites: true }
    );

    this.ensureMapsExist();
  }

  // mod functions
  public resetMod(): void {
    this.updateMod(defaultModKit());
  }

  public setName(newName: string): void {
    const mod = this.mod();
    mod.meta.name = newName;

    this.updateMod(mod);
  }

  public setAuthor(newAuthor: string): void {
    const mod = this.mod();
    mod.meta.author = newAuthor;

    this.updateMod(mod);
  }

  private presave(mod: IModKit) {
    mod.meta.savedAt = Date.now();

    mod.maps.forEach(({ map }) => {
      map.properties ??= {};
      map.propertytypes ??= {};

      map.properties.creator = mod.meta.author || 'Unknown';
      map.propertytypes.creator = 'string';
    });
  }

  public updateMod(mod: IModKit) {
    this.presave(mod);
    console.info('[UpdateMod]', mod);

    this.mod.set(structuredClone(mod));
  }

  public modAdd<T extends HasIdentification>(
    key: keyof Omit<IModKit, 'meta'>,
    data: T
  ) {
    const mod = this.mod();
    const arr = mod[key] as unknown as T[];

    console.log(`[ENTRY:NEW]`, data);

    arr.push(data);
    this.updateMod(mod);
  }

  public modEdit<T extends HasIdentification>(
    key: keyof Omit<IModKit, 'meta'>,
    oldData: T,
    newData: T
  ) {
    const mod = this.mod();
    const arr = mod[key] as unknown as T[];

    console.log(`[ENTRY:EDIT]`, oldData, newData);

    const foundItemIdx = arr.findIndex((i) => i._id === oldData._id);
    if (foundItemIdx === -1) return;

    arr[foundItemIdx] = newData;

    this.updateMod(mod);
  }

  public modDelete<T extends HasIdentification>(
    key: keyof Omit<IModKit, 'meta'>,
    data: T
  ) {
    const mod = this.mod();
    const arr = mod[key] as unknown as T[];

    console.log(`[ENTRY:DELETE]`, data);

    (mod[key] as unknown as T[]) = arr.filter((i) => i._id !== data._id);

    this.updateMod(mod);
  }

  public doesExistDuplicate<T extends HasIdentification>(
    containerKey: keyof Omit<IModKit, 'meta'>,
    checkProp: keyof T,
    checkValue: string,
    myId: T['_id']
  ): boolean {
    return !!(this.mod()[containerKey] as unknown as T[]).find(
      (t) => t._id !== myId && t[checkProp] === checkValue
    );
  }

  // json functions
  public setJSON(key: string, value: any): void {
    const json = this.json();
    json[key] = value;

    this.json.set(structuredClone(json));
  }

  // map functions
  private ensureMapsExist() {
    this.mod().maps.forEach((map) => {
      window.api.send('ENSURE_MAP', { ...map });
    });
  }

  public importMap(incomingMap: IEditorMap) {
    this.addMap(incomingMap);
    window.api.send('ENSURE_MAP', { ...incomingMap });
  }

  public addMap(incomingMap: IEditorMap) {
    if (incomingMap.name === 'Template') return;

    const mod = this.mod();
    if (!mod.meta.name) mod.meta.name = incomingMap.name;

    const existingMap = mod.maps.findIndex((x) => x.name === incomingMap.name);
    if (existingMap !== -1) {
      mod.maps.splice(existingMap, 1, incomingMap);
    } else {
      mod.maps.push(incomingMap);
    }

    this.updateMod(mod);
  }

  public copyMap(mapName: string) {
    const mod = this.mod();

    const existingMap = mod.maps.find((x) => x.name === mapName);
    if (!existingMap) return;

    const newMap = structuredClone(existingMap);
    newMap.name = `${mapName} (copy)`;

    mod.maps.push(newMap);

    this.updateMod(mod);
  }

  public renameMap(oldName: string, newName: string) {
    if (oldName === 'Template') return;

    const mod = this.mod();
    const mapRef = mod.maps.find((f) => f.name === oldName);
    if (!mapRef) return;

    mapRef.name = newName;

    this.updateMapNameAcrossMod(oldName, newName);
    this.updateMod(mod);
  }

  private updateMapNameAcrossMod(oldName: string, newName: string) {
    const mod = this.mod();
    mod.drops.forEach((droptable) => {
      if (droptable.mapName !== oldName) return;

      console.log(
        `[Propagate Map] Updated droptable "${droptable.mapName}" Map: ${oldName} -> ${newName}`
      );
      droptable.mapName = newName;
    });

    this.updateMod(mod);
  }

  public removeMap(removeMap: IEditorMap) {
    const mod = this.mod();
    const existingMap = mod.maps.findIndex((x) => x.name === removeMap.name);
    if (existingMap !== -1) {
      mod.maps.splice(existingMap, 1);
    }

    this.updateMod(mod);
  }

  // npc functions
  public updateNPCIdAcrossMod(oldName: string, newName: string) {
    if (oldName === newName) return;

    const mod = this.mod();

    mod.spawners.forEach((spawner) => {
      spawner.npcIds.forEach((rollable) => {
        if (rollable.result !== oldName) return;

        console.log(
          `[Propagate NPC] Updated spawner "${spawner.tag}" NPC: ${oldName} -> ${newName}`
        );
        rollable.result = newName;
      });
    });

    mod.quests.forEach((quest) => {
      quest.requirements.npcIds.forEach((id, i) => {
        if (id !== oldName) return;

        console.log(
          `[Propagate NPC] Updated quest "${quest.name}" NPC: ${oldName} -> ${newName}`
        );
        quest.requirements.npcIds[i] = newName;
      });
    });

    this.mod.set(mod);
  }

  // quest functions
  public updateQuestNameAcrossMod(oldName: string, newName: string) {
    if (oldName === newName) return;

    const mod = this.mod();

    mod.items.forEach((item) => {
      if (item.requirements?.quest !== oldName) return;

      console.log(
        `[Propagate Quest] Updated requirements.quest for "${item.name}" item: ${oldName} -> ${newName}`
      );
      item.requirements.quest = newName;
    });

    this.mod.set(mod);
  }

  // item functions
  public updateItemNameAcrossMod(oldName: string, newName: string) {
    if (oldName === newName) return;

    const mod = this.mod();

    mod.items.forEach((item) => {
      const contained = item.containedItems;
      if (!contained) return;

      contained.forEach((rollable) => {
        if (rollable.result !== oldName) return;

        console.log(
          `[Propagate Item] Updated containedItems for "${item.name}" item: ${oldName} -> ${newName}`
        );
        rollable.result = newName;
      });
    });

    mod.drops.forEach((droptable) => {
      droptable.drops.forEach((drop) => {
        if (drop.result !== oldName) return;

        console.log(
          `[Propagate Item] Updated droptable for "${
            droptable.mapName ||
            droptable.regionName ||
            (droptable.isGlobal ? 'global' : '')
          }" item: ${oldName} -> ${newName}`
        );

        drop.result = newName;
      });
    });

    mod.quests.forEach((quest) => {
      if (quest.requirements.item !== oldName) return;

      console.log(
        `[Propagate Item] Updated quest "${quest.name}" item: ${oldName} -> ${newName}`
      );

      quest.requirements.item = newName;
    });

    mod.dialogs.forEach((npcScript) => {
      Object.keys(npcScript.items.equipment).forEach((slot) => {
        const itemSlot = slot as ItemSlotType;
        if (npcScript.items.equipment[itemSlot] !== oldName) return;

        console.log(
          `[Propagate Item] Updated NPC Script "${npcScript.name}" item#${itemSlot}: ${oldName} -> ${newName}`
        );
        npcScript.items.equipment[itemSlot] = newName;
      });
    });

    mod.npcs.forEach((npc) => {
      npc.items.sack.forEach((item) => {
        if (item.result !== oldName) return;

        console.log(
          `[Propagate Item] Updated NPC "${npc.npcId}" item in sack: ${oldName} -> ${newName}`
        );

        item.result = newName;
      });

      Object.keys(npc.items.equipment).forEach((slot) => {
        const itemSlot = slot as ItemSlotType;

        npc.items.equipment[itemSlot].forEach((rollable) => {
          if (rollable.result !== oldName) return;

          console.log(
            `[Propagate Item] Updated NPC "${npc.npcId}" item#${itemSlot}: ${oldName} -> ${newName}`
          );

          rollable.result = newName;
        });
      });

      npc.drops.forEach((rollable) => {
        if (rollable.result !== oldName) return;

        console.log(
          `[Propagate Item] Updated NPC "${npc.npcId}" drop: ${oldName} -> ${newName}`
        );

        rollable.result = newName;
      });

      npc.dropPool.items.forEach((rollable) => {
        if (rollable.result !== oldName) return;

        console.log(
          `[Propagate Item] Updated NPC "${npc.npcId}" dropPool: ${oldName} -> ${newName}`
        );

        rollable.result = newName;
      });

      if (npc.tansFor === oldName) {
        console.log(
          `[Propagate Item] Updated NPC "${npc.npcId}" tans for item: ${oldName} -> ${newName}`
        );

        npc.tansFor = newName;
      }
    });

    mod.recipes.forEach((recipe) => {
      if (recipe.item === oldName) {
        console.log(
          `[Propagate Item] Updated recipe "${recipe.name}" result item: ${oldName} -> ${newName}`
        );

        recipe.item = newName;
      }

      if (recipe.transferOwnerFrom === oldName) {
        console.log(
          `[Propagate Item] Updated recipe "${recipe.name}" transfer owner item: ${oldName} -> ${newName}`
        );

        recipe.transferOwnerFrom = newName;
      }

      const ingredients = recipe.ingredients;
      ingredients?.forEach((ing, i) => {
        if (ing !== oldName) return;

        console.log(
          `[Propagate Item] Updated recipe "${recipe.name}" ingredient#${i}: ${oldName} -> ${newName}`
        );

        ingredients[i] = newName;
      });

      recipe.ozIngredients?.forEach((ing) => {
        if (ing.display !== oldName) return;
        console.log(
          `[Propagate Item] Updated recipe "${recipe.name}" ozIngredient: ${oldName} -> ${newName}`
        );

        ing.display = newName;
      });
    });

    this.mod.set(mod);
  }

  public findItemByName(itemName: string): IItemDefinition | undefined {
    const items = this.availableItems();
    return items.find((i) => i.name === itemName);
  }
}
