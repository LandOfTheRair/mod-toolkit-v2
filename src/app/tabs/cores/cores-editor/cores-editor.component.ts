import { Component, computed, signal } from '@angular/core';
import { ICoreContent } from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-cores-editor',
  templateUrl: './cores-editor.component.html',
  styleUrl: './cores-editor.component.scss',
})
export class CoresEditorComponent extends EditorBaseComponent<ICoreContent> {
  public currentItem = signal<ICoreContent | undefined>(undefined);

  public canSave = computed(() => {
    const data = this.editing();
    return data.yaml;
  });
}
