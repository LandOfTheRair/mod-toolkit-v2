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
import { ISpawnerData } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

type ItemModel = { category: string; data: ISpawnerData; value: string };

@Component({
    selector: 'app-input-spawner',
    templateUrl: './input-spawner.component.html',
    styleUrl: './input-spawner.component.scss',
    standalone: false
})
export class InputSpawnerComponent implements OnInit {
  private modService = inject(ModService);

  public spawner = model<ISpawnerData | undefined>();
  public label = input<string>('Spawner');
  public defaultValue = input<string>();
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();
    const activeDependencies = this.modService.activeDependencies();

    const myModSpawners = mod.spawners.map((i) => ({
      category: `${mod.meta.name} (Current)`,
      data: i,
      value: i.tag,
      index: 0,
    }));

    const depSpawners = activeDependencies
      .map((dep, idx) =>
        dep.spawners.map((i) => ({
          category: dep.meta.name,
          data: i,
          value: i.tag,
          index: idx + 1,
        }))
      )
      .flat();

    return [...sortBy([...myModSpawners, ...depSpawners], ['index', 'value'])];
  });

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);
      this.spawner.set(foundItem as unknown as ISpawnerData);
    }
  }

  public itemCompare(itemA: ItemModel, itemB: ItemModel): boolean {
    return itemA.value === itemB.value;
  }

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
