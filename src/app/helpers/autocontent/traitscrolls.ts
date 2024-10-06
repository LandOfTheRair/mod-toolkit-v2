import { startCase } from 'lodash';
import {
  IItemDefinition,
  IModKit,
  ItemClass,
  Skill,
} from '../../../interfaces';
import { id } from '../id';

const romans: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

const TRAIT_PREFIX = `Rune Scroll -`;

export function generateTraitScrolls(mod: IModKit): IItemDefinition[] {
  const scrollToClass: Record<string, string[]> = {};
  const allRuneScrolls = new Set<string>();

  const returnedRuneScrolls: IItemDefinition[] = [];

  const banned = ['Unimbued'];
  const shouldBind: string[] = [];

  const allHolidays = mod.cores.find((f) => f.name === 'holidaydescs');
  if (allHolidays) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.values(allHolidays.json ?? {}).forEach((holidayValue: any) => {
      if (!holidayValue.traits) return;

      shouldBind.push(...(holidayValue.traits as string[]));
    });
  }

  const firstLevelFound: Record<string, number> = {};

  mod.stems.forEach((stem) => {
    if (!stem._hasTrait) return;

    const traitData = stem.trait;

    if (
      traitData.spellGiven ||
      traitData.isAncient ||
      stem._hasSpell ||
      banned.includes(stem._gameId)
    )
      return;

    allRuneScrolls.add(stem._gameId);
  });

  mod.traitTrees.forEach((classTree) => {
    if (classTree.name === 'Ancient') return;

    Object.keys(classTree.data.trees).forEach((treeName) => {
      if (treeName === 'Ancient') return;

      const tree = classTree.data.trees[treeName].tree;

      tree.forEach(({ traits }: any, row: number) => {
        traits.forEach(({ name, maxLevel }: any) => {
          if (!name) return;
          if (maxLevel <= 1) {
            allRuneScrolls.delete(name as string);
            return;
          }

          scrollToClass[name] ??= [];

          allRuneScrolls.add(name as string);

          const levelRequirement = row * 10;
          firstLevelFound[name] = firstLevelFound[name]
            ? Math.min(levelRequirement, firstLevelFound[name])
            : levelRequirement;

          if (classTree.name !== 'Core' && treeName !== 'Core') {
            scrollToClass[name].push(classTree.name);
          }
        });
      });
    });
  });

  Array.from(allRuneScrolls).forEach((scrollName) => {
    for (let i = 1; i <= 5; i++) {
      const scrollSpaced = startCase(scrollName);
      const itemName = `${TRAIT_PREFIX} ${scrollSpaced} ${romans[i]}`;

      returnedRuneScrolls.push({
        _id: `${id()}-AUTOGENERATED`,
        name: itemName,
        sprite: 681,
        animation: 10,
        desc: `a runic scroll imbued with the empowerment "${scrollSpaced} ${romans[i]}"`,
        trait: {
          name: scrollName,
          level: i,
          restrict: scrollToClass[scrollName],
        },
        requirements: {
          level: (firstLevelFound[scrollName] ?? 0) + i * 5,
        },
        binds: shouldBind.includes(scrollName),
        value: 1,
        itemClass: ItemClass.Scroll,
        type: Skill.Martial,
        stats: {},
        isSackable: true,
      } as IItemDefinition);
    }
  });

  return returnedRuneScrolls;
}

export function countExistingTraitScrolls(mod: IModKit): number {
  return mod.items.filter((i) => i.name.includes(TRAIT_PREFIX)).length;
}

export function applyTraitScrolls(
  mod: IModKit,
  scrolls: IItemDefinition[]
): void {
  mod.items.push(...scrolls);
}

export function cleanOldTraitScrolls(mod: IModKit): void {
  mod.items = mod.items.filter((item) => !item.name.includes(TRAIT_PREFIX));
}
