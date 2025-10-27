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
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-spell',
  templateUrl: './input-spell.component.html',
  styleUrl: './input-spell.component.scss',
  standalone: false,
})
export class InputSpellComponent implements OnInit {
  private modService = inject(ModService);

  public spell = model.required<string | undefined>();
  public label = input<string>('Spell');
  public change = output<string>();
  public defaultValue = input<string>();
  public allowMacro = input<boolean>();

  public values = computed(() => {
    const allowMacros = this.allowMacro();

    const baseSpells = this.modService.mod().stems.filter((s) => {
      if (allowMacros && s._hasMacro) return true;

      return s._hasSpell;
    });

    const traitTrees = this.modService.mod().traitTrees;
    const traitsInEachTree: Record<string, string[]> = {};

    traitTrees.forEach((tree) => {
      Object.keys(tree.data.trees).forEach((treeName) => {
        const subtree = tree.data.trees[treeName];
        subtree.tree.forEach((level) => {
          level.traits.forEach((traitData) => {
            if (!traitData.name) return;

            traitsInEachTree[traitData.name] ??= [];
            traitsInEachTree[traitData.name].push(
              `Class - ${tree.name} - ${treeName}`,
            );
          });
        });
      });
    });

    const spellsOrdered = baseSpells.flatMap((spell) => {
      const trees = traitsInEachTree[spell._gameId] ?? ['Other'];
      return trees.flatMap((tree) => ({
        value: spell._gameId,
        desc: spell.all.desc,
        group: tree,
      }));
    });

    return sortBy(spellsOrdered, ['group', 'value']);
  });

  public search(
    term: string,
    item: { value: string; group: string; desc: string },
  ) {
    return (
      item.value.toLowerCase().includes(term.toLowerCase()) ||
      item.group.toLowerCase().includes(term.toLowerCase())
    );
  }

  ngOnInit() {
    const defaultValue = this.defaultValue();
    if (defaultValue) {
      this.spell.set(defaultValue);
    }
  }
}
