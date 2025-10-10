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
import { IRecipe } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

type RecipeModel = { category: string; data: IRecipe; value: string };

@Component({
    selector: 'app-input-recipe',
    templateUrl: './input-recipe.component.html',
    styleUrl: './input-recipe.component.scss',
    standalone: false
})
export class InputRecipeComponent implements OnInit {
  private modService = inject(ModService);

  public recipe = model<IRecipe | undefined>();
  public label = input<string>('Recipe');
  public defaultValue = input<string>();
  public onlyLearnable = input<boolean>(false);
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();
    const activeDependencies = this.modService.activeDependencies();

    const myModRecipes = mod.recipes.map((i) => ({
      category: `${mod.meta.name} (Current)`,
      data: i,
      value: i.name,
      index: 0,
    }));

    const depRecipes = activeDependencies
      .map((dep, idx) =>
        dep.recipes.map((i) => ({
          category: dep.meta.name,
          data: i,
          value: i.name,
          index: idx + 1,
        }))
      )
      .flat();

    const learnable = this.onlyLearnable();

    return [
      ...sortBy(
        [...myModRecipes, ...depRecipes].filter((i) =>
          learnable ? i.data.requireLearn : true
        ),
        ['index', 'value']
      ),
    ];
  });

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);
      this.recipe.set(foundItem as unknown as IRecipe);
    }
  }

  public recipeCompare(itemA: RecipeModel, itemB: RecipeModel): boolean {
    return itemA.value === itemB.value;
  }

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
