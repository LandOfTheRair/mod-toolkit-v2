export enum AnalysisReportType {
  Progression = 'progression', // a list of all items, in order by level, to track progression
  GemStats = 'gemstats', // a list of all gem stats by slot, and a list of stats not used by any slot yet
  ArmorAverage = 'armoraverage', // average armor information by item class
  WeaponAverage = 'weaponaverage', // average weapon information by item class
  TraitUsage = 'traitusage', // a list of all traits that are used and unused
}

export enum AnalysisDisplayType {
  Table = 'table',
  List = 'list',
}

export type AnalysisDisplayRow = {
  pretext?: string;
  posttext?: string;
  itemName?: string;
  tooltip?: string;
};

export interface AnalysisDisplayTable {
  title: string;
  headers: string[];
  rows: AnalysisDisplayRow[][];
}

export interface AnalysisDisplayList {
  title: string;
  rows: AnalysisDisplayRow[];
}

export type AnalysisReportDisplay =
  | { type: AnalysisDisplayType.Table; table: AnalysisDisplayTable }
  | { type: AnalysisDisplayType.List; list: AnalysisDisplayList };

export interface AnalysisReport {
  entries: AnalysisReportDisplay[];
}
