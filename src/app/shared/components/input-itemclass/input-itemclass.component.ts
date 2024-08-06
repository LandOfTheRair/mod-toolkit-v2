import { Component, input, model } from '@angular/core';
import {
  ArmorClass,
  ItemClassType,
  MiscClass,
  WeaponClass,
} from '../../../../interfaces';

@Component({
  selector: 'app-input-itemclass',
  templateUrl: './input-itemclass.component.html',
  styleUrl: './input-itemclass.component.scss',
})
export class InputItemclassComponent {
  public itemClass = model.required<ItemClassType>();
  public label = input<string>('Type');

  public values = [
    ...Object.values(WeaponClass).map((c) => ({
      category: 'Weapon',
      value: c,
    })),
    ...Object.values(ArmorClass).map((c) => ({ category: 'Armor', value: c })),
    ...Object.values(MiscClass).map((c) => ({
      category: 'Miscellaneous',
      value: c,
    })),
  ];
}
