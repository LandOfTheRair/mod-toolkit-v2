import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { IQuest } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-quest',
  templateUrl: './input-quest.component.html',
  styleUrl: './input-quest.component.scss',
})
export class InputQuestComponent implements OnInit {
  private modService = inject(ModService);

  public quest = model<IQuest | undefined>();
  public defaultValue = input<string>();
  public label = input<string>('Quest');
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();

    return [
      ...mod.quests.map((q) => ({
        value: q.name,
        desc: `[${q.giver}] ${q.desc}`,
      })),
    ];
  });

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);
      this.quest.set(foundItem as unknown as IQuest);
    }
  }

  public itemCompare(
    itemA: { value: string; desc: string },
    itemB: { value: string; desc: string }
  ): boolean {
    return itemA.value === itemB.value;
  }

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
