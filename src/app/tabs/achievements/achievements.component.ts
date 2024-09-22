import { Component, computed } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IAchievement, IModKit } from '../../../interfaces';
import { defaultAchievement, id } from '../../helpers';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { CellIconComponent } from '../../shared/components/cell-icon/cell-icon.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = IAchievement;

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.scss',
})
export class AchievementsComponent extends EditorBaseTableComponent<EditingType> {
  protected dataKey: keyof Omit<IModKit, 'meta'> = 'achievements';

  public defaultData = defaultAchievement;

  public tableItems = computed(() => this.modService.mod().achievements);
  public tableColumns: ColDef[] = [
    {
      field: 'icon',
      headerName: '',
      resizable: false,
      sortable: false,
      width: 100,
      cellRenderer: CellIconComponent,
      cellRendererParams: { type: 'achievementIcon' },
    },
    {
      field: 'name',
      flex: 2,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'desc',
      headerName: 'Description',
      flex: 5,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      cellClass: 'leading-4 whitespace-break-spaces',
      sortable: false,
    },
    {
      field: 'ap',
      headerName: 'AP',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'activationType',
      headerName: 'Type',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'shareWithParty',
      headerName: 'Party?',
      flex: 1,
      cellDataType: 'boolean',
    },
    {
      field: 'hidden',
      headerName: 'Hidden?',
      flex: 1,
      cellDataType: 'boolean',
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
        showCopyButton: true,
        copyCallback: (item: EditingType) => {
          const newItem = structuredClone(item);
          newItem.name = `${newItem.name} (copy)`;
          newItem._id = id();
          this.saveNewData(newItem);
        },
        showEditButton: true,
        editCallback: (item: EditingType) => this.editExisting(item),
        showDeleteButton: true,
        deleteCallback: (item: EditingType) => this.deleteData(item),
      },
    },
  ];
}
