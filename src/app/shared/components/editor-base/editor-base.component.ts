import {
  Component,
  inject,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { HasIdentification } from '../../../../interfaces';
import { id } from '../../../helpers/id';
import { ModService } from '../../../services/mod.service';

type Tab = { name: string };

@Component({
  selector: 'app-editor-base',
  templateUrl: './editor-base.component.html',
  styleUrl: './editor-base.component.scss',
})
export class EditorBaseComponent<T extends HasIdentification>
  implements OnInit
{
  private localStorage = inject(LocalStorageService);
  public modService = inject(ModService);

  public readonly key: string = '';
  public readonly tabs: Tab[] = [];

  public activeTab = signal<number>(0);

  public editing = model.required<T>();

  public goBack = output<void>();
  public save = output<T>();

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

    console.log(`[EDIT BEGIN]`, editing);

    this.editing.set(editing);
  }

  private initTabs() {
    const oldTab = +this.localStorage.retrieve(`${this.key}-tabs`);
    if (oldTab) {
      this.activeTab.set(oldTab);
    }
  }

  doBack() {
    this.goBack.emit();
  }

  doSave() {
    console.log('[SAVE DATA]', this.editing());
    this.save.emit(this.editing());
  }
}
