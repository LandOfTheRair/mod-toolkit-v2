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
import { IQuest } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

@Component({
    selector: 'app-input-quest',
    templateUrl: './input-quest.component.html',
    styleUrl: './input-quest.component.scss',
    standalone: false
})
export class InputQuestComponent implements OnInit {
  private modService = inject(ModService);

  public quest = model<IQuest | undefined>();
  public defaultValue = input<string>();
  public label = input<string>('Quest');
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();
    const activeDependencies = this.modService.activeDependencies();

    const myModQuests = mod.quests.map((i) => ({
      category: `${mod.meta.name} (Current)`,
      data: i,
      value: i.name,
      desc: `[${i.giver}] ${i.desc}`,
      index: 0,
    }));

    const depQuests = activeDependencies
      .map((dep, idx) =>
        dep.quests.map((i) => ({
          category: dep.meta.name,
          data: i,
          value: i.name,
          desc: `[${i.giver}] ${i.desc}`,
          index: idx + 1,
        }))
      )
      .flat();

    return [...sortBy([...myModQuests, ...depQuests], ['index', 'value'])];
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
