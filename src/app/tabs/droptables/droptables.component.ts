import { Component, computed } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IDroptable, IModKit } from '../../../interfaces';
import { defaultDroptable } from '../../helpers';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { CellSpriteComponent } from '../../shared/components/cell-sprite/cell-sprite.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = IDroptable;

@Component({
  selector: 'app-droptables',
  templateUrl: './droptables.component.html',
  styleUrl: './droptables.component.scss',
})
export class DroptablesComponent extends EditorBaseTableComponent<EditingType> {
  protected dataKey: keyof Omit<IModKit, 'meta'> = 'drops';

  public defaultData = defaultDroptable;

  public canEdit = computed(
    () =>
      this.modService.availableItems().length > 0 &&
      this.modService.availableMaps().length > 0
  );
  public tableItems = computed(() => this.modService.mod().drops);
  public tableColumns: ColDef[] = [
    {
      field: 'sprite',
      headerName: '',
      resizable: false,
      sortable: false,
      width: 100,
      cellRenderer: CellSpriteComponent,
      cellRendererParams: { type: 'items', fromResult: true },
    },
    {
      field: 'result',
      headerName: 'Item',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'maxChance',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
      valueFormatter: (v) => `1/${v.value}`,
    },
    {
      field: 'mapName',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'regionName',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'isGlobal',
      flex: 1,
      cellDataType: 'boolean',
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
        showCopyButton: false,
        showEditButton: true,
        editCallback: (item: EditingType) => this.editExisting(item),
        showDeleteButton: true,
        deleteCallback: (item: EditingType) => this.deleteData(item),
      },
    },
  ];
}
