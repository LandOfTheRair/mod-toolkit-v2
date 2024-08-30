import {
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { sortBy } from 'lodash';
import {
  AnalysisReportType,
  ArmorClasses,
  ItemClass,
  ItemClassType,
  RobeClasses,
  ShieldClasses,
} from '../../../../interfaces';
import { armorClasses, weaponClasses } from '../../../helpers';
import { ModService } from '../../../services/mod.service';

export type ReportModel = {
  category: string;
  type: AnalysisReportType;
  data: {
    itemClasses?: ItemClassType[];
    itemClass?: ItemClass;
    spellName?: string;
  };
  value: string;
};

@Component({
  selector: 'app-input-analysis-report',
  templateUrl: './input-analysis-report.component.html',
  styleUrl: './input-analysis-report.component.scss',
})
export class InputAnalysisReportComponent {
  private modService = inject(ModService);

  public report = model.required<ReportModel | undefined>();
  public label = input<string>('Report');
  public change = output<ReportModel | undefined>();

  private allCalculableSpells = computed(() => {
    return this.modService
      .mod()
      .stems.filter(
        (s) => s._hasSpell && s.spell.skillMultiplierChanges?.length > 0
      );
  });

  public values = computed(() => {
    return sortBy(
      [
        {
          category: 'Potency Estimator',
          value: 'Spells',
          type: AnalysisReportType.SpellPotency,
          data: {},
          desc: `Level/skill varied damage calculator.`,
        },
        {
          category: 'Potency Estimator',
          value: 'Weapons',
          type: AnalysisReportType.WeaponPotency,
          data: {},
          desc: `Level/skill varied damage calculator.`,
        },
        {
          category: 'Item Progression (Singular)',
          value: 'Singular Weapon/Armor Class',
          type: AnalysisReportType.ProgressionSingle,
          data: {},
          desc: `Level-by-level progression report.`,
        },
        {
          category: 'Item Progression (Aggregate)',
          value: 'Shield',
          type: AnalysisReportType.ProgressionAggregate,
          data: {
            itemClasses: ShieldClasses,
          },
          desc: `Level-by-level progression report (includes every Shield-adjacent item).`,
        },
        {
          category: 'Item Progression (Aggregate)',
          value: 'Armor',
          type: AnalysisReportType.ProgressionAggregate,
          data: {
            itemClasses: ArmorClasses,
          },
          desc: `Level-by-level progression report (includes every Armor-adjacent item).`,
        },
        {
          category: 'Item Progression (Aggregate)',
          value: 'Robe',
          type: AnalysisReportType.ProgressionAggregate,
          data: {
            itemClasses: RobeClasses,
          },
          desc: `Level-by-level progression report (includes every Robe-adjacent item).`,
        },
        {
          category: 'Stat Report',
          value: 'Armor',
          type: AnalysisReportType.ArmorAverage,
          data: {
            itemClasses: armorClasses,
          },
          desc: 'A global and individual breakdown of each armor type, including average stats per bracket.',
        },
        {
          category: 'Stat Report',
          value: 'Weapon',
          type: AnalysisReportType.WeaponAverage,
          data: {
            itemClasses: weaponClasses,
          },
          desc: 'A global and individual breakdown of each weapon type, including average stats per bracket.',
        },
        {
          category: 'Stat Report',
          value: 'Gem',
          type: AnalysisReportType.GemStats,
          data: {},
          desc: 'A breakdown of each gem stat per item slot.',
        },
        {
          category: 'Stat Report',
          value: 'Stat Utilization',
          type: AnalysisReportType.StatUtilization,
          data: {},
          desc: 'A breakdown of each stats utilization across weapons and armors',
        },
        {
          category: 'Miscellaneous',
          value: 'Traits',
          type: AnalysisReportType.TraitUsage,
          data: {},
          desc: 'A breakdown of trait usage, including unused traits.',
        },
      ],
      ['category', 'value']
    );
  });

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
