import { IEffect } from './effect';
import { IMacro } from './macro';
import { ISpell } from './spell';
import { ITrait } from './trait';

export interface ISTEM {
  name: string;

  all: {
    desc: string;
    icon: string;
    color: string;
  };

  spell: ISpell;
  trait: ITrait;
  effect: IEffect;
  macro: IMacro;
}
