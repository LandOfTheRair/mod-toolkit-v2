import { Component, computed } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IModKit, IQuest } from '../../../interfaces';
import { defaultQuest } from '../../helpers';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = IQuest;

@Component({
  selector: 'app-quests',
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
})
export class QuestsComponent extends EditorBaseTableComponent<EditingType> {
  protected dataKey: keyof Omit<IModKit, 'meta'> = 'quests';

  public defaultData = defaultQuest;

  public canEdit = computed(
    () =>
      this.modService.availableItems().length > 0 &&
      this.modService.availableNPCs().length > 0
  );
  public tableItems = computed(() => this.modService.mod().quests);
  public tableColumns: ColDef[] = [
    {
      field: 'name',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'giver',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'requirements.type',
      headerName: 'Type',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'isDaily',
      headerName: 'Daily',
      flex: 1,
      cellDataType: 'boolean',
    },
    {
      field: 'isRepeatable',
      headerName: 'Repeatable',
      flex: 1,
      cellDataType: 'boolean',
    },
    {
      field: 'rewards',
      headerName: 'Rewards',
      flex: 1,
      cellDataType: 'boolean',
      cellClass: 'leading-4 whitespace-break-spaces',
      sortable: false,
      cellRenderer: (v: any) => {
        const data = v.data as IQuest;

        return data.rewards
          .map((r) => `+${r.value} ${r.statName ? r.statName : r.type}`)
          .join(', ');
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

  protected dataEdited(oldItem: EditingType, newItem: EditingType) {
    this.modService.updateQuestNameAcrossMod(oldItem.name, newItem.name);
  }
}
