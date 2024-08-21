import { StatType } from './building-blocks';

export interface ITrait {
  name: string;
  desc: string;
  icon: string;

  iconColor: string;
  iconBgColor: string;
  borderColor: string;

  isAncient?: boolean;
  valuePerTier?: number;
  spellGiven?: string;
  statsGiven?: Partial<Record<StatType, number>>;
}
