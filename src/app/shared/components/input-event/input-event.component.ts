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
import { IDynamicEventMeta } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

@Component({
    selector: 'app-input-event',
    templateUrl: './input-event.component.html',
    styleUrl: './input-event.component.scss',
    standalone: false
})
export class InputEventComponent implements OnInit {
  private modService = inject(ModService);

  public event = model<IDynamicEventMeta | undefined>();
  public defaultValue = input<string>();
  public label = input<string>('Event');
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();
    const activeDependencies = this.modService.activeDependencies();

    const myModEvents = mod.events.map((i) => ({
      category: `${mod.meta.name} (Current)`,
      data: i,
      value: i.name,
      desc: i.description,
      index: 0,
    }));

    const depEvents = activeDependencies
      .map((dep, idx) =>
        dep.events.map((i) => ({
          category: dep.meta.name,
          data: i,
          value: i.name,
          desc: i.description,
          index: idx + 1,
        }))
      )
      .flat();

    return [...sortBy([...myModEvents, ...depEvents], ['index', 'value'])];
  });

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);
      this.event.set(foundItem as unknown as IDynamicEventMeta);
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
