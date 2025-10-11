import { Component } from '@angular/core';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';
import { DialogNodeData } from '../../../../interfaces';

@Component({
  selector: 'app-dialogs-editor-visual-node',
  standalone: true,
  templateUrl: './dialogs-editor-visual-node.component.html',
  styleUrl: './dialogs-editor-visual-node.component.scss',
  imports: [Vflow],
})
export class DialogsEditorVisualNodeComponent extends CustomNodeComponent<DialogNodeData> {}
