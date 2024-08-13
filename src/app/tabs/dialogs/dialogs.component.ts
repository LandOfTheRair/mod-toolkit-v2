import { Component, computed } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IModKit, INPCScript } from '../../../interfaces';
import { defaultNPCScript } from '../../helpers/dialog';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = INPCScript;
@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
  styleUrl: './dialogs.component.scss',
})
export class DialogsComponent extends EditorBaseTableComponent<EditingType> {
  protected dataKey: keyof Omit<IModKit, 'meta'> = 'dialogs';

  public defaultData = defaultNPCScript;

  public tableItems = computed(() => this.modService.mod().dialogs);
  public tableColumns: ColDef[] = [
    {
      field: 'tag',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'name',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'affiliation',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'level',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
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
