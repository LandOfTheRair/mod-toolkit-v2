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
    selector: 'app-input-sfx',
    templateUrl: './input-sfx.component.html',
    styleUrl: './input-sfx.component.scss',
    standalone: false
})
export class InputSfxComponent {
  private modService = inject(ModService);

  public sfx = model.required<string | undefined>();
  public change = output<string>();

  public label = input<string>('SFX');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  public values = computed(() => this.modService.json()['sfx']);
}
