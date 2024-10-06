import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterChangedEvent, FilterModel } from 'ag-grid-community';
import { merge } from 'lodash';
import { LocalStorageService } from 'ngx-webstorage';
import { HasIdentification, IModKit } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';
import { URLService } from '../../../services/url.service';

@Component({
  selector: 'app-editor-base-table',
  templateUrl: './editor-base-table.component.html',
  styleUrl: './editor-base-table.component.scss',
})
export class EditorBaseTableComponent<T extends HasIdentification>
  implements OnInit
{
  private route = inject(ActivatedRoute);
  private urlService = inject(URLService);

  private localStorage = inject(LocalStorageService);
  protected modService = inject(ModService);

  protected dataKey!: keyof Omit<IModKit, 'meta'>;

  protected defaultData = () => ({} as T);

  protected tableFilterState = signal<FilterModel | undefined>(undefined);

  public isEditing = signal<boolean>(false);
  public oldData = signal<T | undefined>(undefined);
  public editingData = signal<T>(this.defaultData());

  ngOnInit(): void {
    const state = this.localStorage.retrieve(
      `${this.dataKey}-tablefilters`
    ) as FilterModel;

    if (state) {
      this.tableFilterState.set(state);
    }

    const loadItemId = this.getURLSubProp('id');
    if (loadItemId) {
      const potentialItems: T[] = this.modService.mod()[
        this.dataKey
      ] as unknown as T[];

      const item = potentialItems.find((i) => i._id === loadItemId);

      if (item) {
        this.editExisting(item);
      }
    }
  }

  getURLSubProp(prop: string): string | null {
    return this.route.snapshot.queryParamMap.get(prop);
  }

  public createNew() {
    this.isEditing.set(true);
    this.editingData.set(this.defaultData());
  }

  public editExisting(data: T) {
    this.isEditing.set(true);
    this.oldData.set(structuredClone(data));

    const defaultContent = this.defaultData();
    const clonedContent = structuredClone(data);

    const finalItem = merge(defaultContent, clonedContent);
    this.editingData.set(finalItem);
    this.urlService.trackURLChanges({
      id: data._id,
    });
  }

  public cancelEditing() {
    this.isEditing.set(false);
    this.oldData.set(undefined);

    this.urlService.trackURLChanges({
      id: '',
    });
  }

  public saveNewData(data: T) {
    if (!this.dataKey) {
      throw new Error('Set a datakey for this component.');
    }

    this.isEditing.set(false);

    const oldItem = this.oldData();
    if (oldItem) {
      this.oldData.set(undefined);
      this.modService.modEdit<T>(this.dataKey, oldItem, data);
      this.dataEdited(oldItem, data);
      return;
    }

    this.modService.modAdd<T>(this.dataKey, data);
  }

  public deleteData(data: T) {
    if (!this.dataKey) {
      throw new Error('Set a datakey for this component.');
    }

    this.modService.modDelete<T>(this.dataKey, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected dataEdited(oldItem: T, newItem: T) {}

  public filterChanged($event: FilterChangedEvent) {
    this.tableFilterState.set($event.api.getFilterModel());

    this.localStorage.store(
      `${this.dataKey}-tablefilters`,
      this.tableFilterState()
    );
  }
}
