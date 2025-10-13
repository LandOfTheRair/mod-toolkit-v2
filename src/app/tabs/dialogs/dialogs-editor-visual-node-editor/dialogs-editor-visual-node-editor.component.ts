import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { cloneDeep } from 'lodash';
import {
  DialogActionType,
  IDialogAction,
  IDialogItem,
  ItemSlot,
} from '../../../../interfaces';

@Component({
  selector: 'app-dialogs-editor-visual-node-editor',
  standalone: false,
  templateUrl: './dialogs-editor-visual-node-editor.component.html',
  styleUrl: './dialogs-editor-visual-node-editor.component.scss',
})
export class DialogsEditorVisualNodeEditorComponent {
  public action = input.required<IDialogAction>();
  public save = output<IDialogAction>();
  public unselect = output<void>();

  public actionClone = signal<IDialogAction>({} as IDialogAction);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  public castToAny = computed(() => this.actionClone() as any);

  public checkPropertyValueType = signal<'string' | 'number'>('string');

  constructor() {
    effect(() => {
      this.setItemData(this.action());
    });
  }

  private setItemData(data: IDialogAction) {
    this.actionClone.set(cloneDeep(data));

    if (data.checkValue) {
      this.checkPropertyValueType.set(
        typeof data.checkValue === 'number' ? 'number' : 'string',
      );
    }
  }

  public swapPropertyValueType() {
    this.actionClone.update((a) => {
      if (a.checkValue !== undefined) {
        if (this.checkPropertyValueType() === 'number') {
          const parsed = parseFloat(a.checkValue as string);
          a.checkValue = isNaN(parsed) ? 0 : parsed;
        } else {
          a.checkValue = String(a.checkValue);
        }
      }
      return a;
    });
  }

  public changeTypes(newType: DialogActionType) {
    const distance = this.actionClone().maxDistance;
    const newTypeObj = { type: newType } as IDialogAction;
    if (distance) newTypeObj.maxDistance = distance;

    if ([DialogActionType.CheckQuest].includes(newType)) {
      newTypeObj.questCompleteActions = [];
    }

    if (
      [
        DialogActionType.HasQuest,
        DialogActionType.CheckEffect,
        DialogActionType.CheckItemCanUpgrade,
        DialogActionType.CheckItem,
        DialogActionType.CheckNoItem,
        DialogActionType.CheckLevel,
        DialogActionType.CheckHoliday,
        DialogActionType.CheckAnyHostilesNearby,
        DialogActionType.CheckNPCsAndDropItems,
      ].includes(newType)
    ) {
      newTypeObj.checkPassActions = [];
      newTypeObj.checkFailActions = [];
    }

    if (
      [
        DialogActionType.CheckDailyQuest,
        DialogActionType.GiveDailyQuest,
      ].includes(newType)
    ) {
      newTypeObj.quests = [''];
    }

    if ([DialogActionType.Chat].includes(newType)) {
      newTypeObj.options = [{ text: '', action: '', requirement: {} }];
    }

    if (
      [
        DialogActionType.GiveItem,
        DialogActionType.ModifyItem,
        DialogActionType.TakeItem,
        DialogActionType.CheckItem,
      ].includes(newType)
    ) {
      (newTypeObj as any).item = {
        name: '',
        amount: 1,
      } as IDialogItem;
    }

    if (
      [
        DialogActionType.GiveItem,
        DialogActionType.ModifyItem,
        DialogActionType.TakeItem,
        DialogActionType.CheckItem,
        DialogActionType.CheckNoItem,
      ].includes(newType)
    ) {
      (newTypeObj as any).slot = ['' as ItemSlot];
    }

    if ([DialogActionType.CheckNPCsAndDropItems].includes(newType)) {
      (newTypeObj as any).npcs = [''];
    }

    if ([DialogActionType.ModifyItem].includes(newType)) {
      (newTypeObj as any).mods = {};
    }

    this.actionClone.set(newTypeObj);
  }

  addDailyQuest() {
    this.actionClone.update((a) => {
      if (!a.quests) a.quests = [];
      a.quests.push('');
      return a;
    });
  }

  removeDailyQuest(idx: number) {
    this.actionClone.update((a) => {
      if (!a.quests) a.quests = [];
      a.quests.splice(idx, 1);
      return a;
    });
  }

  addSlot() {
    this.actionClone.update((a) => {
      if (!(a as any).slot) (a as any).slot = [];
      (a as any).slot.push('' as ItemSlot);
      return a;
    });
  }

  removeSlot(idx: number) {
    this.actionClone.update((a) => {
      if (!(a as any).slot) (a as any).slot = [];
      (a as any).slot.splice(idx, 1);
      return a;
    });
  }

  addNPC() {
    this.actionClone.update((a) => {
      if (!(a as any).npcs) (a as any).npcs = [];
      (a as any).npcs.push('');
      return a;
    });
  }

  removeNPC(idx: number) {
    this.actionClone.update((a) => {
      if (!(a as any).npcs) (a as any).npcs = [];
      (a as any).npcs.splice(idx, 1);
      return a;
    });
  }

  addOption() {
    this.actionClone.update((a) => {
      if (!a.options) a.options = [];
      a.options.push({ text: '', action: '', requirement: {} });
      return a;
    });
  }

  removeOption(idx: number) {
    this.actionClone.update((a) => {
      if (!a.options) a.options = [];
      a.options.splice(idx, 1);
      return a;
    });
  }
}
