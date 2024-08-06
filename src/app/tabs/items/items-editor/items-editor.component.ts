import { Component, computed, model, output, signal } from '@angular/core';
import { IItemDefinition } from '../../../../interfaces';

type EditingType = IItemDefinition;

@Component({
  selector: 'app-items-editor',
  templateUrl: './items-editor.component.html',
  styleUrl: './items-editor.component.scss',
})
export class ItemsEditorComponent {
  public readonly tabs = [
    { name: 'Core Stats' },
    { name: 'Traits, Effects & Requirements' },
    { name: 'Miscellaneous' },
  ];

  public activeTab = signal<number>(0);

  public editing = model.required<EditingType>();

  public goBack = output<void>();
  public save = output<EditingType>();

  public canSave = computed(() => {
    const data = this.editing();

    return data.name && data.itemClass;
  });

  public changeTab(tab: number) {
    this.activeTab.set(tab);
  }

  public update(key: keyof EditingType, value: any) {
    this.editing.update((editing) => ({ ...editing, [key]: value }));
  }

  doBack() {
    this.goBack.emit();
  }

  doSave() {
    this.save.emit(this.editing());
  }
}
