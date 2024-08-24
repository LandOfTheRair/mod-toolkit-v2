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
})
export class InputSpawnerComponent implements OnInit {
  private modService = inject(ModService);

  public spawner = model<ISpawnerData | undefined>();
  public label = input<string>('Spawner');
  public defaultValue = input<string>();
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();

    return [
      ...sortBy(
        mod.spawners.map((i) => ({
          category: 'My Mod Spawners',
          data: i,
          value: i.tag,
        })),
        'value'
      ),
    ]
      .flat()
      .filter(Boolean) as ItemModel[];
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
