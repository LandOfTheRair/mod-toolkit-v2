import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { maxBy } from 'lodash';
import { AnalysisReportType, ItemClassType } from '../../interfaces';
import { AnalysisService } from '../services/analysis.service';
import { ModService } from '../services/mod.service';
import { ReportModel } from '../shared/components/input-analysis-report/input-analysis-report.component';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss',
})
export class AnalysisComponent implements OnInit {
  public exit = output();
  public changeURLProp = output<[string, string | undefined]>();
  public defaultReport = input<string | null>();
  public defaultItemclass = input<string | null>();
  public defaultSpell = input<string | null>();
  public defaultTier = input<string | null>();
  public defaultMap = input<string | null>();

  public analysisService = inject(AnalysisService);
  public modService = inject(ModService);

  public reportType = signal<AnalysisReportType | undefined>(undefined);
  public reportDataArgs = signal<ReportModel['data'] | undefined>(undefined);
  public itemClassInput = signal<ItemClassType | undefined>(undefined);
  public spellNameInput = signal<string | undefined>(undefined);
  public mapNameInput = signal<string | undefined>(undefined);
  public tierInput = signal<number>(1);

  public maxTier = computed(() => {
    return maxBy(this.modService.mod().items, 'tier')?.tier ?? 1;
  });

  public report = signal<string | undefined>(undefined);
  public reportData = computed(() => {
    const reportType = this.reportType();
    const reportArgs = this.reportDataArgs();

    const chosenItemClass = this.itemClassInput();
    const chosenSpellName = this.spellNameInput();
    const chosenItemTier = this.tierInput();

    switch (reportType) {
      case AnalysisReportType.ArmorAverage: {
        return this.analysisService.generateArmorReport(
          reportArgs?.itemClasses ?? [],
        );
      }

      case AnalysisReportType.WeaponAverage: {
        return this.analysisService.generateWeaponReport(
          reportArgs?.itemClasses ?? [],
        );
      }

      case AnalysisReportType.GemStats: {
        return this.analysisService.generateGemReport();
      }

      case AnalysisReportType.StatUtilization: {
        return this.analysisService.generateStatUtilizationReport();
      }

      case AnalysisReportType.TraitUsage: {
        return this.analysisService.generateTraitReport();
      }

      case AnalysisReportType.ProgressionAggregate: {
        return this.analysisService.generateProgressionReport(
          reportArgs?.itemClasses ?? [],
        );
      }

      case AnalysisReportType.ProgressionSingle: {
        if (!chosenItemClass) return undefined;

        return this.analysisService.generateProgressionReport([
          chosenItemClass,
        ]);
      }

      case AnalysisReportType.SpellPotency: {
        if (!chosenSpellName) return undefined;

        return this.analysisService.generateSpellPotencyReport(chosenSpellName);
      }

      case AnalysisReportType.WeaponPotency: {
        if (!chosenItemClass || !chosenItemTier) return undefined;

        return this.analysisService.generateWeaponPotencyReport(
          chosenItemClass,
          chosenItemTier,
        );
      }

      case AnalysisReportType.ResistanceAcquisition: {
        return this.analysisService.generateResistanceAcquisitionReport();
      }

      case AnalysisReportType.MapContent: {
        const mapName = this.mapNameInput();
        if (!mapName) return undefined;

        return this.analysisService.generateMapReport(mapName);
      }
    }
  });

  ngOnInit() {
    const tier = this.defaultTier();
    if (tier) {
      this.tierInput.set(+tier);
    }
  }

  public updateReport($event: ReportModel | undefined) {
    if (!$event) return;

    this.reportType.set($event.type);
    this.reportDataArgs.set($event.data);

    this.changeURLProp.emit(['report', $event.value]);
  }
}
