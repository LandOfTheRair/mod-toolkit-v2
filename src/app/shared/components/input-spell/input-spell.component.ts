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
  selector: 'app-input-spell',
  templateUrl: './input-spell.component.html',
  styleUrl: './input-spell.component.scss',
})
export class InputSpellComponent {
  private electronService = inject(ElectronService);
  private modService = inject(ModService);

  public spell = model.required<string | undefined>();
  public label = input<string>('Spell');
  public change = output<string>();

  public values = computed(() => {
    const spellObj = this.modService.json()['spells'] as Record<string, any>;
    return Object.keys(spellObj ?? {}).sort();
  });

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
