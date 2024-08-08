import { Component, inject, signal } from '@angular/core';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-editor-base-table',
  templateUrl: './editor-base-table.component.html',
  styleUrl: './editor-base-table.component.scss',
})
export class EditorBaseTableComponent<T> {
  protected modService = inject(ModService);

  protected defaultData = () => ({} as T);

  public isEditing = signal<boolean>(false);
  public oldData = signal<T | undefined>(undefined);
  public editingData = signal<T>(this.defaultData());

  public createNew() {
    this.isEditing.set(true);
    this.editingData.set(this.defaultData());
  }

  public editExisting(data: T) {
    this.isEditing.set(true);
    this.oldData.set(structuredClone(data));
    this.editingData.set(data);
  }

  public cancelEditing() {
    this.isEditing.set(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public saveNewData(data: T) {
    this.isEditing.set(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public deleteData(data: T) {}
}
