import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { ModService } from '../../../services/mod.service';

@Component({
    selector: 'app-input-spell',
    templateUrl: './input-spell.component.html',
    styleUrl: './input-spell.component.scss',
    standalone: false
})
export class InputSpellComponent implements OnInit {
  private modService = inject(ModService);

  public spell = model.required<string | undefined>();
  public label = input<string>('Spell');
  public change = output<string>();
  public defaultValue = input<string>();
  public allowMacro = input<boolean>();

  public values = computed(() => {
    const baseSpells = this.modService
      .mod()
      .stems.filter((s) => s._hasSpell || (this.allowMacro() && s._hasMacro))
      .map((s) => s._gameId);

    return baseSpells.sort();
  });

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }

  ngOnInit() {
    const defaultValue = this.defaultValue();
    if (defaultValue) {
      this.spell.set(defaultValue);
    }
  }
}
