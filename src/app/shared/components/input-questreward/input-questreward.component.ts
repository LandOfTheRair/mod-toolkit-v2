import { Component, model, output } from '@angular/core';
import { QuestRewardType, QuestRewardTypeType } from '../../../../interfaces';

@Component({
  selector: 'app-input-questreward',
  templateUrl: './input-questreward.component.html',
  styleUrl: './input-questreward.component.scss',
})
export class InputQuestrewardComponent {
  public rewardType = model.required<QuestRewardTypeType | undefined>();
  public change = output<QuestRewardTypeType>();

  public values = [...Object.values(QuestRewardType).sort()];
}
