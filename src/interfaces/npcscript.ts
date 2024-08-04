import {
  Alignment,
  Allegiance,
  BoundedNumber,
  Hostility,
  ItemSlot,
  Rollable,
  Stat,
} from './building-blocks';
import { ISimpleItem } from './item';

export interface IItemContainer {
  items: ISimpleItem[];
}

export interface ICharacterItems {
  equipment: Partial<Record<ItemSlot, ISimpleItem>>;

  sack: IItemContainer;
  belt: IItemContainer;

  buyback: ISimpleItem[];
}

export interface INPCScript {
  tag: string;
  name?: string;
  affiliation?: string;
  hostility?: Hostility;
  level?: number;
  hp?: BoundedNumber;
  mp?: BoundedNumber;
  otherStats?: Partial<Record<Stat, number>>;
  usableSkills?: string[] | Rollable[];
  items?: ICharacterItems;
  dialog?: Record<string, any>;
  allegiance?: Allegiance;
  x?: number;
  y?: number;
  sprite?: number;
  alignment?: Alignment;
  extraProps?: string[];
}
