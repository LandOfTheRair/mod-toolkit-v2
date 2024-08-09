import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root',
})
export class DebugService {
  private localStorage = inject(LocalStorageService);

  public isDebug = signal<boolean>(false);

  public toggleDebug() {
    this.isDebug.set(!this.isDebug());
    this.localStorage.store('debug', this.isDebug());
  }

  constructor() {
    this.isDebug.set(!!this.localStorage.retrieve('debug'));
  }
}
