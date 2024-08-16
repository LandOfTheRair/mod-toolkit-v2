import { effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

export interface ModSettings {
  autosaveFilePath: string;
}

const defaultSettings: () => ModSettings = () => ({
  autosaveFilePath: '',
});

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private localStorage = inject(LocalStorageService);

  public allSettings = signal<Record<string, ModSettings>>({});

  constructor() {
    const settings =
      (this.localStorage.retrieve('settings') as Record<string, ModSettings>) ??
      {};
    this.allSettings.set(settings);

    effect(() => {
      const settings = this.allSettings();
      this.localStorage.store('settings', settings);
    });
  }

  public createSettingsForMod(modId: string) {
    if (this.allSettings()[modId]) return;

    this.allSettings.update((settings) => ({
      ...settings,
      [modId]: defaultSettings(),
    }));
  }

  public setSettingForMod(
    modId: string,
    setting: keyof ModSettings,
    value: any
  ) {
    this.allSettings.update((settings) => ({
      ...settings,
      [modId]: {
        ...settings[modId],
        [setting]: value,
      },
    }));
  }
}
