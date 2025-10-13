import { Component, model, output } from '@angular/core';
import { IDialogAction } from '../../../../interfaces';

@Component({
  selector: 'app-dialogs-editor-visual-node-editor',
  standalone: false,
  templateUrl: './dialogs-editor-visual-node-editor.component.html',
  styleUrl: './dialogs-editor-visual-node-editor.component.scss',
})
export class DialogsEditorVisualNodeEditorComponent {
  public action = model.required<IDialogAction>();
  public unselect = output<void>();
}
