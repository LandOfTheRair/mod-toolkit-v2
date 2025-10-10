import { Component, input, model, output } from '@angular/core';
import { DynamicEventSuccessType } from '../../../../interfaces';

@Component({
    selector: 'app-input-eventsuccesstype',
    templateUrl: './input-eventsuccesstype.component.html',
    styleUrl: './input-eventsuccesstype.component.scss',
    standalone: false
})
export class InputEventSuccessTypeComponent {
  public successType = model.required<string | undefined>();
  public label = input<string>('Success Type');
  public change = output<string>();

  public values = [...Object.values(DynamicEventSuccessType)];
}
