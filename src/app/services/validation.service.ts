import { computed, inject, Injectable } from '@angular/core';
import { validationMessagesForMod } from '../helpers';
import { ModService } from './mod.service';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private modService = inject(ModService);

  public validationMessages = computed(() => {
    const mod = this.modService.mod();
    const classes = this.modService.availableClasses();
    const json = this.modService.json();
    return validationMessagesForMod(mod, classes, json);
  });

  public numErrors = computed(() => {
    const validationMessages = this.validationMessages();
    return validationMessages
      .map((v) => v.messages)
      .flat()
      .filter((vdn) => vdn.type === 'error').length;
  });
}
