import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { IRecipe } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

type RecipeModel = { category: string; data: IRecipe; value: string };

@Component({
  selector: 'app-input-recipe',
  templateUrl: './input-recipe.component.html',
  styleUrl: './input-recipe.component.scss',
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
    const learnable = this.onlyLearnable();

    return [
      ...mod.recipes
        .filter((i) => (learnable ? i.requireLearn : true))
        .map((i) => ({
          category: 'My Mod Recipes',
          data: i,
          value: i.name,
        })),
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
