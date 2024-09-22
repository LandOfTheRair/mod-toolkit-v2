import { Component, computed, model, output } from '@angular/core';

@Component({
  selector: 'app-input-achievementtype',
  templateUrl: './input-achievementtype.component.html',
  styleUrl: './input-achievementtype.component.scss',
})
export class InputAchievementTypeComponent {
  public achievementType = model.required<string | undefined>();
  public change = output<string>();

  public values = computed(() => [
    'other',
    'bindItem',
    'kill',
    'level',
    'skill',
    'tradeskill',
  ]);
}
