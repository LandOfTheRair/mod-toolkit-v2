import {
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { BaseClassType } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

@Component({
    selector: 'app-input-class',
    templateUrl: './input-class.component.html',
    styleUrl: './input-class.component.scss',
    standalone: false
})
export class InputClassComponent {
  private modService = inject(ModService);

  public playerClass = model.required<BaseClassType | undefined>();
  public label = input<string>('Class');
  public change = output<BaseClassType | undefined>();

  public values = computed(() => {
    return this.modService.availableClasses();
  });
}
