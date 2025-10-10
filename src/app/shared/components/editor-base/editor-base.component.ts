import {
  Component,
  inject,
  model,
  OnInit,
  output,
  Signal,
  signal,
} from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { HasIdentification } from '../../../../interfaces';
import { id } from '../../../helpers/id';
import { ElectronService } from '../../../services/electron.service';
import { ModService } from '../../../services/mod.service';

type Tab = { name: string; visibleIf?: Signal<boolean> };

@Component({
    selector: 'app-editor-base',
    templateUrl: './editor-base.component.html',
    styleUrl: './editor-base.component.scss',
    standalone: false
})
export class EditorBaseComponent<T extends HasIdentification>
  implements OnInit
{
  private localStorage = inject(LocalStorageService);
  public electronService = inject(ElectronService);
  public modService = inject(ModService);

  public readonly key: string = '';
  public readonly tabs: Tab[] = [];

  public activeTab = signal<number>(0);

  public editing = model.required<T>();

  public goBack = output<void>();
  public save = output<T>();

  protected isSaving = signal<boolean>(false);

  public changeTab(tab: number) {
    this.activeTab.set(tab);
    this.localStorage.store(`${this.key}-tabs`, tab);
  }

  public update(key: keyof T, value: any) {
    this.editing.update((editing) => ({ ...editing, [key]: value }));
  }

  public updateArray(key: keyof T, idx: number, value: any) {
    this.editing.update((editing) => {
      const arr = editing[key] as Array<any>;
      arr[idx] = value;
      return editing;
    });
  }

  ngOnInit() {
    this.initTabs();

    const editing = this.editing();
    if (!editing._id) {
      editing._id = id();
    }

    console.info(`[EDIT BEGIN]`, editing);

    this.editing.set(editing);
  }

  private initTabs() {
    const oldTab = +this.localStorage.retrieve(`${this.key}-tabs`);
    if (oldTab && this.tabs[oldTab]?.visibleIf?.()) {
      this.activeTab.set(oldTab);
    }
  }

  doBack() {
    this.goBack.emit();
  }

  doSave() {
    console.info('[SAVE DATA]', this.editing());
    this.save.emit(this.editing());
  }
}
