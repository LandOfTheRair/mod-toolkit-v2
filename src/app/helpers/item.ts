import { IItemDefinition, ItemClassType, SkillType } from '../../interfaces';
import { id } from './id';

export const defaultItem: () => IItemDefinition = () => ({
  _id: id(),
  sprite: 0,
  quality: 0,
  name: '',
  itemClass: undefined as unknown as ItemClassType,
  maxUpgrades: 0,
  value: 1,
  sellValue: 0,
  desc: 'an item',
  damageClass: 'physical',
  stats: {},
  randomStats: {},
  type: 'martial',
  secondaryType: undefined as unknown as SkillType,
  succorInfo: undefined,
  cosmetic: { name: '' },
  containedItems: [],
  trait: { name: undefined as unknown as string, level: 0 },
  randomTrait: { name: [], level: { min: 0, max: 0 } },
  useEffect: {
    name: undefined as unknown as string,
    potency: 0,
    duration: 0,
    extra: { statChanges: {}, tooltip: '', message: '' },
  },
  strikeEffect: {
    name: undefined as unknown as string,
    potency: 0,
    duration: 0,
    chance: 0,
  },
  breakEffect: {
    name: undefined as unknown as string,
    potency: 0,
    duration: 0,
  },
  equipEffect: {
    name: undefined as unknown as string,
    potency: 0,
    duration: 0,
  },
  requirements: { baseClass: undefined, level: 0 },
});
