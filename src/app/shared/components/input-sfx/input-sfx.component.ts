import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-input-sfx',
  templateUrl: './input-sfx.component.html',
  styleUrl: './input-sfx.component.scss',
})
export class InputSfxComponent {
  public sfx = model.required<string | undefined>();
  public change = output<string>();

  public label = input<string>('SFX');

  public values = [
    'combat-block-armor',
    'combat-block-weapon',
    'combat-die',
    'combat-hit-melee',
    'combat-hit-spell',
    'combat-kill',
    'combat-miss',
    'combat-special-blunderbuss',

    'env-door-close',
    'env-door-open',
    'env-stairs',

    'monster-bear',
    'monster-bird',
    'monster-dragon',
    'monster-ghost',
    'monster-goblin',
    'monster-rocks',
    'monster-skeleton',
    'monster-turkey',
    'monster-wolf',

    'spell-aoe-fire',
    'spell-aoe-frost',
    'spell-buff-magical',
    'spell-buff',
    'spell-buff-physical',
    'spell-buff-protection',
    'spell-conjure',
    'spell-debuff-give',
    'spell-debuff-receive',
    'spell-heal',
    'spell-sight-effect',
    'spell-special-revive',
    'spell-special-teleport',
  ];
}
