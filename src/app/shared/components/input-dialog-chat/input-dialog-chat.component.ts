import { Component, model, OnInit } from '@angular/core';
import { IDialogChatActionOption } from '../../../../interfaces';

@Component({
  selector: 'app-input-dialog-chat',
  standalone: false,
  templateUrl: './input-dialog-chat.component.html',
  styleUrl: './input-dialog-chat.component.scss',
})
export class InputDialogChatComponent implements OnInit {
  public chat = model.required<IDialogChatActionOption>();

  ngOnInit() {
    setTimeout(() => {
      this.chat.update((c) => {
        c.requirement ??= {};
        return c;
      });
    }, 50);
  }
}
