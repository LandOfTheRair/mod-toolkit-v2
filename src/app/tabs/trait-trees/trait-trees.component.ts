import { Component, computed } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IModKit, ITraitTree } from '../../../interfaces';
import { defaultTraitTree } from '../../helpers';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = ITraitTree;

@Component({
    selector: 'app-trait-trees',
    templateUrl: './trait-trees.component.html',
    styleUrl: './trait-trees.component.scss',
    standalone: false
})
export class TraitTreesComponent extends EditorBaseTableComponent<EditingType> {
  protected dataKey: keyof Omit<IModKit, 'meta'> = 'traitTrees';

  public defaultData = defaultTraitTree;

  public tableItems = computed(() => this.modService.mod().traitTrees);
  public tableColumns: ColDef[] = [
    {
      field: 'name',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
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
        showEditButton: true,
        editCallback: (item: EditingType) => this.editExisting(item),
        showDeleteButton: true,
        deleteCallback: (item: EditingType) => this.deleteData(item),
      },
    },
  ];
}
