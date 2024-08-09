import { Component, model, output } from '@angular/core';

@Component({
  selector: 'app-input-tradeskill',
  templateUrl: './input-tradeskill.component.html',
  styleUrl: './input-tradeskill.component.scss',
})
export class InputTradeskillComponent {
  public tradeskill = model.required<string>();
  public change = output<string>();

  public values = [
    'alchemy',
    'foodmaking',
    'gemcrafting',
    'metalworking',
    'spellforging',
    'weavefabricating',
  ];
}
