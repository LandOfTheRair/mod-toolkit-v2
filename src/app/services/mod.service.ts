import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { IItemDefinition, IModKit } from '../../interfaces';

export function defaultModKit(): IModKit {
  return {
    meta: {
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

  public mod = signal<IModKit>(defaultModKit());
  public modName = computed(() => this.mod().meta.name);
  public modAuthor = computed(() => this.mod().meta.author);

  public json = signal<Record<string, any>>({});

  constructor() {
    const oldModData: IModKit = this.localStorage.retrieve('mod');
    if (oldModData) {
      this.updateMod(oldModData);
    }

    effect(() => {
      const newModData = this.mod();
      this.localStorage.store('mod', newModData);
    });

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
      map.properties = map.properties || {};
      map.propertytypes = map.propertytypes || {};

      map.properties.creator = mod.meta.author || 'Unknown';
      map.propertytypes.creator = 'string';
    });
  }

  public updateMod(mod: IModKit) {
    this.presave(mod);
    console.info('[UpdateMod]', mod);

    this.mod.set(structuredClone(mod));
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

  public importMap(incomingMap: { name: string; map: any }) {
    this.addMap(incomingMap);
    window.api.send('ENSURE_MAP', { ...incomingMap });
  }

  public addMap(incomingMap: { name: string; map: any }) {
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

      droptable.mapName = newName;
    });

    this.updateMod(mod);
  }

  public removeMap(removeMap: { name: string; map: any }) {
    const mod = this.mod();
    const existingMap = mod.maps.findIndex((x) => x.name === removeMap.name);
    if (existingMap !== -1) {
      mod.maps.splice(existingMap, 1);
    }

    this.updateMod(mod);
  }

  // item functions
  public addItem(item: IItemDefinition) {
    const mod = this.mod();
    mod.items.push(item);

    this.updateMod(mod);
  }

  public editItem(oldItem: IItemDefinition, newItem: IItemDefinition) {
    const mod = this.mod();
    const foundItemIdx = mod.items.findIndex((i) => i.name === oldItem.name);
    if (foundItemIdx === -1) return;

    mod.items[foundItemIdx] = newItem;

    this.updateMod(mod);
  }

  public removeItem(item: IItemDefinition) {
    const mod = this.mod();
    mod.items = mod.items.filter((i) => i !== item);

    this.updateMod(mod);
  }
}
