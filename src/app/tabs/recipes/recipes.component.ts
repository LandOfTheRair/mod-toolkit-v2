import { Component, computed } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IModKit, IRecipe } from '../../../interfaces';
import { defaultRecipe } from '../../helpers';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { CellSpriteComponent } from '../../shared/components/cell-sprite/cell-sprite.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = IRecipe;

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss',
})
export class RecipesComponent extends EditorBaseTableComponent<EditingType> {
  protected dataKey: keyof Omit<IModKit, 'meta'> = 'recipes';

  public defaultData = defaultRecipe;

  public canEdit = computed(() => this.modService.availableItems().length > 1);
  public tableItems = computed(() => this.modService.mod().recipes);
  public tableColumns: ColDef[] = [
    {
      field: 'sprite',
      headerName: '',
      resizable: false,
      sortable: false,
      width: 100,
      cellRenderer: CellSpriteComponent,
      cellRendererParams: { type: 'items', fromItem: true },
    },
    {
      field: 'item',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'name',
      headerName: 'Display Name',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'category',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'recipeType',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'ingredients',
      flex: 1,
      cellDataType: 'text',
      cellClass: 'leading-4 whitespace-break-spaces',
      sortable: false,
      filter: 'agTextColumnFilter',
      cellRenderer: (v: any) => {
        const data = v.data as IRecipe;
        const ingText = data.ingredients || [];
        const ozText = (data.ozIngredients || [])
          .filter((i) => i.ounces > 0)
          .map((i) => `${i.display} (${i.ounces}oz)`);

        return [...ingText, ...ozText].filter(Boolean).join(', ');
      },
    },
    {
      field: '',
      width: 200,
      sortable: false,
      suppressMovable: true,
      headerComponent: HeaderButtonsComponent,
      headerComponentParams: {
        showNewButton: true,
        newCallback: () => this.createNew(),
      },
      cellRenderer: CellButtonsComponent,
      cellClass: 'no-adjust',
      cellRendererParams: {
        showCopyButton: false,
        showEditButton: true,
        editCallback: (item: EditingType) => this.editExisting(item),
        showDeleteButton: true,
        deleteCallback: (item: EditingType) => this.deleteData(item),
      },
    },
  ];
}
