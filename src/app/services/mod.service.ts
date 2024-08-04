import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { IModKit } from '../../interfaces';

export function defaultModKit(): IModKit {
  return {
    meta: {
      author: 'Anonymous',
      name: 'Unnamed Mod',
      savedAt: 0,
      version: 1,
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

  private updateMod(mod: IModKit) {
    this.presave(mod);
    console.info('[UpdateMod]', mod);

    this.mod.set(structuredClone(mod));
  }
}
