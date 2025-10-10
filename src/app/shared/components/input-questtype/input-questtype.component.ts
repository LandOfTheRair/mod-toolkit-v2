import { Component, model, output } from '@angular/core';
import {
  QuestRequirementType,
  QuestRequirementTypeType,
} from '../../../../interfaces';

@Component({
    selector: 'app-input-questtype',
    templateUrl: './input-questtype.component.html',
    styleUrl: './input-questtype.component.scss',
    standalone: false
})
export class InputQuesttypeComponent {
  public questType = model.required<QuestRequirementTypeType | undefined>();
  public change = output<QuestRequirementTypeType>();

  public values = [...Object.values(QuestRequirementType).sort()];
}
