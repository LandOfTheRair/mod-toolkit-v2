import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { isUndefined } from 'lodash';
import { LocalStorageService } from 'ngx-webstorage';
import {
  BaseClassType,
  HasIdentification,
  IEditorMap,
  IItemDefinition,
  IModKit,
  IModKitDependency,
  ItemSlotType,
  ModJSON,
  ModJSONKey,
} from '../../interfaces';
import { id } from '../helpers';
import {
  applyLoreScrolls,
  applyTraitScrolls,
  cleanOldLoreScrolls,
  cleanOldTraitScrolls,
  generateLoreScrolls,
  generateTraitScrolls,
} from '../helpers/autocontent';
import { ensureIds } from '../helpers/import';
import { NotifyService } from './notify.service';
import { SettingsService } from './settings.service';

export function defaultModKit(): IModKit {
  return {
    meta: {
      id: id(),
      author: 'Anonymous',
      name: 'Unnamed Mod',
      savedAt: 0,
      version: 1,
      dependencies: [],
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
    cores: [],
    stems: [],
    traitTrees: [],
    achievements: [],
    events: [],
  };
}

@Injectable({
  providedIn: 'root',
})
export class ModService {
  private notifyService = inject(NotifyService);
  private localStorage = inject(LocalStorageService);
  private settingsService = inject(SettingsService);

  public allDependencies = signal<IModKit[]>([]);

  public mod = signal<IModKit>(defaultModKit());
  public modName = computed(() => this.mod().meta.name);
  public modAuthor = computed(() => this.mod().meta.author);

  public availableNPCs = computed(() => [
    ...this.mod().npcs,
    ...this.activeDependencies()
      .map((d) => d.npcs)
      .flat(),
  ]);
  public availableItems = computed(() => [
    ...this.mod().items,
    ...this.activeDependencies()
      .map((d) => d.items)
      .flat(),
  ]);
  public availableMaps = computed(() => this.mod().maps);

  public activeDependencies = computed(() => {
    const myDeps = this.mod().meta.dependencies ?? [];
    return this.allDependencies().filter((f) =>
      myDeps.map((d) => d.name).includes(f.meta.name)
    );
  });

  public availableClasses = computed(() => {
    const settingsJson =
      this.mod().cores.find((f) => f.name === 'settings')?.json ?? {};
    return (settingsJson.character?.allClasses ?? []).sort() as BaseClassType[];
  });

  public json = signal<ModJSON>({
    bgm: [],
    sfx: [],
    macicons: [],
  });

  constructor() {
    const oldModData: IModKit = this.localStorage.retrieve('mod');
    if (oldModData) {
      ensureIds(oldModData);
      this.migrateMod(oldModData);
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

    (window as any).modService = this;
  }

  // mod functions
  public migrateMod(mod: IModKit) {
    const check = defaultModKit();
    mod.meta.dependencies ??= [];

    Object.keys(check).forEach((checkKeyString) => {
      const checkKey = checkKeyString as keyof IModKit;

      if (!isUndefined(mod[checkKey])) return;

      mod[checkKey] = structuredClone(check[checkKey]) as unknown as any;
    });

    mod.events.forEach((m) => delete (m as any).extraData);
  }

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

  public setDependencies(deps: IModKit[]): void {
    this.allDependencies.set(deps);
  }

  public addModDependency(dep: IModKitDependency): void {
    const mod = this.mod();
    mod.meta.dependencies.push(dep);

    this.updateMod(mod);
  }

  public removeModDependency(depName: string): void {
    const mod = this.mod();
    mod.meta.dependencies = mod.meta.dependencies.filter(
      (f) => f.name !== depName
    );

    this.updateMod(mod);
  }

  private presave(mod: IModKit) {
    mod.meta.savedAt = Date.now();

    mod.maps.forEach(({ map }) => {
      map.properties ??= {};
      map.propertytypes ??= {};

      map.properties.creator =
        map.properties.creator || mod.meta.author || 'Unknown';
      map.propertytypes.creator = 'string';
    });
  }

  public importMod(mod: IModKit) {
    console.info(`[MOD:IMPORT]`, mod);

    Object.keys(mod).forEach((modKey) => {
      if (modKey === 'meta') return;
      const key = modKey as keyof Omit<IModKit, 'meta'>;

      if (key === 'maps') {
        mod[key].forEach((map) => {
          this.importMap(map);
        });
        return;
      }

      mod[key].forEach((modEntry) => {
        this.modAdd(key, modEntry);
      });
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

    console.info(`[ENTRY:NEW]`, data);

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

    console.info(`[ENTRY:EDIT]`, oldData, newData);

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

    console.info(`[ENTRY:DELETE]`, data);

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
  public setJSON(key: ModJSONKey, value: any): void {
    const json = this.json();
    json[key] = value;

    this.json.set(structuredClone(json));
  }

  // map functions
  public ensureMapsExist() {
    window.api?.send('ENSURE_MAPS', this.mod().maps);
  }

  public importMap(incomingMap: IEditorMap) {
    this.addMap(incomingMap);
    window.api?.send('ENSURE_MAP', { ...incomingMap });
  }

  public addMap(incomingMap: IEditorMap) {
    if (incomingMap.name === 'Template') return;

    const mod = this.mod();
    if (!mod.meta.name) mod.meta.name = incomingMap.name;

    const existingMap = mod.maps.find((x) => x.name === incomingMap.name);
    if (existingMap) {
      existingMap.map = incomingMap.map;
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

      console.info(
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

        console.info(
          `[Propagate NPC] Updated spawner "${spawner.tag}" NPC: ${oldName} -> ${newName}`
        );
        rollable.result = newName;
      });
    });

    mod.quests.forEach((quest) => {
      quest.requirements.npcIds?.forEach((id, i) => {
        if (id !== oldName) return;

        console.info(
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

      console.info(
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

        console.info(
          `[Propagate Item] Updated containedItems for "${item.name}" item: ${oldName} -> ${newName}`
        );
        rollable.result = newName;
      });
    });

    mod.drops.forEach((droptable) => {
      droptable.drops.forEach((drop) => {
        if (drop.result !== oldName) return;

        console.info(
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

      console.info(
        `[Propagate Item] Updated quest "${quest.name}" item: ${oldName} -> ${newName}`
      );

      quest.requirements.item = newName;
    });

    mod.dialogs.forEach((npcScript) => {
      Object.keys(npcScript.items?.equipment ?? {}).forEach((slot) => {
        const itemSlot = slot as ItemSlotType;
        if (npcScript.items.equipment[itemSlot] !== oldName) return;

        console.info(
          `[Propagate Item] Updated NPC Script "${npcScript.name}" item#${itemSlot}: ${oldName} -> ${newName}`
        );
        npcScript.items.equipment[itemSlot] = newName;
      });
    });

    mod.npcs.forEach((npc) => {
      npc.items?.sack?.forEach((item) => {
        if (item.result !== oldName) return;

        console.info(
          `[Propagate Item] Updated NPC "${npc.npcId}" item in sack: ${oldName} -> ${newName}`
        );

        item.result = newName;
      });

      Object.keys(npc.items?.equipment ?? {}).forEach((slot) => {
        const itemSlot = slot as ItemSlotType;

        npc.items?.equipment?.[itemSlot].forEach((rollable) => {
          if (rollable.result !== oldName) return;

          console.info(
            `[Propagate Item] Updated NPC "${npc.npcId}" item#${itemSlot}: ${oldName} -> ${newName}`
          );

          rollable.result = newName;
        });
      });

      npc.drops?.forEach((rollable) => {
        if (rollable.result !== oldName) return;

        console.info(
          `[Propagate Item] Updated NPC "${npc.npcId}" drop: ${oldName} -> ${newName}`
        );

        rollable.result = newName;
      });

      npc.dropPool?.items?.forEach((rollable) => {
        if (rollable.result !== oldName) return;

        console.info(
          `[Propagate Item] Updated NPC "${npc.npcId}" dropPool: ${oldName} -> ${newName}`
        );

        rollable.result = newName;
      });

      if (npc.tansFor === oldName) {
        console.info(
          `[Propagate Item] Updated NPC "${npc.npcId}" tans for item: ${oldName} -> ${newName}`
        );

        npc.tansFor = newName;
      }
    });

    mod.recipes.forEach((recipe) => {
      if (recipe.item === oldName) {
        console.info(
          `[Propagate Item] Updated recipe "${recipe.name}" result item: ${oldName} -> ${newName}`
        );

        recipe.item = newName;
      }

      if (recipe.transferOwnerFrom === oldName) {
        console.info(
          `[Propagate Item] Updated recipe "${recipe.name}" transfer owner item: ${oldName} -> ${newName}`
        );

        recipe.transferOwnerFrom = newName;
      }

      const ingredients = recipe.ingredients;
      ingredients?.forEach((ing, i) => {
        if (ing !== oldName) return;

        console.info(
          `[Propagate Item] Updated recipe "${recipe.name}" ingredient#${i}: ${oldName} -> ${newName}`
        );

        ingredients[i] = newName;
      });

      recipe.ozIngredients?.forEach((ing) => {
        if (ing.display !== oldName) return;
        console.info(
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

  // autogenerated
  public updateAutogenerated() {
    const mod = this.mod();

    const loreItems = generateLoreScrolls(mod);
    cleanOldLoreScrolls(mod);
    applyLoreScrolls(mod, loreItems);

    this.notifyService.info({
      message: `Created and updated ${loreItems.length} lore scrolls.`,
    });

    const runeItems = generateTraitScrolls(mod);
    cleanOldTraitScrolls(mod);
    applyTraitScrolls(mod, runeItems);

    this.notifyService.info({
      message: `Created and updated ${runeItems.length} rune scrolls.`,
    });

    this.updateMod(mod);
  }
}
