import { Component, computed, inject, output, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { validationMessagesForMod } from '../helpers';
import { ModService } from '../services/mod.service';

@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss',
})
export class ValidationComponent {
  private localStorage = inject(LocalStorageService);
  private modService = inject(ModService);

  public activeValidationTab = signal<number>(0);
  public exit = output();

  public validationMessages = computed(() => {
    const mod = this.modService.mod();
    return validationMessagesForMod(mod);
  });

  public tabImportant = computed(() => {
    return this.validationMessages().filter(
      (t) => ['error', 'good'].includes(t.type ?? '') || t.header || t.subheader
    );
  });

  public tabAll = computed(() => {
    return this.validationMessages();
  });

  public tabErrors = computed(() => {
    return this.validationMessages().filter(
      (t) => t.type === 'error' || t.header || t.subheader
    );
  });

  public tabWarnings = computed(() => {
    return this.validationMessages().filter(
      (t) => t.type === 'warning' || t.header || t.subheader
    );
  });

  public tabSuccesses = computed(() => {
    return this.validationMessages().filter(
      (t) => t.type === 'good' || t.header || t.subheader
    );
  });

  public allErrors = computed(() => {
    return this.validationMessages().filter((t) => t.type === 'error');
  });

  public allWarnings = computed(() => {
    return this.validationMessages().filter((t) => t.type === 'warning');
  });

  public allSuccesses = computed(() => {
    return this.validationMessages().filter((t) => t.type === 'good');
  });

  public tabOrder = [
    {
      name: 'Important',
      icon: '📋',
      messages: this.tabImportant,
      count: computed(() => this.allErrors().length),
    },
    {
      name: 'All',
      icon: '📜',
      messages: this.tabAll,
      count: computed(
        () => this.validationMessages().filter((t) => t.type).length
      ),
    },
    {
      name: 'Errors',
      icon: '❌',
      messages: this.tabErrors,
      count: computed(() => this.allErrors().length),
    },
    {
      name: 'Warnings',
      icon: '⚠️',
      messages: this.tabWarnings,
      count: computed(() => this.allWarnings().length),
    },
    {
      name: 'Successes',
      icon: '✅',
      messages: this.tabSuccesses,
      count: computed(() => this.allSuccesses().length),
    },
  ];

  constructor() {
    const lastValidationTab =
      (this.localStorage.retrieve('lastvalidationtab') as number) ?? 0;
    this.activeValidationTab.set(lastValidationTab);
  }

  changeTab(newTab: number) {
    this.activeValidationTab.set(newTab);

    this.localStorage.store('lastvalidationtab', newTab);
  }
}
