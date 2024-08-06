import { Component, inject, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { ElectronService } from '../services/electron.service';
import { ModService } from '../services/mod.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private localStorage = inject(LocalStorageService);
  public electronService = inject(ElectronService);
  public modService = inject(ModService);

  public activeTab = signal<string>('Maps');

  public tabOrder = [
    { name: 'Maps' },
    { name: 'Items' },
    { name: 'NPCs' },
    { name: 'Droptables' },
    { name: 'Recipes' },
    { name: 'Spawners' },
    { name: 'Dialogs' },
    { name: 'Quests' },
  ];

  constructor() {
    const lastTab = (this.localStorage.retrieve('lasttab') as string) || 'Maps';
    this.activeTab.set(lastTab);
  }

  changeTab(newTab: string) {
    this.activeTab.set(newTab);

    this.localStorage.store('lasttab', newTab);
  }
}
