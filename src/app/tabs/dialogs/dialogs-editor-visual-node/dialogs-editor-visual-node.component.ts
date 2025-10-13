import { Component, computed } from '@angular/core';
import { truncate } from 'lodash';
import { CustomNodeComponent, SelectableDirective, Vflow } from 'ngx-vflow';
import { DialogNodeData } from '../../../../interfaces';

@Component({
  selector: 'app-dialogs-editor-visual-node',
  standalone: true,
  templateUrl: './dialogs-editor-visual-node.component.html',
  styleUrl: './dialogs-editor-visual-node.component.scss',
  imports: [Vflow, SelectableDirective],
})
export class DialogsEditorVisualNodeComponent extends CustomNodeComponent<DialogNodeData> {
  public helperText = computed(() => {
    const data = this.data()?.actionInfo;

    return (data.quest ||
      data.effect ||
      data.currency ||
      data.item?.name ||
      data.upgrade ||
      data.holiday ||
      data.level ||
      truncate((data.message as string) ?? '', { length: 30 })) as string;
  });
}
