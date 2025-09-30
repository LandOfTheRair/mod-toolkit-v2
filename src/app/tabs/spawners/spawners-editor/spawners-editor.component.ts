import { Component, computed, OnInit, signal } from '@angular/core';
import { sortBy } from 'lodash';
import { INPCDefinition, ISpawnerData, Rollable } from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-spawners-editor',
  templateUrl: './spawners-editor.component.html',
  styleUrl: './spawners-editor.component.scss',
})
export class SpawnersEditorComponent
  extends EditorBaseComponent<ISpawnerData>
  implements OnInit
{
  public currentNPC = signal<INPCDefinition | undefined>(undefined);

  public canSave = computed(() => {
    const spawner = this.editing();
    return (
      spawner.tag &&
      spawner.npcIds.length > 0 &&
      this.satisfiesUnique() &&
      !this.isSaving()
    );
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<ISpawnerData>(
      'spawners',
      'tag',
      data.tag,
      data._id,
    );
  });

  ngOnInit(): void {
    const spawner = this.editing();

    spawner.npcAISettings ??= [];
    spawner._paths = spawner.paths?.join('\n') ?? '';

    this.editing.set(spawner);

    super.ngOnInit();
  }

  public addNPC(npc: INPCDefinition | undefined) {
    if (!npc) return;

    this.editing.update((spawner) => ({
      ...spawner,
      npcIds: [...spawner.npcIds, { result: npc.npcId, chance: 1 }],
    }));
  }

  public removeNPC(npcId: string) {
    this.editing.update((spawner) => ({
      ...spawner,
      npcIds: spawner.npcIds.filter((s) => s.result !== npcId),
    }));
  }

  public hasNPC(npc: INPCDefinition | undefined) {
    if (!npc) return false;
    return this.editing().npcIds.some((n) => n.result === npc.npcId);
  }

  public makeLairLike() {
    const spawner = this.editing();

    spawner.alwaysSpawn = true;
    spawner.shouldSerialize = true;
    spawner.requireDeadToRespawn = true;
    spawner.initialSpawn = 1;
    spawner.maxCreatures = 1;
    spawner.shouldStrip = true;
    spawner.isDangerous = true;
    spawner.stripRadius = 1;
    spawner.attributeAddChance = 30;

    this.editing.set(spawner);
  }

  public sortNPCIds(npcIds: Rollable[]): Rollable[] {
    return sortBy(npcIds, 'result');
  }

  public doSave() {
    this.isSaving.set(true);

    setTimeout(() => {
      const spawner = this.editing();

      spawner.paths = spawner._paths ? spawner._paths.split('\n') : [];
      delete spawner._paths;

      spawner.npcIds = spawner.npcIds.filter((s) => s.result);

      this.editing.set(spawner);

      super.doSave();
    }, 50);
  }
}
