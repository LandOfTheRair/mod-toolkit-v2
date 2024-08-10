import { Component, model, output } from '@angular/core';
import { DamageClass, DamageClassType } from '../../../../interfaces';

@Component({
  selector: 'app-input-damageclass',
  templateUrl: './input-damageclass.component.html',
  styleUrl: './input-damageclass.component.scss',
})
export class InputDamageclassComponent {
  public damageClass = model.required<DamageClassType | undefined>();
  public change = output<DamageClass>();

  public values = [...Object.values(DamageClass)];
}
