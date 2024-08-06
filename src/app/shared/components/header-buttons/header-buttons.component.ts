import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

type AllHeaderParams = IHeaderParams & {
  showNewButton: boolean;
  newCallback: () => void;
};

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrl: './header-buttons.component.scss',
})
export class HeaderButtonsComponent implements IHeaderAngularComp {
  public params!: AllHeaderParams;

  agInit(params: AllHeaderParams) {
    this.params = params;
  }

  refresh(params: AllHeaderParams) {
    this.params = params;
    return true;
  }
}
