import { Component, computed, OnInit, signal } from '@angular/core';

import { IAchievement } from '../../../../interfaces';
import { defaultAchievementRequirements } from '../../../helpers';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-achievements-editor',
  templateUrl: './achievements-editor.component.html',
  styleUrl: './achievements-editor.component.scss',
})
export class AchievementsEditorComponent
  extends EditorBaseComponent<IAchievement>
  implements OnInit
{
  public currentItem = signal<IAchievement | undefined>(undefined);

  public canSave = computed(() => {
    const data = this.editing();
    return (
      data.name &&
      data.desc &&
      data.ap > 0 &&
      this.satisfiesUnique() &&
      !this.isSaving()
    );
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<IAchievement>(
      'achievements',
      'name',
      data.name,
      data._id
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

  resetAchievementType() {
    this.editing.update((editing) => {
      editing.requirements = defaultAchievementRequirements();
      return structuredClone(editing);
    });
  }
}
