import { Component, input, model, output } from '@angular/core';
import { MacroActivation, MacroActivationType } from '../../../../interfaces';

@Component({
  selector: 'app-input-macrotype',
  templateUrl: './input-macrotype.component.html',
  styleUrl: './input-macrotype.component.scss',
})
export class InputMacrotypeComponent {
  public macroType = model.required<string | undefined>();
  public change = output<MacroActivationType>();
  public label = input<string>('Macro Activation Type');

  public values = [...Object.values(MacroActivation).sort()];
}
