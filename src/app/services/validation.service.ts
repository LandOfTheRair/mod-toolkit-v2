import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { IModKit, ValidationMessageGroup } from '../../interfaces';
import { validationMessagesForMod } from '../helpers';
import { ModService } from './mod.service';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private modService = inject(ModService);

  public validationMessages = signal<ValidationMessageGroup[]>([]);

  public numErrors = computed(() => {
    const validationMessages = this.validationMessages();
    return validationMessages
      .map((v) => v.messages)
      .flat()
      .filter((vdn) => vdn.type === 'error').length;
  });

  constructor() {
    effect(() => {
      const mod = this.modService.mod();
      if (!mod) return;

      void this.recalculateValidationMessages(mod);
    });
  }

  private async recalculateValidationMessages(mod: IModKit) {
    const classes = this.modService.availableClasses();
    const json = this.modService.json();
    const messages = await validationMessagesForMod(mod, classes, json);
    this.validationMessages.set(messages);
  }
}
