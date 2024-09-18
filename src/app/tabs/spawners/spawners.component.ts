import { Component, computed, inject } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IModKit, ISpawnerData } from '../../../interfaces';
import { defaultSpawner, id } from '../../helpers';
import { ElectronService } from '../../services/electron.service';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = ISpawnerData;

@Component({
  selector: 'app-spawners',
  templateUrl: './spawners.component.html',
  styleUrl: './spawners.component.scss',
})
export class SpawnersComponent extends EditorBaseTableComponent<EditingType> {
  private electronService = inject(ElectronService);

  protected dataKey: keyof Omit<IModKit, 'meta'> = 'spawners';

  public defaultData = defaultSpawner;

  public canEdit = computed(() => this.modService.availableNPCs().length > 0);
  public tableItems = computed(() => this.modService.mod().spawners);
  public tableColumns: ColDef[] = [
    {
      field: 'tag',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'respawnRate',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
      valueFormatter: (v) => `${v.value}sec`,
    },
    {
      field: 'npcIds',
      headerName: 'NPCs',
      cellClass: 'leading-4 whitespace-break-spaces',
      flex: 1,
      cellDataType: 'text',
      sortable: false,
      filter: 'agTextColumnFilter',
      cellRenderer: (v: any) => {
        const data = v.data as ISpawnerData;

        return data.npcIds.map((d) => d.result).join(', ');
      },
    },
    {
      field: 'isDangerous',
      headerName: 'Is Dangerous',
      flex: 1,
      cellDataType: 'boolean',
    },
    {
      field: 'requireHoliday',
      headerName: 'Holiday',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: '',
      width: 250,
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
          newItem.tag = `${newItem.tag} (copy)`;
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
    this.electronService.send('EDIT_MAP_OBJECTS', {
      oldName: oldItem.tag,
      newName: newItem.tag,
      layer: 10,
      propName: 'tag',
    });
  }
}
