import { effect, inject, Injectable, signal } from '@angular/core';

import { ModService } from './mod.service';
import { NotifyService } from './notify.service';

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

  private modService = inject(ModService);
  private notifyService = inject(NotifyService);

  constructor() {
    this.watchIPC();

    effect(() => {
      const mod = this.modService.mod();
      this.send('BACKUP_MOD', mod);
    });
  }

  watchIPC() {
    window.api.reset();

    window.api.receive('ready', () => {
      this.isLoaded.set(true);
    });

    window.api.receive('notify', ({ type, text }) => {
      this.notifyService[type as keyof NotifyService]({ message: text });
    });
    /*

    window.api.receive('newmap', (mapData) => {
      if (mapData.name === 'Template') return;
      events.$emit('add:map', mapData);
    });

    window.api.receive('renamemap', (nameData) => {
      events.$emit('rename:map', nameData.oldName, nameData.newName);
    });

    window.api.receive('json', (jsonData) => {
      events.$emit(`json:${jsonData.name}`, jsonData.data);
    });

    window.api.receive('loadmod', (mod) => {
      this.mod = mod;
      this.persist();
    });

    window.api.receive('importmod', (mod) => {
      this.mod = mod.meta._backup;
      this.persist();
    });
    */

    this.send('READY_CHECK');
  }

  send(key: string, value?: any) {
    window.api.send(key, value);
  }
}
