import { Component, computed, inject } from '@angular/core';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { truncate } from 'lodash';
import { CustomNodeComponent, SelectableDirective, Vflow } from 'ngx-vflow';
import { DialogNodeData } from '../../../../interfaces';
import { DialogNodeEditorService } from '../../../services/dialog-node-editor.service';

@Component({
  selector: 'app-dialogs-editor-visual-node',
  standalone: true,
  templateUrl: './dialogs-editor-visual-node.component.html',
  styleUrl: './dialogs-editor-visual-node.component.scss',
  imports: [Vflow, SelectableDirective, SweetAlert2Module],
})
export class DialogsEditorVisualNodeComponent extends CustomNodeComponent<DialogNodeData> {
  private dialogNodeEditorService = inject(DialogNodeEditorService);

  public helperText = computed(() => {
    const data = this.data()?.actionInfo;

    return (data.quest ||
      data.effect ||
      data.currency ||
      data.item?.name ||
      data.upgrade ||
      data.holiday ||
      data.level ||
      data.item ||
      data.achievementName ||
      truncate((data.leaveMessage as string) ?? '', { length: 30 }) ||
      truncate((data.message as string) ?? '', { length: 30 })) as string;
  });

  public addNodeChild(
    type: 'checkPassActions' | 'checkFailActions' | 'questCompleteActions',
  ) {
    const data = this.data();
    if (!data) return;

    switch (type) {
      case 'checkPassActions': {
        this.dialogNodeEditorService.addCheckPassAction$.next({
          nodePath: data.nodePath,
        });
        break;
      }
      case 'checkFailActions': {
        this.dialogNodeEditorService.addCheckFailAction$.next({
          nodePath: data.nodePath,
        });
        break;
      }
      case 'questCompleteActions': {
        this.dialogNodeEditorService.addQuestCompleteAction$.next({
          nodePath: data.nodePath,
        });
        break;
      }
    }
  }

  public removeThisNode() {
    const data = this.data();
    if (!data) return;

    switch (data.nodeFrom) {
      case 'fail': {
        this.dialogNodeEditorService.removeCheckFailAction$.next({
          nodePath: data.nodePath,
          index: data.nodeIndex,
        });
        break;
      }

      case 'success': {
        this.dialogNodeEditorService.removeCheckPassAction$.next({
          nodePath: data.nodePath,
          index: data.nodeIndex,
        });
        break;
      }

      case 'questComplete': {
        this.dialogNodeEditorService.removeQuestCompleteAction$.next({
          nodePath: data.nodePath,
          index: data.nodeIndex,
        });
        break;
      }
    }
  }
}
