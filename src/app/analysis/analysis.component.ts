import { Component, inject, signal } from '@angular/core';
import { AnalysisReport, AnalysisReportType } from '../../interfaces';
import { AnalysisService } from '../services/analysis.service';
import { ReportModel } from '../shared/components/input-analysis-report/input-analysis-report.component';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss',
})
export class AnalysisComponent {
  public analysisService = inject(AnalysisService);

  public report = signal<ReportModel | undefined>(undefined);
  public reportData = signal<AnalysisReport | undefined>(undefined);

  public updateReport($event: ReportModel | undefined) {
    if (!$event) return;

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

      case AnalysisReportType.TraitUsage: {
        report = this.analysisService.generateTraitReport();
        break;
      }

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
  }
}
