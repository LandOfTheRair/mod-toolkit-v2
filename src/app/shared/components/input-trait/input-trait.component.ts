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
  selector: 'app-input-trait',
  templateUrl: './input-trait.component.html',
  styleUrl: './input-trait.component.scss',
})
export class InputTraitComponent {
  private electronService = inject(ElectronService);
  private modService = inject(ModService);

  public trait = model.required<string | undefined>();
  public label = input<string>('Trait');
  public change = output<string>();

  public values = computed(() => {
    const traitObj = this.modService.json()['traits'] as Record<string, any>;

    return Object.keys(traitObj ?? {})
      .filter((t) => !traitObj[t].spellGiven)
      .sort()
      .map((t) => ({ value: t, desc: traitObj[t].desc ?? 'No description' }));
  });
}
