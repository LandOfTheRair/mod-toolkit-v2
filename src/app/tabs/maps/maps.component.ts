import {
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ColDef } from 'ag-grid-community';
import { IEditorMap } from '../../../interfaces/map';
import { id } from '../../helpers';
import { ElectronService } from '../../services/electron.service';
import { PinpointService } from '../../services/pinpoint.service';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = IEditorMap;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss',
})
export class MapsComponent extends EditorBaseTableComponent<EditingType> {
  private electronService = inject(ElectronService);
  private pinpointService = inject(PinpointService);

  public newSwal = viewChild<SwalComponent>('newSwal');
  public renameSwal = viewChild<SwalComponent>('renameSwal');
  public importMapButton = viewChild<ElementRef<HTMLInputElement>>('mapUpload');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  public tableItems = computed(() => this.modService.mod().maps);

  public tableColumns: ColDef[] = [
    {
      field: 'name',
      flex: 2,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'map.width',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'map.height',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'map.properties.maxLevel',
      headerName: 'Max Level',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'map.properties.maxSkill',
      headerName: 'Max Skill',
      flex: 1,
      cellDataType: 'number',
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'map.properties.region',
      headerName: 'Region',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'map.properties.creator',
      headerName: 'Creator',
      flex: 1,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: '',
      width: 300,
      sortable: false,
      suppressMovable: true,
      headerComponent: HeaderButtonsComponent,
      headerComponentParams: {
        showNewButton: true,
        newCallback: () => this.createNewDialog(),
        showImportButton: true,
        importCallback: () => this.importDialog(),
      },
      cellRenderer: CellButtonsComponent,
      cellClass: 'no-adjust',
      cellRendererParams: {
        showPinpointButton: true,
        pinpointCallback: (item: EditingType) => {
          this.pinpointService.searchMap(item.name);
        },
        showCopyButton: true,
        copyCallback: (item: EditingType) => this.copyMap(item.name),
        showRenameButton: true,
        renameCallback: (item: EditingType) => this.renameDialog(item),
        showEditButton: true,
        editCallback: (item: EditingType) => this.editExisting(item),
        showDeleteButton: true,
        deleteCallback: (item: EditingType) => this.deleteData(item),
      },
    },
  ];

  public async createNewDialog() {
    const res = await this.newSwal()?.fire();
    const newMapName = res?.value as string;

    if (!newMapName) return;

    this.createMap(newMapName);
  }

  public importDialog() {
    this.importMapButton()?.nativeElement.click();
  }

  private async renameDialog(item: any) {
    const oldName = item.name as string;

    const res = await this.renameSwal()?.fire();
    const newMapName = res?.value as string;

    if (!newMapName) return;

    this.renameMap(oldName, newMapName);
  }

  public importMaps(event: any) {
    const files = event.target.files;

    Array.from(files as ArrayLike<File>).forEach((file: File) => {
      if (!file || file.type !== 'application/json') return;

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = (evt: any) => {
        try {
          const map = JSON.parse(evt.target.result as string);
          const mapName = file.name.split('.')[0];
          this.import({ map, name: mapName, _id: id() });
        } catch (e: any) {
          this.notifyService.error({
            message: `Map upload error: ${e.message}`,
          });
        }
      };

      reader.onerror = () => {
        this.notifyService.error({ message: `Generic map upload error.` });
      };
    });
  }

  private import(mapData: EditingType) {
    this.modService.importMap(mapData);
  }

  private createMap(mapName: string) {
    this.electronService.send('NEW_MAP', {
      name: mapName,
      creator: this.modService.mod().meta.author,
    });
  }

  private renameMap(oldName: string, newName: string) {
    this.electronService.send('RENAME_MAP', {
      newName,
      oldName,
    });
  }

  private copyMap(mapName: string) {
    this.electronService.send('COPY_MAP', {
      mapName,
    });
  }

  public editExisting(data: EditingType) {
    this.electronService.send('EDIT_MAP', data);
  }

  public deleteData(data: EditingType) {
    this.modService.removeMap(data);
    this.electronService.send('REMOVE_MAP', { mapName: data.name });
  }
}
