import { Component, computed, inject, signal } from '@angular/core';
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
export class AnalysisComponent {
  public analysisService = inject(AnalysisService);
  public modService = inject(ModService);

  public reportType = signal<AnalysisReportType | undefined>(undefined);
  public reportDataArgs = signal<ReportModel['data'] | undefined>(undefined);
  public itemClassInput = signal<ItemClassType | undefined>(undefined);
  public spellNameInput = signal<string | undefined>(undefined);
  public tierInput = signal<number>(1);

  public maxTier = computed(() => {
    return maxBy(this.modService.mod().items, 'tier')?.tier ?? 1;
  });

  public report = signal<ReportModel | undefined>(undefined);
  public reportData = computed(() => {
    const reportType = this.reportType();
    const reportArgs = this.reportDataArgs();

    const chosenItemClass = this.itemClassInput();
    const chosenSpellName = this.spellNameInput();
    const chosenItemTier = this.tierInput();

    switch (reportType) {
      case AnalysisReportType.ArmorAverage: {
        return this.analysisService.generateArmorReport(
          reportArgs?.itemClasses ?? []
        );
      }

      case AnalysisReportType.WeaponAverage: {
        return this.analysisService.generateWeaponReport(
          reportArgs?.itemClasses ?? []
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
          reportArgs?.itemClasses ?? []
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
          chosenItemTier
        );
      }
    }
  });

  public updateReport($event: ReportModel | undefined) {
    if (!$event) return;

    this.reportType.set($event.type);
    this.reportDataArgs.set($event.data);

    /*
    let report: AnalysisReport | undefined = undefined;

    switch ($event.type) {
      case AnalysisReportType.ArmorAverage: {
        report = this.analysisService.generateArmorReport(
          $event.data.itemClasses ?? []
        );
        break;
      }

      case AnalysisReportType.GemStats: {
        report = this.analysisService.generateGemReport();
        break;
      }

      case AnalysisReportType.StatUtilization: {
        report = this.analysisService.generateStatUtilizationReport();
        break;
      }

      case AnalysisReportType.SpellPotency: {
        report = this.analysisService.generateSpellPotencyReport(
          $event.data.spellName ?? ''
        );
        break;
      }

      case AnalysisReportType.WeaponPotency: {
        report = this.analysisService.generateWeaponPotencyReport(
          $event.data.itemClass,
          5
        );
        break;
      }

      case AnalysisReportType.TraitUsage: {
        report = this.analysisService.generateTraitReport();
        break;
      }

      TODO: this one should support an array of item classes (default) OR a singular item picker
      case AnalysisReportType.Progression: {
        report = this.analysisService.generateProgressionReport(
          $event.data.itemClasses ?? []
        );
        break;
      }

      case AnalysisReportType.WeaponAverage: {
        report = this.analysisService.generateWeaponReport(
          $event.data.itemClasses ?? []
        );
        break;
      }
    }

    this.reportData.set(report);
    */
  }
}
