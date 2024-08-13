import { IQuest } from '../../interfaces';
import { id } from './id';

export const defaultQuest: () => IQuest = () => ({
  _id: id(),

  name: '',
  desc: '',
  giver: '',
  isDaily: false,
  isRepeatable: false,

  messages: {
    kill: '',
    complete: '',
    incomplete: '',
    alreadyHas: '',
    permComplete: '',
  },

  requirements: {
    type: 'none',

    npcIds: [],
    killsRequired: 0,

    item: '',
    fromHands: true,
    slot: ['rightHand', 'leftHand'],

    countRequired: 0,

    itemsRequired: 0,
  },

  rewards: [], // { type, statName, value }
});
