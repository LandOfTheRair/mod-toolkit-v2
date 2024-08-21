import { StatType } from './building-blocks';

export enum BuffType {
  Buff = 'buff',
  Debuff = 'debuff',
  Incoming = 'incoming',
  Outgoing = 'outgoing',
  UseOnly = 'useonly',
}

export type BuffTypeType = `${BuffType}`;

export interface IStatusEffectInfo {
  potency: number;
  canRemove?: boolean;
  doesTick?: boolean;
  unique?: boolean | string;
  persistThroughDeath?: boolean;
  canOverlapUniqueIfEquipped?: boolean;
  charges?: number;
  statChanges?: Partial<Record<StatType, number>>;
}

export interface IEffectTooltip {
  name?: string;
  color: string;
  bgColor: string;
  desc?: string;
  icon?: string;
}

export interface IEffectEffect {
  type: BuffType;
  duration: number;
  extra: IStatusEffectInfo;
}

export interface IEffectMeta {
  effectRef?: string;
  recentlyRef?: string;

  castMessage?: string;
  applyMessage?: string;
  unapplyMesage?: string;

  castSfx?: string;
  applySfx?: string;

  noStack?: boolean;
}

export interface IEffect {
  tooltip: IEffectTooltip;
  effect: IEffectEffect;
  effectMeta: IEffectMeta;
}
