import { INPCScript } from '../../interfaces';
import { id } from './id';

export const defaultNPCScript: () => INPCScript = () => ({
  _id: id(),
  tag: undefined as unknown as string,
  name: '',
  affiliation: '',
  hostility: 'Never',
  allegiance: 'Adventurers',
  alignment: 'neutral',
  level: 1,
  hp: {
    min: 100000,
    max: 100000,
  },
  mp: {
    min: 10000,
    max: 10000,
  },
  otherStats: {},
  usableSkills: [],
  items: {
    equipment: {
      rightHand: undefined as unknown as string,
      leftHand: undefined as unknown as string,
      head: undefined as unknown as string,
      neck: undefined as unknown as string,
      ear: undefined as unknown as string,
      waist: undefined as unknown as string,
      wrists: undefined as unknown as string,
      ring1: undefined as unknown as string,
      ring2: undefined as unknown as string,
      hands: undefined as unknown as string,
      feet: undefined as unknown as string,
      armor: undefined as unknown as string,
      robe1: undefined as unknown as string,
      robe2: undefined as unknown as string,
      trinket: undefined as unknown as string,
      potion: undefined as unknown as string,
      ammo: undefined as unknown as string,
    },
  },
  dialog: {
    keyword: {},
  },
  behaviors: [],
});
