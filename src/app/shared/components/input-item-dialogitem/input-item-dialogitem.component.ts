import { Component, computed, model } from '@angular/core';
import { isObject } from 'lodash';
import { IDialogItem } from '../../../../interfaces';

@Component({
  selector: 'app-input-item-dialogitem',
  standalone: false,
  templateUrl: './input-item-dialogitem.component.html',
  styleUrl: './input-item-dialogitem.component.scss',
})
export class InputItemDialogitemComponent {
  public dialogItem = model.required<IDialogItem>();

  public isObject = computed(() => isObject(this.dialogItem()));
}
