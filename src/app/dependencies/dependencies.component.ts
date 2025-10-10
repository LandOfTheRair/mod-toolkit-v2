import { Component, inject, output } from '@angular/core';
import { ElectronService } from '../services/electron.service';
import { ModService } from '../services/mod.service';

@Component({
    selector: 'app-dependencies',
    templateUrl: './dependencies.component.html',
    styleUrl: './dependencies.component.scss',
    standalone: false
})
export class DependenciesComponent {
  public exit = output();

  public modService = inject(ModService);
  private electronService = inject(ElectronService);

  addNewDependency(dependency: string) {
    if (!dependency?.trim()) return;
    this.electronService.send('ADD_DEPENDENCY', dependency);
  }

  removeDependency(dependency: string) {
    this.modService.removeModDependency(dependency);
  }
}
