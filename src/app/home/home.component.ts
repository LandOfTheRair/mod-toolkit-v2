import { Component, inject, signal } from '@angular/core';
import { ElectronService } from '../services/electron.service';
import { ModService } from '../services/mod.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
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

  changeTab(newTab: string) {
    this.activeTab.set(newTab);
  }
}
