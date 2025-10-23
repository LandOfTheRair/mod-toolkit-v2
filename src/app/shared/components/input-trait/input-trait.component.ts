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
  standalone: false,
})
export class InputTraitComponent {
  private modService = inject(ModService);

  public trait = model.required<string | undefined>();
  public label = input<string>('Trait');
  public change = output<string>();
  public allowSpells = input<boolean>(false);

  public values = computed(() => {
    const allowSpells = this.allowSpells();

    const baseTraits = this.modService.mod().stems.filter((s) => {
      if (!s._hasTrait) return false;

      return allowSpells ? true : !s._hasSpell;
    });

    const traitTrees = this.modService.mod().traitTrees;
    const traitsInEachTree: Record<string, string[]> = {};

    traitTrees.forEach((tree) => {
      Object.keys(tree.data.trees).forEach((treeName) => {
        const subtree = tree.data.trees[treeName];
        subtree.tree.forEach((level) => {
          level.traits.forEach((traitData) => {
            if (!traitData.name) return;

            if (tree.name === 'Core') {
              traitsInEachTree[traitData.name] ??= [];
              traitsInEachTree[traitData.name].push(`Shared - Core`);
              return;
            }

            if (traitData.isAncient) {
              traitsInEachTree[traitData.name] ??= [];
              traitsInEachTree[traitData.name].push(`Shared - Ancient`);
              return;
            }

            traitsInEachTree[traitData.name] ??= [];
            traitsInEachTree[traitData.name].push(
              `Class - ${tree.name} - ${treeName}`,
            );
          });
        });
      });
    });

    const traitsOrdered = baseTraits.flatMap((trait) => {
      const trees = traitsInEachTree[trait._gameId] ?? ['Other'];
      return trees.flatMap((tree) => ({
        value: trait._gameId,
        desc: trait.all.desc,
        group: tree,
      }));
    });

    return sortBy(traitsOrdered, ['group', 'value']);
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
}
