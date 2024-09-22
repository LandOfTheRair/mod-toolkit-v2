import { BaseClassType, SkillType, TradeskillType } from './building-blocks';
import { HasIdentification } from './identified';

export interface IAchievementRequirements {
  level: {
    baseClass: BaseClassType;
    level: number;
  };

  skill: {
    skill: SkillType;
    level: number;
  };

  tradeskill: {
    tradeskill: TradeskillType;
    level: number;
  };

  kill: {
    npc: string;
  };

  bindItem: {
    item: string;
  };
}

export interface IAchievement extends HasIdentification {
  name: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  iconBorderColor: string;
  activationType: keyof IAchievementRequirements | 'other';
  desc: string;
  ap: number;
  shareWithParty: boolean;
  hidden: boolean;

  requirements: IAchievementRequirements;
}
