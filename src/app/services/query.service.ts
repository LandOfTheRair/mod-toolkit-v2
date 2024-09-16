import { computed, inject, Injectable, signal } from '@angular/core';
import { IModKit } from '../../interfaces';
import { ModService } from './mod.service';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private modService = inject(ModService);

  public isQuerying = signal<boolean>(false);

  public modForJSModifiable = computed(() => this.modService.mod());
  public modForJS = computed(() => structuredClone(this.modService.mod()));
  public modForSQL = computed(() => {
    const mod = structuredClone(this.modService.mod());
    return [
      ...mod.cores.map((c) => ({ type: 'core', data: c })),
      ...mod.dialogs.map((c) => ({ type: 'dialog', data: c })),
      ...mod.drops.map((c) => ({ type: 'drop', data: c })),
      ...mod.items.map((c) => ({ type: 'item', data: c })),
      ...mod.maps.map((c) => ({ type: 'map', data: c })),
      ...mod.npcs.map((c) => ({ type: 'npc', data: c })),
      ...mod.quests.map((c) => ({ type: 'quest', data: c })),
      ...mod.recipes.map((c) => ({ type: 'recipe', data: c })),
      ...mod.spawners.map((c) => ({ type: 'spawner', data: c })),
      ...mod.stems.map((c) => ({ type: 'stem', data: c })),
      ...mod.traitTrees.map((c) => ({ type: 'traitTree', data: c })),
    ];
  });

  public toggleQuerying(newSetting = !this.isQuerying()) {
    this.isQuerying.set(newSetting);
  }

  public updateMod(newMod: IModKit) {
    this.modService.updateMod(newMod);
  }
}
