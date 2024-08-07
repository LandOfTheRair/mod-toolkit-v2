import { Component, input, model, output } from '@angular/core';
import { BaseClassType } from '../../../../interfaces';

@Component({
  selector: 'app-input-class',
  templateUrl: './input-class.component.html',
  styleUrl: './input-class.component.scss',
})
export class InputClassComponent {
  public playerClass = model.required<BaseClassType | undefined>();
  public label = input<string>('Class');
  public change = output<BaseClassType | undefined>();

  public values: BaseClassType[] = [
    'Mage',
    'Thief',
    'Healer',
    'Warrior',
    'Traveller',
  ];
}
