import { StatType } from './building-blocks';

export interface ITrait {
  name: string;
  desc: string;
  icon: string;
  isAncient?: boolean;
  valuePerTier?: number;
  statsGiven?: Partial<Record<StatType, number>>;
}
