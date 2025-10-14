import { Component, computed, OnInit, signal } from '@angular/core';
import { CodeModel } from '@ngstack/code-editor';
import * as yaml from 'js-yaml';
import { isNumber } from 'lodash';

import {
  IBehavior,
  INPCScript,
  ItemSlot,
  ItemSlotType,
  StatType,
} from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-dialogs-editor',
  templateUrl: './dialogs-editor.component.html',
  styleUrl: './dialogs-editor.component.scss',
  standalone: false,
})
export class DialogsEditorComponent
  extends EditorBaseComponent<INPCScript>
  implements OnInit
{
  public readonly key = 'dialogs';
  public readonly tabs = [
    { name: 'Core Stats' },
    { name: 'Behaviors' },
    { name: 'Dialog' },
    { name: 'Dialog (JSON)' },
  ];

  public behaviorText = signal<string>('[]');

  public readonly behaviorModel: CodeModel = {
    language: 'yaml',
    uri: 'behaviors.yml',
    value: '[]',
  };

  public currentStat = signal<StatType | undefined>(undefined);

  public canSave = computed(() => {
    const data = this.editing();
    return data.tag && !this.behaviorError() && !this.isSaving();
  });

  public slotsInOrder = computed(() => {
    return Object.values(ItemSlot).sort() as ItemSlotType[];
  });

  public statsInOrder = computed(() => {
    const npc = this.editing();
    return Object.keys(npc.otherStats ?? {}).sort() as StatType[];
  });

  public behaviorError = computed(() => {
    const text = this.behaviorText();
    try {
      yaml.load(text);
    } catch (e: unknown) {
      return (e as Error).message;
    }
  });

  ngOnInit(): void {
    const npc = this.editing();

    if (npc.behaviors?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.behaviorText.set(yaml.dump(npc.behaviors));
      this.behaviorModel.value = this.behaviorText();
    }

    npc.items ??= {
      equipment: {} as any,
    };

    npc.items.equipment ??= {} as any;

    npc.baseEffects ??= [];
    npc.baseEffects.forEach((eff) => (eff.extra ??= { potency: 0 }));

    npc.hp ??= { min: 1, max: 1 };
    npc.mp ??= { min: 1, max: 1 };

    super.ngOnInit();
  }

  public addStat(stat: StatType | undefined, value = 0) {
    if (!stat) return;

    this.editing.update((npc) => ({
      ...npc,
      otherStats: { ...npc.otherStats, [stat]: value },
    }));
  }

  public removeStat(stat: StatType) {
    this.editing.update((npc) => {
      const newNpc = { ...npc };
      delete npc.otherStats[stat];
      return newNpc;
    });
  }

  public hasStat(stat: StatType | undefined) {
    if (!stat) return false;
    return isNumber(this.editing().otherStats[stat]);
  }

  public addSpell() {
    const npc = this.editing();
    npc.usableSkills.push(undefined as unknown as string);
    this.editing.set(npc);
  }

  public removeSpell(index: number) {
    const npc = this.editing();
    npc.usableSkills.splice(index, 1);
    this.editing.set(npc);
  }

  public onBehaviorChanged(behaviorText: string) {
    this.behaviorText.set(behaviorText);
  }

  public addBaseEffect() {
    const npc = this.editing();
    npc.baseEffects.push({
      endsAt: -1,
      name: undefined as unknown as string,
      extra: {
        potency: 1,
        damageType: undefined,
        enrageTimer: undefined,
      },
    });
    this.editing.set(npc);
  }

  public removeBaseEffect(index: number) {
    const npc = this.editing();
    npc.baseEffects.splice(index, 1);
    this.editing.set(npc);
  }

  doSave() {
    this.isSaving.set(true);

    setTimeout(() => {
      const npc = this.editing();
      npc.usableSkills = npc.usableSkills.filter(Boolean);

      npc.behaviors = yaml.load(this.behaviorText()) as IBehavior[];

      this.editing.set(npc);

      super.doSave();
    }, 50);
  }
}
