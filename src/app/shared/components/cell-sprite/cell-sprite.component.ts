import { Component, computed, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-cell-sprite',
  templateUrl: './cell-sprite.component.html',
  styleUrl: './cell-sprite.component.scss',
})
export class CellSpriteComponent implements ICellRendererAngularComp {
  private modService = inject(ModService);
  public spriteId = computed(() => {
    const allItems = this.modService.availableItems();

    if (this.params.fromResult) {
      return (
        allItems.find((f) => f.name === this.params.data.result)?.sprite ?? -1
      );
    }

    if (this.params.fromItem) {
      return (
        allItems.find((f) => f.name === this.params.data.item)?.sprite ?? -1
      );
    }

    return this.params.data.sprite as number;
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
