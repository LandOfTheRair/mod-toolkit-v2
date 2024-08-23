import {
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { sortBy } from 'lodash';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-trait',
  templateUrl: './input-trait.component.html',
  styleUrl: './input-trait.component.scss',
})
export class InputTraitComponent {
  private modService = inject(ModService);

  public trait = model.required<string | undefined>();
  public label = input<string>('Trait');
  public change = output<string>();
  public allowSpells = input<boolean>(false);

  public values = computed(() => {
    const allowSpells = this.allowSpells();

    const baseTraits = this.modService
      .mod()
      .stems.filter((s) => (s._hasTrait && allowSpells ? true : !s._hasSpell));
    if (baseTraits.length === 0) return this.fallbackValues();

    return sortBy(
      baseTraits.map((t) => ({
        value: t._gameId,
        desc: t.all.desc,
      })),
      'value'
    );
  });

  public fallbackValues = computed(() => {
    const traitObj = this.modService.json()['traits'] as Record<string, any>;

    return Object.keys(traitObj ?? {})
      .filter((t) => !traitObj[t].spellGiven)
      .sort()
      .map((t) => ({ value: t, desc: traitObj[t].desc ?? 'No description' }));
  });
}
