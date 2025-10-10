import { Component, model, output } from '@angular/core';
import { MonsterClass, MonsterClassType } from '../../../../interfaces';

@Component({
    selector: 'app-input-category',
    templateUrl: './input-category.component.html',
    styleUrl: './input-category.component.scss',
    standalone: false
})
export class InputCategoryComponent {
  public category = model.required<MonsterClassType | undefined>();
  public change = output<MonsterClassType>();

  public values = [...Object.values(MonsterClass)];
}
