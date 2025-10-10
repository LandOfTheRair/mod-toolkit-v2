import { Component, input, model, OnInit, output } from '@angular/core';
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
    standalone: false
})
export class InputItemclassComponent implements OnInit {
  public itemClass = model<ItemClassType>();
  public label = input<string>('Type');
  public change = output<ItemClassType>();
  public defaultValue = input<string>();

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

  ngOnInit() {
    const val = this.defaultValue();
    if (val) {
      this.itemClass.set(val as ItemClassType);
    }
  }
}
