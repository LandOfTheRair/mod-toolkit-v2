import { Component, computed, inject } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IItemDefinition, IModKit } from '../../../interfaces';
import { defaultItem, id } from '../../helpers';
import { PinpointService } from '../../services/pinpoint.service';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { CellSpriteComponent } from '../../shared/components/cell-sprite/cell-sprite.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = IItemDefinition;

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
  standalone: false,
})
export class ItemsComponent extends EditorBaseTableComponent<EditingType> {
  private pinpointService = inject(PinpointService);

  protected dataKey: keyof Omit<IModKit, 'meta'> = 'items';

  public defaultData = defaultItem;

  public tableItems = computed(() => this.modService.mod().items);
  public tableColumns: ColDef[] = [
    {
      field: 'sprite',
      headerName: '',
      resizable: false,
      sortable: false,
      width: 100,
      cellRenderer: CellSpriteComponent,
      cellRendererParams: { type: 'items' },
    },
    {
      field: 'name',
      flex: 1,
      cellDataType: 'text',
      cellClass: 'leading-4 whitespace-break-spaces',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'itemClass',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'type',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'secondaryType',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'tier',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'requirements.level',
      headerName: 'Level Requirement',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'requirements.baseClass',
      headerName: 'Class Requirement',
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
        showPinpointButton: true,
        pinpointCallback: (item: EditingType) => {
          this.pinpointService.searchItem(item.name);
        },
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

  protected dataEdited(oldItem: EditingType, newItem: EditingType) {
    this.modService.updateItemNameAcrossMod(oldItem.name, newItem.name);

    this.electronService.send('EDIT_MAP_OBJECTS', {
      oldName: oldItem.name,
      newName: newItem.name,
      layer: 8,
      propName: 'requireHeld',
    });

    this.electronService.send('EDIT_MAP_OBJECTS', {
      oldName: oldItem.name,
      newName: newItem.name,
      layer: 9,
      propName: 'peddleItem',
    });
  }
}
