import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
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

  public item = model.required<IItemDefinition | undefined>();
  public label = input<string>('Item');
  public defaultValue = input<string>();
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();

    return [
      ...mod.items.map((i) => ({
        category: 'My Mod Items',
        data: i,
        value: i.name,
      })),
    ];
  });

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);
      this.item.set(foundItem as unknown as IItemDefinition);
    }
  }

  public itemCompare(itemA: ItemModel, itemB: ItemModel): boolean {
    return itemA.value === itemB.value;
  }

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
