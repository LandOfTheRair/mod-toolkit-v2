import {
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { ElectronService } from '../../../services/electron.service';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-holiday',
  templateUrl: './input-holiday.component.html',
  styleUrl: './input-holiday.component.scss',
})
export class InputHolidayComponent {
  private electronService = inject(ElectronService);
  private modService = inject(ModService);

  public holiday = model.required<string | undefined>();
  public label = input<string>('Holiday');
  public change = output<string>();

  public values = computed(() => {
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
