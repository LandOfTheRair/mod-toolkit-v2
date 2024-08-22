import { Component, viewChild } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-cell-buttons',
  templateUrl: './cell-buttons.component.html',
  styleUrl: './cell-buttons.component.scss',
})
export class CellButtonsComponent implements ICellRendererAngularComp {
  public params!: any;

  public deleteWarnSwal = viewChild<SwalComponent>('deleteItem');

  agInit(params: ICellRendererParams) {
    this.params = params;
  }

  refresh(params: ICellRendererParams) {
    this.params = params;
    return true;
  }

  async attemptDelete($event: any) {
    const holdingShift = $event.shiftKey;
    if (!holdingShift) {
      await this.deleteWarnSwal()?.fire();
      return;
    }

    this.params.deleteCallback?.(this.params.data);
  }
}
