import { Component, input, model } from '@angular/core';

type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'damageClass'
  | 'succorInfo'
  | 'containedItems'
  | 'recipe'
  | 'bookPages';

@Component({
  selector: 'app-input-prop-editor',
  standalone: false,
  templateUrl: './input-prop-editor.component.html',
  styleUrl: './input-prop-editor.component.scss',
})
export class InputPropEditorComponent {
  public propData = model();
  public propName = input.required<string>();
  public propType = input.required<PropType>();
}
