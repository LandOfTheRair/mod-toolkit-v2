import { Component, computed } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-cell-icon',
  templateUrl: './cell-icon.component.html',
  styleUrl: './cell-icon.component.scss',
})
export class CellIconComponent implements ICellRendererAngularComp {
  public iconData = computed(() => {
    switch (this.params.type) {
      case 'stemIcon': {
        return {
          icon: this.params.data.all.icon,
          color: this.params.data.all.color,
          bgColor: this.params.data.all.bgColor,
          borderColor: this.params.data.trait?.borderColor,
        };
      }

      case 'achievementIcon': {
        return {
          icon: this.params.data.icon,
          color: this.params.data.iconColor,
          bgColor: this.params.data.iconBgColor,
          borderColor: this.params.data.iconBorderColor,
        };
      }
    }

    return {
      icon: 'uncertainty',
    };
  });

  public params!: any;

  agInit(params: ICellRendererParams) {
    this.params = params;
  }

  refresh(params: ICellRendererParams) {
    this.params = params;
    return true;
  }
}
