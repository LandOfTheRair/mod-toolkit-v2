import { Component, inject } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { ElectronService } from '../../../services/electron.service';

type AllHeaderParams = IHeaderParams & {
  showNewButton: boolean;
  newCallback: () => void;
  showImportButton: boolean;
  importCallback: () => void;
};

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrl: './header-buttons.component.scss',
})
export class HeaderButtonsComponent implements IHeaderAngularComp {
  public electronService = inject(ElectronService);

  public params!: AllHeaderParams;

  agInit(params: AllHeaderParams) {
    this.params = params;
  }

  refresh(params: AllHeaderParams) {
    this.params = params;
    return true;
  }

  resetTableFilters() {
    this.params.api.setFilterModel(null);
  }
}
