import {
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { maxBy } from 'lodash';
import { linkedQueryParam } from 'ngxtension/linked-query-param';
import { AnalysisReportType, ItemClassType } from '../../interfaces';
import { AnalysisService } from '../services/analysis.service';
import { ModService } from '../services/mod.service';
import { ReportModel } from '../shared/components/input-analysis-report/input-analysis-report.component';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss',
  standalone: false,
})
export class AnalysisComponent implements OnInit {
  public exit = output();

  public defaultReport = linkedQueryParam<string | undefined>('rareport', {
    parse: (value) => value ?? undefined,
  });
  public defaultItemclass = linkedQueryParam<string | undefined>(
    'raitemclass',
    {
      parse: (value) => value ?? undefined,
    },
  );
  public defaultSpell = linkedQueryParam<string | undefined>('raspell', {
    parse: (value) => value ?? undefined,
  });
  public defaultTier = linkedQueryParam<string | undefined>('ratier', {
    parse: (value) => value ?? undefined,
  });
  public defaultMap = linkedQueryParam<string | undefined>('map', {
    parse: (value) => value ?? undefined,
  });

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

      case AnalysisReportType.SpellUtilization: {
        return this.analysisService.generateSpellUtilizationReport();
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

    this.defaultReport.set($event.value);
  }

  public leaveSection() {
    this.defaultReport.set(undefined);
    this.defaultItemclass.set(undefined);
    this.defaultSpell.set(undefined);
    this.defaultTier.set(undefined);
    this.defaultMap.set(undefined);

    this.exit.emit();
  }
}
