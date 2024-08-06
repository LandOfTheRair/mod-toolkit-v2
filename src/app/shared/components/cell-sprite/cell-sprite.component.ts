import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-cell-sprite',
  templateUrl: './cell-sprite.component.html',
  styleUrl: './cell-sprite.component.scss',
})
export class CellSpriteComponent implements ICellRendererAngularComp {
  public params!: any;

  agInit(params: ICellRendererParams) {
    this.params = params;
  }

  refresh(params: ICellRendererParams) {
    this.params = params;
    return true;
  }
}
