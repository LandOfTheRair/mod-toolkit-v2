import { Component, computed, signal } from '@angular/core';
import { sortBy } from 'lodash';
import {
  Holiday,
  IDroptable,
  IItemDefinition,
  Rollable,
} from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-droptables-editor',
  templateUrl: './droptables-editor.component.html',
  styleUrl: './droptables-editor.component.scss',
})
export class DroptablesEditorComponent extends EditorBaseComponent<IDroptable> {
  public currentItem = signal<IItemDefinition | undefined>(undefined);

  public canSave = computed(() => {
    const data = this.editing();
    return (
      (data.isGlobal || data.mapName || data.regionName) &&
      data.drops.length > 0
    );
  });

  public addItem(item: IItemDefinition | undefined) {
    if (!item) return;

    this.editing.update((droptable) => ({
      ...droptable,
      drops: [
        ...droptable.drops,
        {
          chance: 1,
          maxChance: 100,
          result: item.name,
          noLuckBonus: false,
          requireHoliday: undefined as unknown as Holiday,
        },
      ],
    }));
  }

  public removeItem(item: string) {
    this.editing.update((npc) => {
      const newNpc = { ...npc };
      newNpc.drops = newNpc.drops.filter((d) => d.result !== item);
      return newNpc;
    });
  }

  public hasItem(item: IItemDefinition | undefined) {
    if (!item) return false;
    return this.editing().drops.some((d) => d.result === item.name);
  }

  public sortDrops(drops: Rollable[]): Rollable[] {
    return sortBy(drops, 'result');
  }
}
