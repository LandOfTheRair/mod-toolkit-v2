import { Component, model, output } from '@angular/core';

@Component({
    selector: 'app-input-challengerating',
    templateUrl: './input-challengerating.component.html',
    styleUrl: './input-challengerating.component.scss',
    standalone: false
})
export class InputChallengeratingComponent {
  public rating = model.required<number>();
  public change = output<number>();

  public values = Array(21)
    .fill(0)
    .map((x, i) => i - 10);
}
