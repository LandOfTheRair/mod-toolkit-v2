import {
  BaseClassType,
  IAchievement,
  IAchievementRequirements,
  SkillType,
  TradeskillType,
} from '../../interfaces';
import { id } from './id';

export const defaultAchievementRequirements: () => IAchievementRequirements =
  () => ({
    bindItem: {
      item: '',
    },
    kill: {
      npc: '',
    },
    level: {
      baseClass: undefined as unknown as BaseClassType,
      level: 0,
    },
    skill: {
      level: 0,
      skill: undefined as unknown as SkillType,
    },
    tradeskill: {
      level: 0,
      tradeskill: undefined as unknown as TradeskillType,
    },
  });

export const defaultAchievement: () => IAchievement = () => ({
  _id: id(),
  ap: 0,
  desc: '',
  icon: 'uncertainty',
  iconColor: '',
  iconBgColor: '',
  iconBorderColor: '',
  activationType: 'other',
  hidden: false,
  name: '',
  requirements: defaultAchievementRequirements(),
  shareWithParty: false,
});
