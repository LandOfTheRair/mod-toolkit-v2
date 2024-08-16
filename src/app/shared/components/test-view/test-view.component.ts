import { Component, inject, OnInit, signal } from '@angular/core';
import { CodeModel } from '@ngstack/code-editor';
import { LocalStorageService } from 'ngx-webstorage';
import { ElectronService } from '../../../services/electron.service';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-test-view',
  templateUrl: './test-view.component.html',
  styleUrl: './test-view.component.scss',
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
    otherProps: '{\n  \n}',
  };

  public readonly dialogModel: CodeModel = {
    language: 'json',
    uri: 'charstats.json',
    value: '{\n  \n}',
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
      this.dialogModel.value = settings.otherProps;
    }
  }

  public onSettingsChanged(newProps: string) {
    this.settings.otherProps = newProps;

    try {
      this.isValidJSON.set(!!JSON.parse(newProps));
    } catch {
      this.isValidJSON.set(false);
    }
  }

  public testMod() {
    this.localStorage.store('testsettings', this.settings);

    const settingsString = JSON.stringify({
      map: this.settings.map,
      settings: this.settings,
      openClient: this.settings.openClient,
      ...JSON.parse(this.settings.otherProps),
    });

    this.electronService.send('TEST_MOD', {
      mod: this.modService.mod(),
      map: this.settings.map,
      settings: settingsString,
      openClient: this.settings.openClient,
    });
  }

  public killMod() {
    this.electronService.send('KILL_MOD');
  }
}
