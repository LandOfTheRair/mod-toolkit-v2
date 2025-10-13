import { Component, model } from '@angular/core';

@Component({
  selector: 'app-input-item-behavior',
  standalone: false,
  templateUrl: './input-item-behavior.component.html',
  styleUrl: './input-item-behavior.component.scss',
})
export class InputItemBehaviorComponent {
  public itemName = model.required<string | undefined>();
}
