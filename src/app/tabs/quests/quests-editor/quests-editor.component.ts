import { Component, computed, signal } from '@angular/core';
import {
  IItemDefinition,
  INPCDefinition,
  IQuest,
  QuestRewardTypeType,
} from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-quests-editor',
  templateUrl: './quests-editor.component.html',
  styleUrl: './quests-editor.component.scss',
})
export class QuestsEditorComponent extends EditorBaseComponent<IQuest> {
  public canSave = computed(() => {
    const data = this.editing();
    return (
      data.desc &&
      data.giver &&
      data.name &&
      this.satisfiesUnique() &&
      !this.isSaving()
    );
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<IQuest>(
      'quests',
      'name',
      data.name,
      data._id
    );
  });

  public currentItem = signal<IItemDefinition | undefined>(undefined);
  public currentNPC = signal<INPCDefinition | undefined>(undefined);
  public currentQuestReward = signal<QuestRewardTypeType | undefined>(
    undefined
  );

  public addNPC(npc: INPCDefinition | undefined) {
    if (!npc) return;

    this.editing.update((quest) => ({
      ...quest,
      requirements: {
        ...quest.requirements,
        npcIds: [...quest.requirements.npcIds, npc.npcId],
      },
    }));
  }

  public hasNPC(npc: INPCDefinition | undefined): boolean {
    if (!npc) return false;

    return this.editing().requirements.npcIds.includes(npc.npcId);
  }

  public removeNPC(index: number) {
    this.editing.update((quest) => ({
      ...quest,
      requirements: {
        ...quest.requirements,
        npcIds: quest.requirements.npcIds.filter((s, i) => i !== index),
      },
    }));
  }

  public addQuestReward(reward: QuestRewardTypeType | undefined) {
    if (!reward) return;

    this.editing.update((quest) => ({
      ...quest,
      rewards: [
        ...quest.rewards,
        { type: reward, value: 0, statName: undefined },
      ],
    }));
  }

  public hasQuestReward(reward: QuestRewardTypeType | undefined): boolean {
    if (!reward) return false;

    return this.editing().rewards.some((r) => r.type === reward);
  }

  public removeQuestReward(index: number) {
    this.editing.update((quest) => ({
      ...quest,
      rewards: quest.rewards.filter((s, i) => i !== index),
    }));
  }

  doSave() {
    this.isSaving.set(true);

    setTimeout(() => {
      const core = this.editing();

      this.editing.set(core);

      super.doSave();
    }, 50);
  }
}
