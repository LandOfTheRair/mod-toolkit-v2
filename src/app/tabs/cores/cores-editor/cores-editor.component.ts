import { Component, computed, OnInit } from '@angular/core';

import { ICoreContent } from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-cores-editor',
  templateUrl: './cores-editor.component.html',
  styleUrl: './cores-editor.component.scss',
  standalone: false,
})
export class CoresEditorComponent
  extends EditorBaseComponent<ICoreContent>
  implements OnInit
{
  public canSave = computed(() => {
    const data = this.editing();
    return data.name && data.json && !this.isSaving();
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<ICoreContent>(
      'cores',
      'name',
      data.name,
      data._id,
    );
  });

  ngOnInit(): void {
    super.ngOnInit();
  }

  doSave() {
    this.isSaving.set(true);

    setTimeout(() => {
      const core = this.editing();

      this.editing.set(core);

      super.doSave();
    }, 50);
  }
}
