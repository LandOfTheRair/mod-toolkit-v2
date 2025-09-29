import { Component, computed, inject, output, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { ValidationService } from '../services/validation.service';

@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss',
})
export class ValidationComponent {
  public exit = output();

  private localStorage = inject(LocalStorageService);
  private validationService = inject(ValidationService);

  public activeValidationTab = signal<number>(0);

  public validationMessageContainers = computed(() => {
    return this.validationService.validationMessages();
  });

  public onlyValidationMessages = computed(() => {
    return this.validationMessageContainers()
      .map((m) => m.messages)
      .flat();
  });

  public tabImportant = computed(() => {
    return this.validationMessageContainers().filter((m) =>
      m.messages.some((t) => t.type === 'error' || t.type === 'good')
    );
  });

  public tabAll = computed(() => {
    return this.validationMessageContainers();
  });

  public tabErrors = computed(() => {
    return this.validationMessageContainers().filter((m) =>
      m.messages.some((t) => t.type === 'error')
    );
  });

  public tabWarnings = computed(() => {
    return this.validationMessageContainers().filter((m) =>
      m.messages.some((t) => t.type === 'warning')
    );
  });

  public tabSuccesses = computed(() => {
    return this.validationMessageContainers().filter((m) =>
      m.messages.some((t) => t.type === 'good')
    );
  });

  public allErrors = computed(() => {
    return this.onlyValidationMessages().filter((t) => t.type === 'error');
  });

  public allWarnings = computed(() => {
    return this.onlyValidationMessages().filter((t) => t.type === 'warning');
  });

  public allSuccesses = computed(() => {
    return this.onlyValidationMessages().filter((t) => t.type === 'good');
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
        () => this.onlyValidationMessages().filter((t) => t.type).length
      ),
    },
    {
      name: 'Errors',
      icon: '❌',
      messages: () =>
        this.tabErrors().map((t) => ({
          ...t,
          messages: t.messages.filter((m) => m.type === 'error'),
        })),
      count: computed(() => this.allErrors().length),
    },
    {
      name: 'Warnings',
      icon: '⚠️',
      messages: () =>
        this.tabWarnings().map((t) => ({
          ...t,
          messages: t.messages.filter((m) => m.type === 'warning'),
        })),
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
