import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root',
})
export class DebugService {
  private localStorage = inject(LocalStorageService);

  public isDebug = signal<boolean>(false);
  public isExportingBackups = signal<boolean>(true);

  public toggleDebug() {
    this.isDebug.set(!this.isDebug());
    this.localStorage.store('debug', this.isDebug());
  }

  public toggleExportingBackups() {
    this.isExportingBackups.set(!this.isExportingBackups());
    this.localStorage.store('exportingBackups', this.isExportingBackups());
  }

  constructor() {
    this.isDebug.set(!!this.localStorage.retrieve('debug'));
    this.isExportingBackups.set(
      !!this.localStorage.retrieve('exportingBackups'),
    );
  }
}
