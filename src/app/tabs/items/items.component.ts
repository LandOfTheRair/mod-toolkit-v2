import { Component, computed, inject, signal } from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IItemDefinition } from '../../../interfaces';
import { defaultItem } from '../../helpers';
import { ModService } from '../../services/mod.service';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { CellSpriteComponent } from '../../shared/components/cell-sprite/cell-sprite.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = IItemDefinition;

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
})
export class ItemsComponent {
  private modService = inject(ModService);

  public readonly dataType = 'items';

  public isEditing = signal<boolean>(false);
  public oldData = signal<EditingType | undefined>(undefined);
  public editingData = signal<EditingType>(defaultItem());

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
          this.saveNewData(newItem);
        },
        showEditButton: true,
        editCallback: (item: EditingType) => this.editExisting(item),
        showDeleteButton: true,
        deleteCallback: (item: EditingType) => this.deleteData(item),
      },
    },
  ];

  public createNew() {
    this.isEditing.set(true);
    this.editingData.set(defaultItem());
  }

  public editExisting(data: EditingType) {
    this.isEditing.set(true);
    this.oldData.set(structuredClone(data));
    this.editingData.set(data);
  }

  public cancelEditing() {
    this.isEditing.set(false);
  }

  public saveNewData(data: EditingType) {
    this.isEditing.set(false);

    const oldItem = this.oldData();
    if (oldItem) {
      this.oldData.set(undefined);
      this.modService.editItem(oldItem, data);
      return;
    }

    this.modService.addItem(data);
  }

  public deleteData(data: EditingType) {
    this.modService.removeItem(data);
  }
}
