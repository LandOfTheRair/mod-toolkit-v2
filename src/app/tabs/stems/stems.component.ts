import {
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { ColDef } from 'ag-grid-community';

import { IModKit } from '../../../interfaces';
import { ISTEM } from '../../../interfaces/stem';
import { id } from '../../helpers';
import { defaultSTEM } from '../../helpers/stem';
import { PinpointService } from '../../services/pinpoint.service';
import { CellButtonsComponent } from '../../shared/components/cell-buttons/cell-buttons.component';
import { CellIconComponent } from '../../shared/components/cell-icon/cell-icon.component';
import { EditorBaseTableComponent } from '../../shared/components/editor-base-table/editor-base-table.component';
import { HeaderButtonsComponent } from '../../shared/components/header-buttons/header-buttons.component';

type EditingType = ISTEM;

@Component({
  selector: 'app-stems',
  templateUrl: './stems.component.html',
  styleUrl: './stems.component.scss',
})
export class StemsComponent extends EditorBaseTableComponent<EditingType> {
  private pinpointService = inject(PinpointService);

  protected dataKey: keyof Omit<IModKit, 'meta'> = 'stems';
  public importSTEMButton =
    viewChild<ElementRef<HTMLInputElement>>('stemUpload');

  public defaultData = defaultSTEM;

  public tableItems = computed(() => this.modService.mod().stems);
  public tableColumns: ColDef[] = [
    {
      field: 'icon',
      headerName: '',
      resizable: false,
      sortable: false,
      width: 100,
      cellRenderer: CellIconComponent,
      cellRendererParams: { type: 'stemIcon' },
    },
    {
      field: 'name',
      flex: 2,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sort: 'asc',
    },
    {
      field: 'all.desc',
      headerName: 'Description',
      cellClass: 'leading-4 whitespace-break-spaces',
      flex: 5,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      sortable: false,
    },
    {
      field: '_hasSpell',
      headerName: 'Has Spell?',
      flex: 1,
      cellDataType: 'boolean',
    },
    {
      field: '_hasTrait',
      headerName: 'Has Trait?',
      flex: 1,
      cellDataType: 'boolean',
    },
    {
      field: '_hasEffect',
      headerName: 'Has Effect?',
      flex: 1,
      cellDataType: 'boolean',
    },
    {
      field: '_hasMacro',
      headerName: 'Has Macro?',
      flex: 1,
      cellDataType: 'boolean',
    },
    {
      field: '_isNPCOnly',
      headerName: 'NPC Only?',
      flex: 1,
      cellDataType: 'boolean',
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
        showImportButton: false,
        importCallback: () => this.importSTEMButton()?.nativeElement.click(),
      },
      cellRenderer: CellButtonsComponent,
      cellClass: 'no-adjust',
      cellRendererParams: {
        showPinpointButton: true,
        pinpointCallback: (item: EditingType) => {
          this.pinpointService.searchSTEM(item._gameId);
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

  public importPartialSTEMs(event: any) {
    const files = event.target.files;

    Array.from(files as ArrayLike<File>).forEach((file: File) => {
      if (!file || file.type !== 'application/json') return;

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = (evt: any) => {
        try {
          const stems = JSON.parse(evt.target.result as string);
          stems.forEach((stem: ISTEM) => {
            stem._id = stem._id ?? id();
            this.modService.modAdd<ISTEM>(this.dataKey, stem);
          });
        } catch (e: any) {
          this.notifyService.error({
            message: `STEM upload error: ${e.message}`,
          });
        }
      };

      reader.onerror = () => {
        this.notifyService.error({ message: `Generic STEM upload error.` });
      };
    });
  }
}
