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
  selector: 'app-input-gameevent',
  templateUrl: './input-gameevent.component.html',
  styleUrl: './input-gameevent.component.scss',
})
export class InputGameeventComponent {
  private modService = inject(ModService);

  public gameEvent = model.required<string | undefined>();
  public label = input<string>('In-Game Event');
  public change = output<string>();

  public values = computed(() => {
    const eventObj = this.modService
      .mod()
      .cores.find((c) => c.name === 'events')?.json as Record<string, any>;
    if (!eventObj) return [];

    return Object.keys(eventObj ?? {})
      .sort()
      .map((t) => ({
        value: t,
        desc: eventObj[t].description ?? 'No description',
      }));
  });

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
