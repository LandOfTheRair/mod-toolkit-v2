import { Component, model, output } from '@angular/core';
import { Alignment, AlignmentType } from '../../../../interfaces';

@Component({
  selector: 'app-input-alignment',
  templateUrl: './input-alignment.component.html',
  styleUrl: './input-alignment.component.scss',
})
export class InputAlignmentComponent {
  public alignment = model.required<AlignmentType | undefined>();
  public change = output<Alignment>();

  public values = [...Object.keys(Alignment)];
}
