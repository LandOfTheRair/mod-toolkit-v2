import { effect, Injectable, signal } from '@angular/core';
import { isEqual } from 'lodash';
import { IModKit } from '../../interfaces';
import { formatMod } from '../helpers';

@Injectable({
  providedIn: 'root',
})
export class DiffService {
  private modToCompareAgainst = signal<IModKit | null>(null);
  private myMod = signal<IModKit | null>(null);

  public exportWhenReady = signal<boolean>(false);
  public exportMod = signal<IModKit | null>(null);

  constructor() {
    effect(() => {
      const exportWhenReady = this.exportWhenReady();
      const modToCompareAgainst = this.modToCompareAgainst();
      const myMod = this.myMod();

      if (!exportWhenReady) return;
      if (!modToCompareAgainst) return;
      if (!myMod) return;

      this.saveModDiff();

      this.exportWhenReady.set(false);
    });
  }

  public setMyMod(mod: IModKit): void {
    this.myMod.set(mod);
  }

  public setModToCompareAgainst(mod: IModKit): void {
    this.modToCompareAgainst.set(mod);
  }

  public generateModDiff(): IModKit | null {
    const modToCompareAgainst = this.modToCompareAgainst();
    const myMod = this.myMod();

    if (!modToCompareAgainst) return null;
    if (!myMod) return null;

    const exportMod: IModKit = {
      meta: {
        ...myMod.meta,
        _backup: undefined,
      },
      items: [],
      stems: [],
      maps: [],
      achievements: [],
      cores: [],
      dialogs: [],
      drops: [],
      events: [],
      npcs: [],
      quests: [],
      recipes: [],
      spawners: [],
      traitTrees: [],
    };

    Object.keys(myMod).forEach((container) => {
      if (container === 'meta') return;

      const containerData = myMod[container as keyof IModKit];
      const compareData = modToCompareAgainst[container as keyof IModKit] || [];
      const exportData = exportMod[container as keyof IModKit] || [];

      if (!Array.isArray(containerData)) return;
      if (!Array.isArray(compareData)) return;
      if (!Array.isArray(exportData)) return;

      containerData.forEach((myItem) => {
        const matchingItem = compareData.find((i) => i._id === myItem._id);
        if (!matchingItem) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          exportData.push(myItem as unknown as any);
          return;
        }

        if (isEqual(myItem, matchingItem)) return;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        exportData.push(myItem as unknown as any);
      });
    });

    return exportMod;
  }

  public saveModDiff(): void {
    const diff = this.generateModDiff();
    if (!diff) return;

    const formatted = formatMod(diff, false);
    delete formatted.meta._backup;

    this.exportMod.set(formatted);
  }
}
