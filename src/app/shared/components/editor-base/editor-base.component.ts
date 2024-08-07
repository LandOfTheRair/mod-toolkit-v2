import { Component, model, output, signal } from '@angular/core';

type Tab = { name: string };

@Component({
  selector: 'app-editor-base',
  templateUrl: './editor-base.component.html',
  styleUrl: './editor-base.component.scss',
})
export class EditorBaseComponent<T> {
  public readonly tabs: Tab[] = [];

  public activeTab = signal<number>(0);

  public editing = model.required<T>();

  public goBack = output<void>();
  public save = output<T>();

  public changeTab(tab: number) {
    this.activeTab.set(tab);
  }

  public update(key: keyof T, value: any) {
    this.editing.update((editing) => ({ ...editing, [key]: value }));
  }

  doBack() {
    this.goBack.emit();
  }

  doSave() {
    console.log('[SAVE DATA]', this.editing());
    this.save.emit(this.editing());
  }
}
