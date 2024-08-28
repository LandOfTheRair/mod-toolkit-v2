import { computed, effect, inject, Injectable, signal } from '@angular/core';

import { IEditorMap, IModKit } from '../../interfaces';
import { importMod } from '../helpers/importer';
import { ModService } from './mod.service';
import { NotifyService } from './notify.service';
import { ModSettings, SettingsService } from './settings.service';

declare global {
  interface Window {
    api: {
      reset: () => void;
      send: (key: string, value?: any) => void;
      receive: (key: string, recv: (data: any) => void) => void;
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  public isLoaded = signal<boolean>(false);
  public isFirstLoad = signal<boolean>(false);
  private needsLoadForReadyCheck = signal<boolean>(false);
  private shouldEnsureMaps = signal<boolean>(true);

  private modService = inject(ModService);
  private notifyService = inject(NotifyService);
  private settingsService = inject(SettingsService);

  private quicksaveFilepath = computed(() => {
    const mod = this.modService.mod();
    const settings = this.settingsService.allSettings()[mod.meta.id];
    return settings.autosaveFilePath;
  });

  constructor() {
    this.watchIPC();

    effect(() => {
      const mod = this.modService.mod();

      const quicksaveFilepath = this.quicksaveFilepath();
      if (quicksaveFilepath) {
        this.send('SAVE_MOD_WITH_BACKUP', {
          modData: mod,
          quicksaveFilepath,
        });
      } else {
        this.send('BACKUP_MOD', mod);
      }
    });
  }

  private watchIPC() {
    window.api.reset();

    const tryToReady = () => {
      if (!this.needsLoadForReadyCheck()) return;
      this.send('READY_CHECK');
    };

    const tryEnsureMaps = () => {
      if (!this.shouldEnsureMaps()) return;
      this.shouldEnsureMaps.set(false);

      this.modService.ensureMapsExist();
    };

    window.api.receive('ready', () => {
      if (this.isLoaded()) return;

      this.isLoaded.set(true);
      this.isFirstLoad.set(false);

      this.requestAllJSON();
      tryEnsureMaps();
    });

    window.api.receive('resourcedone', () => {
      this.requestAllJSON();
    });

    window.api.receive('firstload', () => {
      this.isFirstLoad.set(true);
    });

    window.api.receive('notify', ({ type, text }) => {
      this.notifyService[type as keyof NotifyService]({ message: text });
    });

    window.api.receive('newmap', (mapData: IEditorMap) => {
      this.modService.addMap(mapData);
    });

    window.api.receive('renamemap', (nameData) => {
      this.modService.renameMap(
        nameData.oldName as string,
        nameData.newName as string
      );
    });

    window.api.receive('copymap', (nameData) => {
      this.modService.copyMap(nameData.mapName as string);
    });

    window.api.receive('json', (jsonData) => {
      this.modService.setJSON(jsonData.name as string, jsonData.data);
    });

    // the mod has no backup, which means it was a clean export. it might need some reformatting to get it back in
    window.api.receive('loadmod', (mod: IModKit) => {
      const importedMod = importMod(mod);
      this.modService.updateMod(importedMod);
      tryEnsureMaps();

      tryToReady();
    });

    // import the mod raw from the backup.
    window.api.receive('importmod', (mod: IModKit) => {
      const importedMod = importMod(mod.meta._backup as IModKit);
      this.modService.updateMod(importedMod);
      tryEnsureMaps();

      tryToReady();
    });

    window.api.receive(
      'updatesetting',
      (settingsData: { setting: keyof ModSettings; value: any }) => {
        this.settingsService.setSettingForMod(
          this.modService.mod().meta.id,
          settingsData.setting,
          settingsData.value
        );
      }
    );

    const quicksaveFilepath = this.quicksaveFilepath();
    if (quicksaveFilepath) {
      this.needsLoadForReadyCheck.set(true);
      this.send('LOAD_MOD_QUIETLY', { path: quicksaveFilepath });
      return;
    }

    this.send('READY_CHECK');
  }

  private requestAllJSON() {
    ['sfx', 'macicons'].forEach((neededJSON) => {
      this.requestJSON(neededJSON);
    });
  }

  requestJSON(key: string) {
    window.api.send('JSON', { json: key });
  }

  send(key: string, value?: any) {
    window.api.send(key, value);
  }
}
