import { Component, model, output } from '@angular/core';
import { Currency } from '../../../../interfaces';

@Component({
  selector: 'app-input-currency',
  standalone: false,
  templateUrl: './input-currency.component.html',
  styleUrl: './input-currency.component.scss',
})
export class InputCurrencyComponent {
  public currency = model.required<Currency>();
  public change = output<Currency>();

  public values = Object.values(Currency);
}
