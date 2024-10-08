import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { sortBy } from 'lodash';
import { INPCDefinition } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

type NPCModel = { category: string; data: INPCDefinition; value: string };

@Component({
  selector: 'app-input-npc',
  templateUrl: './input-npc.component.html',
  styleUrl: './input-npc.component.scss',
})
export class InputNpcComponent implements OnInit {
  private modService = inject(ModService);

  public npc = model<INPCDefinition | undefined>();
  public label = input<string>('NPC');
  public defaultValue = input<string>();
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();
    const activeDependencies = this.modService.activeDependencies();

    const myModNPCs = mod.npcs.map((i) => ({
      category: `${mod.meta.name} (Current)`,
      data: i,
      value: i.npcId,
      index: 0,
    }));

    const depNPCs = activeDependencies
      .map((dep, idx) =>
        dep.npcs.map((i) => ({
          category: dep.meta.name,
          data: i,
          value: i.npcId,
          index: idx + 1,
        }))
      )
      .flat();

    return [...sortBy([...myModNPCs, ...depNPCs], ['index', 'value'])];
  });

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);
      this.npc.set(foundItem as unknown as INPCDefinition);
    }
  }

  public npcCompare(itemA: NPCModel, itemB: NPCModel): boolean {
    return itemA.value === itemB.value;
  }

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
