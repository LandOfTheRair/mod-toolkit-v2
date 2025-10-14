import { Component, inject, OnInit, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { ElectronService } from '../../../services/electron.service';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-test-view',
  templateUrl: './test-view.component.html',
  styleUrl: './test-view.component.scss',
  standalone: false,
})
export class TestViewComponent implements OnInit {
  private modService = inject(ModService);
  private localStorage = inject(LocalStorageService);
  public electronService = inject(ElectronService);

  public isValidJSON = signal<boolean>(true);

  public settings = {
    level: 1,
    map: '',
    x: 4,
    y: 4,
    openClient: true,
    databaseOverride: '',
    otherProps: {},
  };

  ngOnInit() {
    const settings = this.localStorage.retrieve('testsettings');
    if (settings) {
      this.settings.level = settings.level;
      this.settings.map = settings.map;
      this.settings.x = settings.x;
      this.settings.y = settings.y;
      this.settings.openClient = settings.openClient;
      this.settings.otherProps = settings.otherProps;
      this.settings.databaseOverride = settings.databaseOverride;
    }
  }

  public saveSettings() {
    this.localStorage.store('testsettings', this.settings);
  }

  public onSettingsChanged(newProps: string) {
    this.settings.otherProps = newProps;

    try {
      this.isValidJSON.set(!!JSON.parse(newProps));
      this.saveSettings();
    } catch {
      this.isValidJSON.set(false);
    }
  }

  public testMod() {
    this.saveSettings();

    const settingsString = JSON.stringify({
      map: this.settings.map,
      settings: this.settings,
      openClient: this.settings.openClient,
      ...this.settings.otherProps,
    });

    this.electronService.send('TEST_MOD', {
      mod: this.modService.mod(),
      map: this.settings.map,
      settings: settingsString,
      openClient: this.settings.openClient,
      databaseOverrideURL: this.settings.databaseOverride,
    });
  }

  public killMod() {
    this.electronService.send('KILL_MOD');
  }
}
