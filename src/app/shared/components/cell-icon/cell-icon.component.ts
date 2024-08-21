import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-cell-icon',
  templateUrl: './cell-icon.component.html',
  styleUrl: './cell-icon.component.scss',
})
export class CellIconComponent implements ICellRendererAngularComp {
  public params!: any;

  agInit(params: ICellRendererParams) {
    this.params = params;
  }

  refresh(params: ICellRendererParams) {
    this.params = params;
    return true;
  }
}
