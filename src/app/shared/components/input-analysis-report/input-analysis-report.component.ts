import {
  Component,
  computed,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import {
  AnalysisReportType,
  ArmorClasses,
  ItemClass,
  ItemClassType,
  RobeClasses,
  ShieldClasses,
} from '../../../../interfaces';
import { armorClasses, weaponClasses } from '../../../helpers';

export type ReportModel = {
  category: string;
  type: AnalysisReportType;
  data: {
    itemClasses?: ItemClassType[];
    itemClass?: ItemClass;
    spellName?: string;
  };
  value: string;
  desc: string;
};

@Component({
  selector: 'app-input-analysis-report',
  templateUrl: './input-analysis-report.component.html',
  styleUrl: './input-analysis-report.component.scss',
})
export class InputAnalysisReportComponent implements OnInit {
  public report = model.required<string | undefined>();
  public label = input<string>('Report');
  public change = output<ReportModel | undefined>();
  public defaultValue = input<string>();

  public values = computed(() => {
    return [
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
        value: 'Singular Weapon/Armor Type',
        type: AnalysisReportType.ProgressionSingle,
        data: {},
        desc: `Level-by-level progression report.`,
      },
      {
        category: 'Item Progression (Aggregate)',
        value: 'Armors',
        type: AnalysisReportType.ProgressionAggregate,
        data: {
          itemClasses: ArmorClasses,
        },
        desc: `Level-by-level progression report (includes every Armor-adjacent item).`,
      },
      {
        category: 'Item Progression (Aggregate)',
        value: 'Robes',
        type: AnalysisReportType.ProgressionAggregate,
        data: {
          itemClasses: RobeClasses,
        },
        desc: `Level-by-level progression report (includes every Robe-adjacent item).`,
      },
      {
        category: 'Item Progression (Aggregate)',
        value: 'Shields',
        type: AnalysisReportType.ProgressionAggregate,
        data: {
          itemClasses: ShieldClasses,
        },
        desc: `Level-by-level progression report (includes every Shield-adjacent item).`,
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
        value: 'Gem',
        type: AnalysisReportType.GemStats,
        data: {},
        desc: 'A breakdown of each gem stat per item slot.',
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
        category: 'Miscellaneous',
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
    ] as ReportModel[];
  });

  ngOnInit() {
    if (this.defaultValue()) {
      const defaultObj = this.values().find(
        (f) => f.value === this.defaultValue()
      );
      if (!defaultObj) return;

      this.report.set(defaultObj.value);
      this.change.emit(defaultObj);
    }
  }

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
