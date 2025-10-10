import { Component, computed } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { ICoreContent, IModKit } from '../../../interfaces';
import { defaultCore } from '../../helpers/core';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = ICoreContent;

@Component({
    selector: 'app-cores',
    templateUrl: './cores.component.html',
    styleUrl: './cores.component.scss',
    standalone: false
})
export class CoresComponent extends EditorBaseTableComponent<EditingType> {
  protected dataKey: keyof Omit<IModKit, 'meta'> = 'cores';

  public defaultData = defaultCore;

  public tableItems = computed(() => this.modService.mod().cores);
  public tableColumns: ColDef[] = [
    {
      field: 'name',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'desc',
      flex: 5,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      cellClass: 'leading-4 whitespace-break-spaces',
      sortable: false,
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
