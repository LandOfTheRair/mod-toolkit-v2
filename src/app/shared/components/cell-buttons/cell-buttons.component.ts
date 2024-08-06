import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-cell-buttons',
  templateUrl: './cell-buttons.component.html',
  styleUrl: './cell-buttons.component.scss',
})
export class CellButtonsComponent implements ICellRendererAngularComp {
  public params!: any;

  agInit(params: ICellRendererParams) {
    this.params = params;
  }

  refresh(params: ICellRendererParams) {
    this.params = params;
    return true;
  }
}
