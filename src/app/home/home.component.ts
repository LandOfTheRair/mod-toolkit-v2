import { Component, computed, inject, signal } from '@angular/core';
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
    { name: 'Maps', count: computed(() => this.modService.mod().maps.length) },
    {
      name: 'Items',
      count: computed(() => this.modService.mod().items.length),
    },
    { name: 'NPCs', count: computed(() => this.modService.mod().npcs.length) },
    {
      name: 'Droptables',
      count: computed(() => this.modService.mod().drops.length),
    },
    {
      name: 'Recipes',
      count: computed(() => this.modService.mod().recipes.length),
    },
    {
      name: 'Spawners',
      count: computed(() => this.modService.mod().spawners.length),
    },
    {
      name: 'Dialogs',
      count: computed(() => this.modService.mod().dialogs.length),
    },
    {
      name: 'Quests',
      count: computed(() => this.modService.mod().quests.length),
    },
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
