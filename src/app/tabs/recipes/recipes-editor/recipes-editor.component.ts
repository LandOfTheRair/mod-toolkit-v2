import { Component, computed, OnInit, signal } from '@angular/core';
import {
  BaseClass,
  BaseClassType,
  IItemDefinition,
  IRecipe,
} from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-recipes-editor',
  templateUrl: './recipes-editor.component.html',
  styleUrl: './recipes-editor.component.scss',
})
export class RecipesEditorComponent
  extends EditorBaseComponent<IRecipe>
  implements OnInit
{
  public currentItem = signal<IItemDefinition | undefined>(undefined);
  public transferItem = signal<IItemDefinition | undefined>(undefined);
  public requiredClass = signal<BaseClassType | undefined>(undefined);
  public ingredients = Array(8)
    .fill(undefined)
    .map(() => signal<IItemDefinition | undefined>(undefined));
  public ozIngredients = Array(4)
    .fill(undefined)
    .map(() => signal<IItemDefinition | undefined>(undefined));

  public canSave = computed(() => {
    const data = this.editing();
    return (
      data.category &&
      data.name &&
      data.recipeType &&
      data.item &&
      this.satisfiesUnique()
    );
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<IRecipe>(
      'recipes',
      'name',
      data.name,
      data._id
    );
  });

  ngOnInit() {
    const item = this.editing();
    this.extractProps(item);

    this.editing.set(item);

    super.ngOnInit();
  }

  private extractProps(item: IRecipe) {
    this.requiredClass.set(item.requireClass?.[0]);
    this.currentItem.set(this.modService.findItemByName(item.item));

    item.ingredients ??= [];

    item.ozIngredients ??= [];
    item.ozIngredients[0] ??= { filter: '', display: '', ounces: 0 };
    item.ozIngredients[1] ??= { filter: '', display: '', ounces: 0 };
    item.ozIngredients[2] ??= { filter: '', display: '', ounces: 0 };
    item.ozIngredients[3] ??= { filter: '', display: '', ounces: 0 };
  }

  private assignProps(item: IRecipe) {
    item.requireClass = [this.requiredClass()].filter(Boolean) as BaseClass[];

    item.ozIngredients ??= [];
    item.ozIngredients = item.ozIngredients.filter(
      (o) => o.display && o.filter && o.ounces > 0
    );

    if (item.ozIngredients.length === 0) {
      delete item.ozIngredients;
    }
  }

  public doSave() {
    const item = this.editing();
    this.assignProps(item);

    this.editing.set(item);

    super.doSave();
  }
}
