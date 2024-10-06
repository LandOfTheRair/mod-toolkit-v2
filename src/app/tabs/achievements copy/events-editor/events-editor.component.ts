import { Component, computed, OnInit, signal } from '@angular/core';

import { IDynamicEventMeta, INPCDefinition } from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-events-editor',
  templateUrl: './events-editor.component.html',
  styleUrl: './events-editor.component.scss',
})
export class EventsEditorComponent
  extends EditorBaseComponent<IDynamicEventMeta>
  implements OnInit
{
  public currentConflictEvent = signal<string | undefined>(undefined);
  public currentNPC = signal<INPCDefinition | undefined>(undefined);

  public canSave = computed(() => {
    const data = this.editing();
    return (
      data.name &&
      data.description &&
      data.rarity &&
      data.startMessage &&
      data.endMessage &&
      this.satisfiesUnique()
    );
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<IDynamicEventMeta>(
      'events',
      'name',
      data.name,
      data._id
    );
  });

  public isCurrentEventAConflict = computed(() => {
    const evt = this.currentConflictEvent();
    if (!evt) return true;

    if (evt === this.editing().name) return true;

    return this.editing().conflicts?.includes(evt);
  });

  public conflictsInOrder = computed(() => this.editing().conflicts.sort());
  public npcKillsInOrder = computed(() =>
    this.editing().successMetrics.killNPCs.sort()
  );

  ngOnInit(): void {
    super.ngOnInit();
  }

  doSave() {
    const core = this.editing();

    this.editing.set(core);

    super.doSave();
  }

  public addConflictEvent(event: string | undefined) {
    if (!event) return;

    const core = this.editing();

    core.conflicts.push(event);

    this.editing.set(structuredClone(core));
  }

  public removeConflict(event: string) {
    const core = this.editing();

    core.conflicts = core.conflicts.filter((f) => f !== event);

    this.editing.set(structuredClone(core));
  }

  public addNPC(npc: INPCDefinition | undefined) {
    if (!npc) return;

    const event = this.editing();

    event.successMetrics.killNPCs.push(npc.npcId);

    this.editing.set(structuredClone(event));
  }

  public removeNPC(index: number) {
    const event = this.editing();

    event.successMetrics.killNPCs.splice(index, 1);

    this.editing.set(structuredClone(event));
  }

  public hasNPC(npc: INPCDefinition | undefined) {
    if (!npc) return false;
    return this.editing().successMetrics.killNPCs.some((n) => n === npc.npcId);
  }
}
