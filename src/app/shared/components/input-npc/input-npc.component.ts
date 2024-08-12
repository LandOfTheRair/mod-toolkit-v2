import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
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

  public npc = model.required<INPCDefinition | undefined>();
  public label = input<string>('NPC');
  public defaultValue = input<string>();
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();

    return [
      ...mod.npcs.map((i) => ({
        category: 'My Mod NPCs',
        data: i,
        value: i.npcId,
      })),
    ];
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
