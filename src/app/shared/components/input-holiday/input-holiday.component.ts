import {
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-holiday',
  templateUrl: './input-holiday.component.html',
  styleUrl: './input-holiday.component.scss',
})
export class InputHolidayComponent {
  private modService = inject(ModService);

  public holiday = model.required<string | undefined>();
  public label = input<string>('Holiday');
  public change = output<string>();

  public values = computed(() => {
    const holidayObj = this.modService
      .mod()
      .cores.find((c) => c.name === 'holidaydescs')?.json as Record<
      string,
      any
    >;
    if (!holidayObj) return this.fallbackValues();

    return Object.keys(holidayObj ?? {})
      .sort()
      .map((t) => ({
        value: t,
        desc: holidayObj[t].duration ?? 'No description',
      }));
  });

  public fallbackValues = computed(() => {
    const holidayObj = this.modService.json()['holidaydescs'] as Record<
      string,
      any
    >;
    return Object.keys(holidayObj ?? {})
      .sort()
      .map((t) => ({
        value: t,
        desc: holidayObj[t].duration ?? 'No description',
      }));
  });

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
