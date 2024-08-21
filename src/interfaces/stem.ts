import { IEffect } from './effect';
import { HasIdentification } from './identified';
import { IMacro } from './macro';
import { ISpell } from './spell';
import { ITrait } from './trait';

export interface ISTEM extends HasIdentification {
  _hasSpell: boolean;
  _hasTrait: boolean;
  _hasEffect: boolean;
  _hasMacro: boolean;

  name: string;
  _gameId: string;

  all: {
    desc: string;
    icon: string;
    color: string;
    bgColor: string;
  };

  spell: ISpell;
  trait: ITrait;
  effect: IEffect;
  macro: IMacro;
}
