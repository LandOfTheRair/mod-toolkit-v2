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
import { AnalysisReportType, ItemClass } from '../../interfaces';
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
  public itemClassInput = linkedQueryParam<ItemClass | undefined>(
    'raitemclass',
    {
      parse: (value) => value as ItemClass,
    },
  );
  public spellNameInput = linkedQueryParam<string | undefined>('raspell', {
    parse: (value) => value ?? undefined,
  });
  public defaultTier = linkedQueryParam<string | undefined>('ratier', {
    parse: (value) => value ?? undefined,
  });
  public mapNameInput = linkedQueryParam<string | undefined>('ramap', {
    parse: (value) => value ?? undefined,
  });
  public npcIdInput = linkedQueryParam<string | undefined>('ranpc', {
    parse: (value) => value ?? undefined,
  });

  public analysisService = inject(AnalysisService);
  public modService = inject(ModService);

  public reportType = signal<AnalysisReportType | undefined>(undefined);
  public reportDataArgs = signal<ReportModel['data'] | undefined>(undefined);
  public tierInput = signal<number>(1);

  public maxTier = computed(() => {
    return maxBy(this.modService.mod().items, 'tier')?.tier ?? 1;
  });

  public report = signal<string | undefined>(undefined);
  public reportData = computed(() => {
    const reportType = this.reportType();
    const reportArgs = this.reportDataArgs();

    const chosenItemClass = this.itemClassInput();
    const chosenSpellName = this.spellNameInput() ?? '';
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

      case AnalysisReportType.NPCDamage: {
        const npcId = this.npcIdInput();
        if (!npcId) return undefined;

        return this.analysisService.generateNPCDamageReport(npcId);
      }

      case AnalysisReportType.MapNPCDamage: {
        const mapName = this.mapNameInput();
        if (!mapName) return undefined;

        return this.analysisService.generateMapNPCDamageReport(mapName);
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
    this.itemClassInput.set(undefined);
    this.spellNameInput.set(undefined);
    this.defaultTier.set(undefined);
    this.mapNameInput.set(undefined);
    this.npcIdInput.set(undefined);

    this.exit.emit();
  }
}
