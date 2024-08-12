import { Component, input, model, output } from '@angular/core';
import { Skill } from '../../../../interfaces';

@Component({
  selector: 'app-input-skill',
  templateUrl: './input-skill.component.html',
  styleUrl: './input-skill.component.scss',
})
export class InputSkillComponent {
  public skill = model.required<string | undefined>();
  public label = input<string>('Skill');
  public change = output<string>();

  public values = [...Object.keys(Skill)];
}
