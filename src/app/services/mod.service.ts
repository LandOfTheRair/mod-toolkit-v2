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
  public addMap(map: any) {
    if (map.name === 'Template') return;

    const mod = this.mod();
    mod.maps.push(map);

    this.updateMod(mod);
  }

  public renameMap(oldName: string, newName: string) {
    if (oldName === 'Template') return;

    const mod = this.mod();
    const mapRef = mod.maps.find((f) => f.name === oldName);
    if (!mapRef) return;

    mapRef.name = newName;

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
