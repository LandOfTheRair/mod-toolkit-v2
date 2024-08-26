import { computed, inject, Injectable, signal } from '@angular/core';
import { chunk, difference, get, sortBy, sumBy, uniq } from 'lodash';
import {
  AnalysisDisplayRow,
  AnalysisDisplayType,
  AnalysisReport,
  AnalysisReportDisplay,
  IItemDefinition,
  ItemClass,
  ItemClassType,
  Stat,
  StatType,
} from '../../interfaces';
import { ModService } from './mod.service';

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

  public generateProgressionReport(
    itemClasses: ItemClassType[]
  ): AnalysisReport {
    const items = this.modService.mod().items;
    const filterItemClasses = structuredClone(itemClasses);

    let baseTitleSuffix = filterItemClasses.join(', ');
    const baseItemFilters: Array<(i: IItemDefinition) => boolean> = [
      (i) => get(i, 'requirements.level', 1) > 1,
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

    const sorted = sortBy(allMatchingItems, (item) => item.requirements?.level);

    const dataRows: AnalysisDisplayRow[] = sorted.map((i) => ({
      itemName: i.name,
      posttext: `(Level ${i.requirements?.level})`,
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
        title: `Global Armor Distribution`,
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
}
