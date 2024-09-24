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
import { IItemDefinition } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

type ItemModel = { category: string; data: IItemDefinition; value: string };

@Component({
  selector: 'app-input-item',
  templateUrl: './input-item.component.html',
  styleUrl: './input-item.component.scss',
})
export class InputItemComponent implements OnInit {
  private modService = inject(ModService);

  public item = model<ItemModel | IItemDefinition | undefined>();
  public label = input<string>('Item');
  public defaultValue = input<string>();
  public allowNone = input<boolean>(false);
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();
    const activeDependencies = this.modService.activeDependencies();

    const myModItems = mod.items.map((i) => ({
      category: `${mod.meta.name} (Current)`,
      data: i,
      value: i.name,
      index: 0,
    }));

    const depItems = activeDependencies
      .map((dep, idx) =>
        dep.items.map((i) => ({
          category: dep.meta.name,
          data: i,
          value: i.name,
          index: idx + 1,
        }))
      )
      .flat();

    return [
      this.allowNone()
        ? { category: 'Default', data: { name: 'none' }, value: 'none' }
        : undefined,
      ...sortBy([...myModItems, ...depItems], ['index', 'value']),
    ]
      .flat()
      .filter(Boolean) as ItemModel[];
  });

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);
      this.item.set(foundItem);
    }
  }

  public itemCompare(itemA: ItemModel, itemB: ItemModel): boolean {
    return itemA.value === itemB.value;
  }

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
