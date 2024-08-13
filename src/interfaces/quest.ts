import { HasIdentification } from './identified';

export enum QuestRewardType {
  XP = 'xp',
  Gold = 'gold',
  Silver = 'silver',
  Reputation = 'reputation',
  Stat = 'stat',
  HolidayTokens = 'holidayTokens',
}

export type QuestRewardTypeType = `${QuestRewardType}`;

export enum QuestRequirementType {
  Kill = 'kill',
  Item = 'item',
  None = 'none',
  Count = 'count',
  Array = 'array',
}

export type QuestRequirementTypeType = `${QuestRequirementType}`;

export interface IQuestReward {
  type: QuestRewardTypeType;
  statName?: any;
  value: number;
}

export interface IQuestRequirementItem {
  item: string;
  fromHands?: boolean;
  fromSack?: boolean;
}

export interface IQuestRequirementKill {
  npcIds: string[];
  killsRequired: number;
}

export interface IQuestRequirementCount {
  countRequired: number;
}

export interface IQuestRequirementArray {
  itemsRequired: number;
}

export type IQuestRequirement = IQuestRequirementKill &
  IQuestRequirementItem &
  IQuestRequirementCount &
  IQuestRequirementArray & { type: QuestRequirementTypeType };

export interface IQuest extends HasIdentification {
  name: string;
  desc: string;
  giver: string;

  isDaily?: boolean;
  isRepeatable?: boolean;

  messages: {
    kill?: string;
    complete?: string;
    incomplete?: string;
    alreadyHas?: string;
    permComplete?: string;
  };

  requirements: IQuestRequirement;
  rewards: IQuestReward[];
}
