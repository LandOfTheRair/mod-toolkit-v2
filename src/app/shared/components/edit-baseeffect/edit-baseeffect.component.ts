import { Component, model, output } from '@angular/core';
import { INPCEffect } from '../../../../interfaces';

@Component({
  selector: 'app-edit-baseeffect',
  templateUrl: './edit-baseeffect.component.html',
  styleUrl: './edit-baseeffect.component.scss',
})
export class EditBaseeffectComponent {
  public baseEffect = model.required<INPCEffect>();
  public remove = output<void>();
}
