import { BuffType, MacroActivationType, Stat } from '../../interfaces';
import { ISTEM } from '../../interfaces/stem';
import { id } from './id';

export const defaultSTEM: () => ISTEM = () => {
  return {
    _id: id(),
    _hasSpell: false,
    _hasTrait: false,
    _hasEffect: false,
    _hasMacro: false,
    _isNPCOnly: false,

    name: '',
    _gameId: '',

    all: {
      desc: '',
      icon: 'uncertainty',
      color: '',
      bgColor: '',
    },

    effect: {
      tooltip: {
        name: '',
        color: '',
        bgColor: '',
        desc: '',
        icon: undefined as unknown as string,
      },
      effect: {
        type: undefined as unknown as BuffType,
        duration: 0,
        durationScaleStat: Stat.INT,
        durationScaleValue: 100,
        extra: {
          potency: 0,
          canRemove: false,
          unique: true,
          doesTick: false,
          persistThroughDeath: false,
          canOverlapUniqueIfEquipped: false,
          charges: 0,
          statChanges: {},
          spriteChange: -1,
        },
      },
      effectMeta: {},
    },

    macro: {
      name: '',
      macro: '',
      icon: undefined as unknown as string,
      color: '',
      bgColor: '',
      mode: undefined as unknown as MacroActivationType,
      key: '',
      tooltipDesc: '',
      isDefault: false,
    },

    spell: {
      spellName: '',
      maxSkillForGain: 0,
      mpCost: 0,
      castTime: 0,
      cooldown: 0,
      potencyMultiplier: 1,
      bonusRollsMin: 0,
      bonusRollsMax: 0,
      willSaveThreshold: 0,
      willSavePercent: 0,
      skillMultiplierChanges: [[0, 1]],
      spellMeta: {
        bonusAgro: 0,
        creatureSummoned: [],
        fizzledBy: [],
      },
    },

    trait: {
      name: '',
      desc: '',
      icon: undefined as unknown as string,
      borderColor: '',
      iconBgColor: '',
      iconColor: '',
      spellGiven: '',
      isAncient: false,
      valuePerTier: 0,
      statsGiven: {},
    },
  };
};
