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
import { ISTEM } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

@Component({
    selector: 'app-input-stem',
    templateUrl: './input-stem.component.html',
    styleUrl: './input-stem.component.scss',
    standalone: false
})
export class InputStemComponent implements OnInit {
  private modService = inject(ModService);

  public stem = model<ISTEM | undefined>();
  public defaultValue = input<string>();
  public label = input<string>('STEM');
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();

    return [
      ...sortBy(
        mod.stems.map((q) => ({
          value: q._gameId,
          desc: q.all.desc,
        })),
        'value'
      ),
    ];
  });

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);
      this.stem.set(foundItem as unknown as ISTEM);
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
