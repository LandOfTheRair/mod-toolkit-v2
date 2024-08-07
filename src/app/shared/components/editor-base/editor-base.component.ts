import {
  Component,
  inject,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

type Tab = { name: string };

@Component({
  selector: 'app-editor-base',
  templateUrl: './editor-base.component.html',
  styleUrl: './editor-base.component.scss',
})
export class EditorBaseComponent<T> implements OnInit {
  private localStorage = inject(LocalStorageService);

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

  ngOnInit() {
    this.initTabs();
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
