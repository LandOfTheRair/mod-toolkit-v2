import { Component, computed, signal } from '@angular/core';
import { IDroptable, IItemDefinition } from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-droptables-editor',
  templateUrl: './droptables-editor.component.html',
  styleUrl: './droptables-editor.component.scss',
})
export class DroptablesEditorComponent extends EditorBaseComponent<IDroptable> {
  public currentItem = signal<IItemDefinition | undefined>(undefined);

  public canSave = computed(() => {
    const data = this.editing();
    return (
      (data.mapName || data.regionName || data.isGlobal) &&
      data.maxChance > 0 &&
      data.result
    );
  });
}
