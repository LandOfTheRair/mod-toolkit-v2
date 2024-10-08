import {
  IItemDefinition,
  IModKit,
  ItemClass,
  Skill,
} from '../../../interfaces';
import { id } from '../id';

const LORE_DROP_RATE = 10000;
const LORE_PREFIX = `Lore Scroll - Gem -`;

export function generateLoreScrolls(mod: IModKit): IItemDefinition[] {
  const allGems = mod.items.filter(
    (x) =>
      x.itemClass === 'Gem' &&
      !['Solokar', 'Orikurnis'].some((region) => x.name.includes(region))
  );

  const allGemScrollDescs = allGems.map((x) => {
    const allKeys = Object.keys(x.encrustGive?.stats ?? {}).map((z) =>
      z.toUpperCase()
    );

    const allGemEffects = [];

    if (allKeys.length > 0) {
      allGemEffects.push(`boost your ${allKeys.join(', ')}`);
    }

    if (x.useEffect) {
      allGemEffects.push(
        `grant the spell ${x.useEffect.name.toUpperCase()} when used`
      );
    }

    if (x.encrustGive?.strikeEffect) {
      allGemEffects.push(
        `grant the on-hit spell ${x.encrustGive.strikeEffect.name.toUpperCase()} when encrusted`
      );
    }

    if (allGemEffects.length === 0) {
      allGemEffects.push(`sell for a lot of gold`);
    }

    const effectText = allGemEffects.join(' and ');

    const bonusText = x.encrustGive?.slots
      ? `- be careful though, it can only be used in ${x.encrustGive?.slots.join(
          ', '
        )} equipment`
      : '';

    return {
      _itemName: x.name,
      scrollDesc: `If you find ${x.desc}, it will ${effectText} ${bonusText}`,
    };
  });

  const allGemLoreItems: IItemDefinition[] = allGemScrollDescs.map(
    ({ _itemName, scrollDesc }) => {
      const itemName = `${LORE_PREFIX} ${_itemName}`;

      return {
        _id: `${id()}-AUTOGENERATED`,
        name: itemName,
        sprite: 224,
        value: 1,
        desc: `Twean's Gem Codex: ${scrollDesc}`.trim(),
        itemClass: ItemClass.Scroll,
        isSackable: true,
        type: Skill.Martial,
      } as unknown as IItemDefinition;
    }
  );

  return allGemLoreItems;
}

export function cleanOldLoreScrolls(mod: IModKit): void {
  mod.items = mod.items.filter((item) => !item.name.includes(LORE_PREFIX));

  mod.drops.forEach((droptable) => {
    droptable.drops = droptable.drops.filter(
      (item) => !item.result.includes(LORE_PREFIX)
    );
  });
}

export function countExistingLoreScrolls(mod: IModKit): number {
  return mod.items.filter((i) => i.name.includes(LORE_PREFIX)).length;
}

export function applyLoreScrolls(mod: IModKit, lore: IItemDefinition[]): void {
  mod.items.push(...lore);

  lore.forEach((loreItem) => {
    const loreItemName = loreItem.name.split(LORE_PREFIX).join('').trim();

    mod.drops.forEach((droptable) => {
      if (!droptable.drops.some((i) => i.result === loreItemName)) return;

      droptable.drops.push({
        result: loreItem.name,
        chance: 1,
        maxChance: LORE_DROP_RATE,
      });
    });
  });
}
