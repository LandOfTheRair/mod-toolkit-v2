import { Component, input, output } from '@angular/core';
import {
  ColDef,
  FilterChangedEvent,
  FilterModel,
  GridReadyEvent,
} from 'ag-grid-community';

@Component({
  selector: 'app-editor-view-table',
  templateUrl: './editor-view-table.component.html',
  styleUrl: './editor-view-table.component.scss',
})
export class EditorViewTableComponent {
  public tableItems = input<any[]>([]);
  public dataType = input<string>('');
  public tableColumns = input<ColDef[]>([]);
  public showImport = input<boolean>(false);
  public defaultFilterState = input<FilterModel | undefined>();

  public create = output<void>();
  public import = output<void>();
  public filterChanged = output<FilterChangedEvent>();

  onInitialize($event: GridReadyEvent) {
    $event.api.setFilterModel(this.defaultFilterState() ?? {});
  }
}
