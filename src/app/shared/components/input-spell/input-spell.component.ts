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
  selector: 'app-input-spell',
  templateUrl: './input-spell.component.html',
  styleUrl: './input-spell.component.scss',
})
export class InputSpellComponent {
  private modService = inject(ModService);

  public spell = model.required<string | undefined>();
  public label = input<string>('Spell');
  public change = output<string>();

  public values = computed(() => {
    const baseSpells = this.modService
      .mod()
      .stems.filter((s) => s._hasSpell)
      .map((s) => s._gameId);
    if (baseSpells.length === 0) return this.fallbackValues();

    return baseSpells.sort();
  });

  public fallbackValues = computed(() => {
    const spellObj = this.modService.json()['spells'] as Record<string, any>;
    return Object.keys(spellObj ?? {}).sort();
  });

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
