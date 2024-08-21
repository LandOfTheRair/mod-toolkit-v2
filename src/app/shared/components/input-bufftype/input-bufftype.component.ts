import { Component, input, model, output } from '@angular/core';
import { BuffType } from '../../../../interfaces';

@Component({
  selector: 'app-input-bufftype',
  templateUrl: './input-bufftype.component.html',
  styleUrl: './input-bufftype.component.scss',
})
export class InputBufftypeComponent {
  public buffType = model.required<string | undefined>();
  public change = output<BuffType>();
  public label = input<string>('Buff Type');

  public values = [...Object.values(BuffType).sort()];
}
