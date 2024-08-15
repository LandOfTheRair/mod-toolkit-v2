import { Component, computed, inject } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IModKit, INPCDefinition } from '../../../interfaces';
import { defaultNPC, id } from '../../helpers';
import { ElectronService } from '../../services/electron.service';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { CellSpriteComponent } from '../../shared/components/cell-sprite/cell-sprite.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = INPCDefinition;

@Component({
  selector: 'app-npcs',
  templateUrl: './npcs.component.html',
  styleUrl: './npcs.component.scss',
})
export class NpcsComponent extends EditorBaseTableComponent<EditingType> {
  private electronService = inject(ElectronService);

  protected dataKey: keyof Omit<IModKit, 'meta'> = 'npcs';

  public defaultData = defaultNPC;

  public tableItems = computed(() => this.modService.mod().npcs);
  public tableColumns: ColDef[] = [
    {
      field: 'sprite',
      headerName: '',
      resizable: false,
      sortable: false,
      width: 100,
      cellRenderer: CellSpriteComponent,
      cellRendererParams: { type: 'creatures' },
    },
    {
      field: 'npcId',
      headerName: 'ID',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'level',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'cr',
      headerName: 'Challenge Rating',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'baseClass',
      headerName: 'Class',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'monsterClass',
      headerName: 'Category',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'allegiance',
      headerName: 'Faction',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
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
          newItem.npcId = `${newItem.npcId} (copy)`;
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

  protected dataEdited(oldItem: EditingType, newItem: EditingType) {
    this.modService.updateNPCIdAcrossMod(oldItem.npcId, newItem.npcId);
    this.electronService.send('EDIT_MAP_CREATURE', {
      oldName: oldItem.npcId,
      newName: newItem.npcId,
    });
  }
}
