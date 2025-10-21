import {
  Component,
  computed,
  inject,
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
  desc: string;
};

@Component({
  selector: 'app-input-analysis-report',
  templateUrl: './input-analysis-report.component.html',
  styleUrl: './input-analysis-report.component.scss',
  standalone: false,
})
export class InputAnalysisReportComponent implements OnInit {
  private modService = inject(ModService);

  public report = model.required<string | undefined>();
  public label = input<string>('Report');
  public change = output<ReportModel | undefined>();
  public defaultValue = input<string>();

  public allMaps = computed(() =>
    this.modService.mod().maps.map((map) => map.name),
  );

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
        category: 'Potency Estimator',
        value: 'NPC Potency',
        type: AnalysisReportType.NPCDamage,
        data: {},
        desc: `NPC potency estimation report.`,
      },
      {
        category: 'Potency Estimator',
        value: 'Map NPC Potency',
        type: AnalysisReportType.MapNPCDamage,
        data: {},
        desc: `NPC potency estimation report for an entire map.`,
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
        category: 'Stat Report',
        value: 'Stats Per Level',
        type: AnalysisReportType.ProgressionStat,
        data: {
          itemClasses: weaponClasses,
        },
        desc: 'A breakdown of each stat average per 5 level bucket.',
      },
      {
        category: 'Miscellaneous',
        value: 'Map Content',
        type: AnalysisReportType.MapContent,
        data: {
          maps: this.allMaps(),
        },
        desc: 'A breakdown of all NPCs and items in a map.',
      },
      {
        category: 'Miscellaneous',
        value: 'Resistance Acquisition',
        type: AnalysisReportType.ResistanceAcquisition,
        data: {},
        desc: 'A breakdown of the max resist for each element at each level.',
      },
      {
        category: 'Miscellaneous',
        value: 'Spell Utilization',
        type: AnalysisReportType.SpellUtilization,
        data: {},
        desc: 'A breakdown of each spells utilization across npcs, players, and items.',
      },
      {
        category: 'Miscellaneous',
        value: 'Stat Utilization',
        type: AnalysisReportType.StatUtilization,
        data: {},
        desc: 'A breakdown of each stats utilization across weapons and armors.',
      },
      {
        category: 'Miscellaneous',
        value: 'Trait Utilization',
        type: AnalysisReportType.TraitUsage,
        data: {},
        desc: 'A breakdown of trait utilization, including unused traits.',
      },
    ] as ReportModel[];
  });

  ngOnInit() {
    if (this.defaultValue()) {
      const defaultObj = this.values().find(
        (f) => f.value === this.defaultValue(),
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
