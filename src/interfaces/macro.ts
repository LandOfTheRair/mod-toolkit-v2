export enum IMacroActivation {
  AutoActivate = 'autoActivate',
  LockActivation = 'lockActivation',
  ClickToTarget = 'clickToTarget',
  AutoTarget = 'autoTarget',
}

export type IMacroActivationType = `${IMacroActivation}`;

export interface IMacro {
  name: string;
  macro: string;
  icon: string;
  color: string;
  bgColor?: string;
  mode: IMacroActivationType;
  key: string;
  tooltipDesc: string;
  isDefault?: boolean;
}
