import { computed, inject, Injectable, signal } from '@angular/core';
import { chunk, difference, get, sortBy, sum, sumBy, uniq } from 'lodash';
import {
  AnalysisDisplayRow,
  AnalysisDisplayType,
  AnalysisReport,
  AnalysisReportDisplay,
  ArmorClass,
  ArmorClasses,
  EarClasses,
  FeetClasses,
  HandsClasses,
  HeadClasses,
  Holiday,
  IItemDefinition,
  ItemClass,
  ItemClassType,
  NeckClasses,
  RingClasses,
  RobeClasses,
  Stat,
  StatType,
  WaistClasses,
  WeaponClass,
  WristsClasses,
} from '../../interfaces';
import { ISTEM } from '../../interfaces/stem';
import { ModService } from './mod.service';

type WeaponTierInfo = {
  bonus: number[];
  damage: number[];
  scaling: number[];
  strongPercent: number;
  weakPercent: number;
  variance: { min: number; max: number };
};

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  private modService = inject(ModService);

  private maxItemLevel = computed(() =>
    Math.max(
      ...this.modService.mod().items.map((i) => i.requirements?.level ?? 0)
    )
  );

  public isAnalyzing = signal<boolean>(false);

  public toggleAnalyzing(newSetting = !this.isAnalyzing()) {
    this.isAnalyzing.set(newSetting);
  }

  private formatEntryEmphasizeZero(entryCount: number): string {
    return `${entryCount} ${entryCount === 0 ? '⚡' : ''}`;
  }

  public generateProgressionReport(
    itemClasses: ItemClassType[]
  ): AnalysisReport {
    const items = this.modService.mod().items;
    const filterItemClasses = structuredClone(itemClasses);

    let baseTitleSuffix = filterItemClasses.join(', ');
    const baseItemFilters: Array<(i: IItemDefinition) => boolean> = [
      (i) => (get(i, 'requirements.level', 1) ?? 1) > 0,
    ];

    if (itemClasses.includes('Throwing')) {
      baseTitleSuffix = 'Throwing Items';
      filterItemClasses.push(...Object.values(ItemClass));
      baseItemFilters.push((i) => !!i.returnsOnThrow);
    }

    if (itemClasses.includes('TwoHanded')) {
      baseTitleSuffix = 'Two-Handed Items';
      filterItemClasses.push(...Object.values(ItemClass));
      baseItemFilters.push((i) => !!i.twoHanded);
    }

    const allMatchingItems = items.filter(
      (f) =>
        filterItemClasses.includes(f.itemClass) &&
        baseItemFilters.every((filter) => filter(f))
    );

    const sorted = sortBy(
      allMatchingItems,
      (item) => item.requirements?.level ?? 0
    );

    const dataRows: AnalysisDisplayRow[] = sorted.map((i) => ({
      itemName: i.name,
      posttext: `(Level ${i.requirements?.level ?? 0})`,
    }));

    const report: AnalysisReportDisplay = {
      type: AnalysisDisplayType.List,
      list: {
        title: `Level Progression for ${baseTitleSuffix}`,
        rows: dataRows,
      },
    };

    return {
      entries: [report],
    };
  }

  private generateStatReport(
    itemClasses: ItemClassType[],
    getters: Array<(i: IItemDefinition[]) => string> = [],
    levelMin = 0,
    levelMax = this.maxItemLevel()
  ): AnalysisDisplayRow[][] {
    return itemClasses.map((i) => {
      const validItems = this.modService.mod().items.filter((f) => {
        const level = f.requirements?.level ?? 0;
        return i === f.itemClass && level >= levelMin && level <= levelMax;
      });

      return getters.map((g) => ({ pretext: g(validItems) }));
    });
  }

  public generateArmorReport(itemClasses: ItemClassType[]): AnalysisReport {
    const report: AnalysisReportDisplay = {
      type: AnalysisDisplayType.Table,
      table: {
        title: `Global Armor Distribution`,
        headers: [
          'Item Class',
          '# Items',
          'Min. Level',
          'Max. Level',
          'Max. Offense',
          'Avg. Offense',
          'Max. Defense',
          'Avg. Defense',
          'Max. AC',
          'Avg. AC',
        ],
        rows: itemClasses
          .map((iC) =>
            this.generateStatReport(
              [iC],
              [
                () => iC,
                (items) => items.length.toString(),

                (items) =>
                  Math.min(
                    ...items.map((i) => get(i, 'requirements.level', 0))
                  ).toString(),
                (items) =>
                  Math.max(
                    ...items.map((i) => get(i, 'requirements.level', 0))
                  ).toString(),

                (items) =>
                  Math.max(
                    ...items.map((i) => get(i, 'stats.offense', 0))
                  ).toString(),
                (items) =>
                  (
                    sumBy(items, (i) => get(i, 'stats.offense', 0)) /
                    items.length
                  ).toFixed(2),

                (items) =>
                  Math.max(
                    ...items.map((i) => get(i, 'stats.defense', 0))
                  ).toString(),
                (items) =>
                  (
                    sumBy(items, (i) => get(i, 'stats.defense', 0)) /
                    items.length
                  ).toFixed(2),

                (items) =>
                  Math.max(
                    ...items.map((i) => get(i, 'stats.armorClass', 0))
                  ).toString(),
                (items) =>
                  (
                    sumBy(items, (i) => get(i, 'stats.armorClass', 0)) /
                    items.length
                  ).toFixed(2),
              ]
            )
          )
          .flat(),
      },
    };

    const levelRanges = chunk(
      Array(this.maxItemLevel())
        .fill(0)
        .map((_, i) => i + 1),
      5
    );

    levelRanges[0].unshift(0);

    const itemClassReportsPerLevelRange: AnalysisReportDisplay[] =
      itemClasses.map((iC) => ({
        type: AnalysisDisplayType.Table,
        table: {
          title: `Level-based ${iC} Distribution`,
          headers: [
            'Level Range',
            '# Items',
            'Max. Offense',
            'Avg. Offense',
            'Max. Defense',
            'Avg. Defense',
            'Max. AC',
            'Avg. AC',
          ],
          rows: levelRanges
            .map((chunk) =>
              this.generateStatReport(
                [iC],
                [
                  () => `Level ${Math.min(...chunk)}-${Math.max(...chunk)}`,
                  (items) => items.length.toString(),

                  (items) =>
                    items.length === 0
                      ? ''
                      : Math.max(
                          ...items.map((i) => get(i, 'stats.offense', 0))
                        ).toString(),
                  (items) =>
                    items.length === 0
                      ? ''
                      : (
                          sumBy(items, (i) => get(i, 'stats.offense', 0)) /
                          items.length
                        ).toFixed(2),

                  (items) =>
                    items.length === 0
                      ? ''
                      : Math.max(
                          ...items.map((i) => get(i, 'stats.defense', 0))
                        ).toString(),
                  (items) =>
                    items.length === 0
                      ? ''
                      : (
                          sumBy(items, (i) => get(i, 'stats.defense', 0)) /
                          items.length
                        ).toFixed(2),

                  (items) =>
                    items.length === 0
                      ? ''
                      : Math.max(
                          ...items.map((i) => get(i, 'stats.armorClass', 0))
                        ).toString(),
                  (items) =>
                    items.length === 0
                      ? ''
                      : (
                          sumBy(items, (i) => get(i, 'stats.armorClass', 0)) /
                          items.length
                        ).toFixed(2),
                ],
                Math.min(...chunk),
                Math.max(...chunk)
              )
            )
            .flat(),
        },
      }));

    return {
      entries: [report, ...itemClassReportsPerLevelRange],
    };
  }

  public generateWeaponReport(itemClasses: ItemClassType[]): AnalysisReport {
    const report: AnalysisReportDisplay = {
      type: AnalysisDisplayType.Table,
      table: {
        title: `Global Weapon Distribution`,
        headers: [
          'Item Class',
          '# Items',
          'Max. Level',
          'Max. Tier',
          'Avg. Tier',
          'Max. Offense',
          'Avg. Offense',
          'Max. Defense',
          'Avg. Defense',
          'Max. AC',
          'Avg. AC',
        ],
        rows: itemClasses
          .map((iC) =>
            this.generateStatReport(
              [iC],
              [
                () => iC,
                (items) => items.length.toString(),

                (items) =>
                  Math.max(
                    ...items.map((i) => get(i, 'requirements.level', 0))
                  ).toString(),

                (items) =>
                  Math.min(...items.map((i) => get(i, 'tier', 0))).toString(),
                (items) =>
                  Math.max(...items.map((i) => get(i, 'tier', 0))).toString(),

                (items) =>
                  Math.max(
                    ...items.map((i) => get(i, 'stats.offense', 0))
                  ).toString(),
                (items) =>
                  (
                    sumBy(items, (i) => get(i, 'stats.offense', 0)) /
                    items.length
                  ).toFixed(2),

                (items) =>
                  Math.max(
                    ...items.map((i) => get(i, 'stats.defense', 0))
                  ).toString(),
                (items) =>
                  (
                    sumBy(items, (i) => get(i, 'stats.defense', 0)) /
                    items.length
                  ).toFixed(2),

                (items) =>
                  Math.max(
                    ...items.map((i) => get(i, 'stats.weaponArmorClass', 0))
                  ).toString(),
                (items) =>
                  (
                    sumBy(items, (i) => get(i, 'stats.weaponArmorClass', 0)) /
                    items.length
                  ).toFixed(2),
              ]
            )
          )
          .flat(),
      },
    };

    const levelRanges = chunk(
      Array(this.maxItemLevel())
        .fill(0)
        .map((_, i) => i + 1),
      5
    );

    levelRanges[0].unshift(0);

    const itemClassReportsPerLevelRange: AnalysisReportDisplay[] =
      itemClasses.map((iC) => ({
        type: AnalysisDisplayType.Table,
        table: {
          title: `Level-based ${iC} Distribution`,
          headers: [
            'Level Range',
            '# Items',
            'Max. Tier',
            'Avg. Tier',
            'Max. Offense',
            'Avg. Offense',
            'Max. Defense',
            'Avg. Defense',
            'Max. AC',
            'Avg. AC',
          ],
          rows: levelRanges
            .map((chunk) =>
              this.generateStatReport(
                [iC],
                [
                  () => `Level ${Math.min(...chunk)}-${Math.max(...chunk)}`,
                  (items) => items.length.toString(),

                  (items) =>
                    items.length === 0
                      ? ''
                      : Math.max(
                          ...items.map((i) => get(i, 'tier', 0))
                        ).toString(),
                  (items) =>
                    items.length === 0
                      ? ''
                      : (
                          sumBy(items, (i) => get(i, 'tier', 0)) / items.length
                        ).toFixed(2),

                  (items) =>
                    items.length === 0
                      ? ''
                      : Math.max(
                          ...items.map((i) => get(i, 'stats.offense', 0))
                        ).toString(),
                  (items) =>
                    items.length === 0
                      ? ''
                      : (
                          sumBy(items, (i) => get(i, 'stats.offense', 0)) /
                          items.length
                        ).toFixed(2),

                  (items) =>
                    items.length === 0
                      ? ''
                      : Math.max(
                          ...items.map((i) => get(i, 'stats.defense', 0))
                        ).toString(),
                  (items) =>
                    items.length === 0
                      ? ''
                      : (
                          sumBy(items, (i) => get(i, 'stats.defense', 0)) /
                          items.length
                        ).toFixed(2),

                  (items) =>
                    items.length === 0
                      ? ''
                      : Math.max(
                          ...items.map((i) => get(i, 'stats.armorClass', 0))
                        ).toString(),
                  (items) =>
                    items.length === 0
                      ? ''
                      : (
                          sumBy(items, (i) => get(i, 'stats.armorClass', 0)) /
                          items.length
                        ).toFixed(2),
                ],
                Math.min(...chunk),
                Math.max(...chunk)
              )
            )
            .flat(),
        },
      }));

    return {
      entries: [report, ...itemClassReportsPerLevelRange],
    };
  }

  public generateGemReport(): AnalysisReport {
    const items = this.modService.mod().items;
    const allGems = items.filter((i) => i.itemClass === 'Gem');

    const statReport: AnalysisReportDisplay = {
      type: AnalysisDisplayType.Table,
      table: {
        title: 'All Gem Stats',
        headers: [
          'Stat',
          'Slots (#/Total)',
          '# Gems',
          'First Level',
          'Biggest Boost',
        ],
        rows: [],
      },
    };

    const allSlotNames = uniq(
      allGems.map((g) => g.encrustGive?.slots ?? []).flat()
    );

    const allStats: Record<
      string,
      {
        slots: string[];
        numGems: number;
        gemList: string[];
        firstLevel: number;
        firstLevelItem: string;
        biggestBoost: number;
        biggestBoostItem: string;
      }
    > = {};
    allGems.forEach((gem) => {
      const stats: StatType[] = Object.keys(
        gem.encrustGive?.stats ?? {}
      ) as StatType[];
      const slots = gem.encrustGive?.slots ?? [];

      stats.forEach((stat) => {
        allStats[stat] ??= {
          slots: [],
          numGems: 0,
          gemList: [],
          firstLevel: 50,
          firstLevelItem: '',
          biggestBoost: 0,
          biggestBoostItem: '',
        };

        const gemLevel = gem.requirements?.level ?? 0;
        const gemBoost = gem.encrustGive?.stats?.[stat] ?? 0;

        allStats[stat].slots = uniq([...allStats[stat].slots, ...slots]);
        allStats[stat].numGems++;
        allStats[stat].gemList.push(gem.name);
        allStats[stat].firstLevel = Math.min(
          allStats[stat].firstLevel,
          gemLevel
        );
        allStats[stat].biggestBoost = Math.max(
          allStats[stat].biggestBoost,
          gemBoost
        );

        if (allStats[stat].firstLevel === gemLevel) {
          allStats[stat].firstLevelItem = gem.name;
        }

        if (allStats[stat].biggestBoost === gemBoost) {
          allStats[stat].biggestBoostItem = gem.name;
        }
      });
    });

    statReport.table.rows = Object.keys(allStats)
      .sort()
      .map((stat) => {
        const statData = allStats[stat];

        return [
          { pretext: stat },
          {
            pretext: `${statData.slots.length}/${allSlotNames.length}`,
            tooltip: statData.slots.sort().join(', '),
          },
          {
            pretext: `${statData.numGems}/${allGems.length}`,
            tooltip: statData.gemList.sort().join(', '),
          },
          {
            pretext: `${statData.firstLevel}`,
            itemName: statData.firstLevelItem,
          },
          {
            pretext: `${statData.biggestBoost}`,
            itemName: statData.biggestBoostItem,
          },
        ];
      });

    const slotReport: AnalysisReportDisplay = {
      type: AnalysisDisplayType.Table,
      table: {
        title: 'All Gem Slots',
        headers: ['Slot', 'Stats (#/Total)', '# Gems', 'First Level'],
        rows: [],
      },
    };

    const allSlots: Record<
      string,
      {
        stats: string[];
        numGems: number;
        gemList: string[];
        firstLevel: number;
        firstLevelItem: string;
      }
    > = {};
    allGems.forEach((gem) => {
      const stats: StatType[] = Object.keys(
        gem.encrustGive?.stats ?? {}
      ) as StatType[];
      const slots = gem.encrustGive?.slots ?? [];

      slots.forEach((slot) => {
        allSlots[slot] ??= {
          stats: [],
          numGems: 0,
          gemList: [],
          firstLevel: 50,
          firstLevelItem: '',
        };

        const gemLevel = gem.requirements?.level ?? 0;

        allSlots[slot].stats = uniq([...allSlots[slot].stats, ...stats]);
        allSlots[slot].numGems++;
        allSlots[slot].gemList.push(gem.name);
        allSlots[slot].firstLevel = Math.min(
          allSlots[slot].firstLevel,
          gemLevel
        );

        if (allSlots[slot].firstLevel === gemLevel) {
          allSlots[slot].firstLevelItem = gem.name;
        }
      });
    });

    const unusedStats: AnalysisReportDisplay = {
      type: AnalysisDisplayType.List,
      list: {
        title: 'Unused Stats',
        rows: difference(Object.values(Stat), Object.keys(allStats)).map(
          (stat) => ({
            pretext: stat,
          })
        ),
      },
    };

    slotReport.table.rows = allSlotNames.sort().map((slot) => {
      const slotData = allSlots[slot];

      return [
        { pretext: slot },
        {
          pretext: `${slotData.stats.length}/${Object.keys(allStats).length}`,
          tooltip: slotData.stats.sort().join(', '),
        },
        {
          pretext: `${slotData.numGems}/${allGems.length}`,
          tooltip: slotData.gemList.sort().join(', '),
        },
        {
          pretext: `${slotData.firstLevel}`,
          itemName: slotData.firstLevelItem,
        },
      ];
    });

    return {
      entries: [statReport, slotReport, unusedStats],
    };
  }

  public generateTraitReport(): AnalysisReport {
    const items = this.modService.mod().items;
    const npcs = this.modService.mod().npcs;
    const stems = this.modService.mod().stems;
    const trees = this.modService.mod().traitTrees;

    const traitReport: AnalysisReportDisplay = {
      type: AnalysisDisplayType.Table,
      table: {
        title: 'All Trait Usages',
        headers: [
          'Trait',
          '# Usages',
          'Item Usages',
          'NPC Usages',
          'Trait Tree Usages',
        ],
        rows: [],
      },
    };

    traitReport.table.rows = sortBy(
      stems.filter((s) => s._hasTrait),
      'name'
    ).map((stem) => {
      const traitUsage = stem._gameId;

      const baseTrees = trees.map((t) => ({
        name: t.name,
        traits: Object.values(t.data.trees)
          .map((t) => t.tree.flatMap((t) => t.traits.flatMap((m) => m.name)))
          .flat(),
      }));

      const usingItems = items.filter(
        (i) =>
          i.trait?.name === traitUsage ||
          i.randomTrait?.name?.includes(traitUsage) ||
          i.strikeEffect?.name === traitUsage ||
          i.useEffect?.name === traitUsage ||
          i.trapEffect?.name === traitUsage ||
          i.breakEffect?.name === traitUsage ||
          i.encrustGive?.strikeEffect?.name === traitUsage
      );
      const usingNPCs = npcs.filter(
        (n) =>
          n.traitLevels?.[traitUsage] > 0 ||
          n.usableSkills?.some((s) => s.result === traitUsage)
      );
      const usingTrees = baseTrees.filter((t) =>
        t.traits.some((n) => n === traitUsage)
      );

      const formattedTraitInfo = `${traitUsage}${stem._hasSpell ? ' 🔮' : ''}${
        stem._hasTrait ? ' ✨' : ''
      }`;

      return [
        { pretext: formattedTraitInfo, tooltip: stem.all.desc },
        {
          pretext: this.formatEntryEmphasizeZero(
            usingItems.length + usingNPCs.length + usingTrees.length
          ),
        },
        {
          pretext: this.formatEntryEmphasizeZero(usingItems.length),
          tooltip: usingItems.map((i) => i.name).join(', '),
        },
        {
          pretext: this.formatEntryEmphasizeZero(usingNPCs.length),
          tooltip: usingNPCs.map((i) => i.npcId).join(', '),
        },
        {
          pretext: this.formatEntryEmphasizeZero(usingTrees.length),
          tooltip: usingTrees.map((i) => i.name).join(', '),
        },
      ];
    });

    return {
      entries: [traitReport],
    };
  }

  private countStatUtilizationOnItems(
    items: IItemDefinition[],
    stat: StatType
  ): Record<ItemClassType, number> {
    return items.reduce(
      (prev, cur) => ({
        ...prev,
        [cur.itemClass]:
          (prev[cur.itemClass] ?? 0) +
          (cur.stats?.[stat] || cur.randomStats?.[stat] ? 1 : 0),
      }),
      {} as Record<ItemClassType, number>
    );
  }

  public generateStatUtilizationReport(): AnalysisReport {
    const allItems = this.modService.mod().items;

    const weaponClassOrder = Object.values(WeaponClass);
    const allWeapons = allItems.filter((f) =>
      weaponClassOrder.includes(f.itemClass as WeaponClass)
    );

    const weaponReport: AnalysisReportDisplay = {
      type: AnalysisDisplayType.Table,
      table: {
        title: `Weapon Stat Utilization (${allWeapons.length} weapons)`,
        headers: ['Stat', 'Total Uses', ...weaponClassOrder],
        rows: [],
      },
    };

    weaponReport.table.rows = sortBy(
      Object.values(Stat).map((stat) => {
        const statUtilization = this.countStatUtilizationOnItems(
          allWeapons,
          stat
        );

        return [
          { pretext: stat as string },
          {
            pretext: this.formatEntryEmphasizeZero(
              sum(Object.values(statUtilization))
            ),
          },
          ...weaponClassOrder.map((c) => ({
            pretext: this.formatEntryEmphasizeZero(statUtilization[c] ?? 0),
          })),
        ];
      }),
      (row) => -row[1].pretext
    );

    const armorClassOrder = Object.values(ArmorClass);
    const allArmors = allItems.filter((f) =>
      armorClassOrder.includes(f.itemClass as ArmorClass)
    );

    const armorReport: AnalysisReportDisplay = {
      type: AnalysisDisplayType.Table,
      table: {
        title: `Armor Stat Utilization (${allArmors.length} armors)`,
        headers: ['Stat', 'Total Uses', ...armorClassOrder],
        rows: [],
      },
    };

    armorReport.table.rows = sortBy(
      Object.values(Stat).map((stat) => {
        const statUtilization = this.countStatUtilizationOnItems(
          allArmors,
          stat
        );

        return [
          { pretext: stat as string },
          {
            pretext: this.formatEntryEmphasizeZero(
              sum(Object.values(statUtilization))
            ),
          },
          ...armorClassOrder.map((c) => ({
            pretext: this.formatEntryEmphasizeZero(statUtilization[c] ?? 0),
          })),
        ];
      }),
      (row) => -row[1].pretext
    );

    return {
      entries: [weaponReport, armorReport],
    };
  }

  public calculateSpellDamage(
    spell: ISTEM['spell'],
    skill: number,
    stat: number
  ): { min: number; max: number } {
    const calcSkill = skill + 1;
    const maxMult = spell.skillMultiplierChanges
      .filter((m) => m[0] <= skill)
      .reverse()[0][1];

    const potencyMultiplier = spell.potencyMultiplier ?? 1;

    if (spell.spellMeta?.useSkillAsPotency) {
      return {
        min: calcSkill * potencyMultiplier,
        max: calcSkill * potencyMultiplier,
      };
    }

    if (spell.spellMeta?.staticPotency) {
      return {
        min: Math.floor(calcSkill * stat * maxMult * potencyMultiplier),
        max: Math.floor(calcSkill * stat * maxMult * potencyMultiplier),
      };
    }

    const bonusRollsMin = spell.bonusRollsMin ?? 0;
    const bonusRollsMax = spell.bonusRollsMax ?? 0;

    // base rolls
    const baseRollsMin = calcSkill + bonusRollsMin;
    const baseRollsMax = calcSkill + bonusRollsMax;

    // sides = stat
    const basePotencyMin = baseRollsMin * (stat / 2);
    const basePotencyMax = baseRollsMax * (stat / 2 + (stat - stat / 2 + 1));

    const retPotencyMin = basePotencyMin * maxMult * potencyMultiplier;
    const retPotencyMax = basePotencyMax * maxMult * potencyMultiplier;

    return {
      min: retPotencyMin,
      max: retPotencyMax,
    };
  }

  public generateSpellPotencyReport(spellName: string): AnalysisReport {
    const spellData = this.modService
      .mod()
      .stems.find((s) => s._gameId === spellName);
    if (!spellData) return { entries: [] };

    const allReports: AnalysisReportDisplay[] = [];

    for (let skill = 1; skill <= 30; skill++) {
      const spellReport: AnalysisReportDisplay = {
        type: AnalysisDisplayType.Table,
        table: {
          title: `${spellName} Potency Calculations (Skill ${skill})`,
          headers: [
            'Skill Level',
            'Primary Stat',
            'Minimum Expected Potency',
            'Maximum Expected Potency',
          ],
          rows: [],
        },
      };

      for (let stat = 10; stat <= 50; stat += 5) {
        const damage = this.calculateSpellDamage(spellData.spell, skill, stat);

        spellReport.table.rows.push([
          { pretext: skill.toString() },
          { pretext: stat.toString() },
          { pretext: damage.min.toFixed(0) },
          { pretext: damage.max.toFixed(0) },
        ]);
      }

      allReports.push(spellReport);
    }

    return {
      entries: [...allReports],
    };
  }

  private calculateWeaponDamageInfo(weaponTierInfo: WeaponTierInfo): {
    bonus: string;
    damage: string;
    scaling: string;
    variance: string;
  } {
    const ret = {
      bonus: 'none',
      damage: 'none',
      scaling: 'none',
      variance: 'none',
    };

    switch (weaponTierInfo.bonus[0]) {
      case 0: {
        ret.bonus = 'none';
        break;
      }
      case 1: {
        ret.bonus = 'low';
        break;
      }
      case 3: {
        ret.bonus = 'mid';
        break;
      }
      case 5: {
        ret.bonus = 'high';
        break;
      }
      default: {
        ret.bonus = 'unknown';
        break;
      }
    }

    switch (weaponTierInfo.damage[0]) {
      case 1: {
        ret.damage = 'verylow';
        break;
      }
      case 2: {
        ret.damage = 'low';
        break;
      }
      case 3: {
        ret.damage = 'mid-low';
        break;
      }
      case 4: {
        ret.damage = 'mid';
        break;
      }
      case 5: {
        ret.damage = 'mid-high';
        break;
      }
      case 6: {
        ret.damage = 'high';
        break;
      }
      case 7: {
        ret.damage = 'veryhigh';
        break;
      }
      default: {
        ret.damage = 'unknown';
        break;
      }
    }

    switch (weaponTierInfo.scaling[1]) {
      case 1.03: {
        ret.scaling = 'low';
        break;
      }
      case 1.05: {
        ret.scaling = 'mid';
        break;
      }
      case 1.07: {
        ret.scaling = 'high';
        break;
      }
      default: {
        ret.scaling = 'unknown';
        break;
      }
    }

    if (weaponTierInfo.variance.min === 0 && weaponTierInfo.variance.max === 0)
      ret.variance = 'none';
    if (weaponTierInfo.variance.min === 5 && weaponTierInfo.variance.max === 15)
      ret.variance = 'verylow';
    if (
      weaponTierInfo.variance.min === 10 &&
      weaponTierInfo.variance.max === 20
    )
      ret.variance = 'low';
    if (
      weaponTierInfo.variance.min === 10 &&
      weaponTierInfo.variance.max === 30
    )
      ret.variance = 'mid-low';
    if (
      weaponTierInfo.variance.min === 15 &&
      weaponTierInfo.variance.max === 25
    )
      ret.variance = 'mid';
    if (
      weaponTierInfo.variance.min === 20 &&
      weaponTierInfo.variance.max === 35
    )
      ret.variance = 'mid-high';
    if (weaponTierInfo.variance.min === 5 && weaponTierInfo.variance.max === 35)
      ret.variance = 'high';
    if (weaponTierInfo.variance.min === 0 && weaponTierInfo.variance.max === 50)
      ret.variance = 'veryhigh';

    return ret;
  }

  private calculateWeaponDamage(
    weaponTierInfo: WeaponTierInfo,
    scaleStatValues: number[],
    tier: number,
    skill: number,
    stat: number
  ): { min: number; max: number } {
    const scaleStatValue = scaleStatValues[stat - 1];
    const baseDamage =
      weaponTierInfo.damage[tier] *
      weaponTierInfo.scaling[skill] *
      scaleStatValue;

    const damageMin =
      baseDamage +
      (baseDamage * weaponTierInfo.variance.min) / 100 +
      weaponTierInfo.bonus[skill];

    const damageMax =
      baseDamage +
      (baseDamage * weaponTierInfo.variance.max) / 100 +
      weaponTierInfo.bonus[skill];

    return {
      min: damageMin,
      max: damageMax,
    };
  }

  public generateWeaponPotencyReport(
    itemClass: ItemClassType | undefined,
    tier = 1
  ): AnalysisReport {
    if (!itemClass) return { entries: [] };

    const weaponTierInfo = this.modService
      .mod()
      .cores.find((c) => c.name === 'weapontiers')?.json[itemClass];

    const statScaling = this.modService
      .mod()
      .cores.find((c) => c.name === 'statdamagemultipliers')?.json.str;
    if (!weaponTierInfo || !statScaling) return { entries: [] };

    const weaponDamageInfo = this.calculateWeaponDamageInfo(
      weaponTierInfo as WeaponTierInfo
    );

    const allReports: AnalysisReportDisplay[] = [];

    const damageInformationReport: AnalysisReportDisplay = {
      type: AnalysisDisplayType.Table,
      table: {
        title: `${itemClass} Damage Information (Tier ${tier})`,
        headers: [
          'Base Damage',
          'Scaling',
          'Variance',
          'Bonus Damage',
          'Weak Hit %',
          'Strong Hit %',
        ],
        rows: [
          [
            { pretext: weaponDamageInfo.damage },
            { pretext: weaponDamageInfo.scaling },
            { pretext: weaponDamageInfo.variance },
            { pretext: weaponDamageInfo.bonus },
            { pretext: weaponTierInfo.weakPercent + '%' },
            { pretext: weaponTierInfo.strongPercent + '%' },
          ],
        ],
      },
    };

    allReports.push(damageInformationReport);

    for (let skill = 1; skill <= 30; skill++) {
      const weaponReport: AnalysisReportDisplay = {
        type: AnalysisDisplayType.Table,
        table: {
          title: `${itemClass} Damage Calculations (Skill ${skill}, Tier ${tier})`,
          headers: [
            'Skill Level',
            'Primary Stat',
            'Minimum Expected Potency',
            'Maximum Expected Potency',
          ],
          rows: [],
        },
      };

      for (let stat = 10; stat <= 50; stat += 5) {
        const damage = this.calculateWeaponDamage(
          weaponTierInfo as WeaponTierInfo,
          statScaling as number[],
          tier,
          skill,
          stat
        );

        weaponReport.table.rows.push([
          { pretext: skill.toString() },
          { pretext: stat.toString() },
          { pretext: damage.min.toFixed(0) },
          { pretext: damage.max.toFixed(0) },
        ]);
      }

      allReports.push(weaponReport);
    }

    return {
      entries: [...allReports],
    };
  }

  private getBestItemsForStatPerLevel(
    level: number,
    stat: StatType
  ): IItemDefinition[] {
    const allEquippableItems = this.modService
      .mod()
      .items.filter(
        (f) =>
          f.itemClass !== ItemClass.Gem &&
          (f.stats?.[stat] ?? 0) > 0 &&
          f.sprite !== -1 &&
          !f.destroyOnDrop &&
          !Object.values(Holiday).some((s) => f.name.includes(s))
      );

    const slotsToFill: ItemClassType[][] = [
      ArmorClasses.slice(),
      RobeClasses.slice(),
      RobeClasses.slice(),
      HeadClasses.slice(),
      NeckClasses.slice(),
      WaistClasses.slice(),
      WristsClasses.slice(),
      RingClasses.slice(),
      RingClasses.slice(),
      FeetClasses.slice(),
      HandsClasses.slice(),
      EarClasses.slice(),
    ];

    const bestItems = slotsToFill.map((s) => {
      return sortBy(
        allEquippableItems.filter(
          (i) =>
            (i.requirements?.level ?? 0) <= level && s.includes(i.itemClass)
        ),
        (i) => -(i.stats?.[stat] ?? 0)
      )[0];
    });

    return bestItems.filter(Boolean);
  }

  public generateResistanceAcquisitionReport(): AnalysisReport {
    const resistanceStats: StatType[] = [
      'physicalResist',
      'magicalResist',
      'necroticResist',
      'energyResist',
      'diseaseResist',
      'poisonResist',
      'fireResist',
      'iceResist',
      'waterResist',
      'sonicResist',
    ];

    const allReports: AnalysisReportDisplay[] = [];

    const statReport: AnalysisReportDisplay = {
      type: AnalysisDisplayType.Table,
      table: {
        title: `Max Resistances Per Level (No Encrust & No Holiday)`,
        headers: ['Level', ...resistanceStats],
        rows: [],
      },
    };

    for (let level = 1; level <= 50; level++) {
      const row: AnalysisDisplayRow[] = [
        {
          pretext: level.toString(),
        },
      ];

      resistanceStats.forEach((stat) => {
        const items = this.getBestItemsForStatPerLevel(level, stat);
        const sum = sumBy(items, (i) => i.stats?.[stat] ?? 0);

        row.push({
          pretext: sum.toString() ?? '-',
          tooltip: `${items.map((s) => s.name).join(', ')}`,
        });
      });

      statReport.table.rows.push(row);
    }

    allReports.push(statReport);

    return {
      entries: [...allReports],
    };
  }
}
