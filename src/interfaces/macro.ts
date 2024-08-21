export enum MacroActivation {
  AutoActivate = 'autoActivate',
  LockActivation = 'lockActivation',
  ClickToTarget = 'clickToTarget',
  AutoTarget = 'autoTarget',
}

export type MacroActivationType = `${MacroActivation}`;

export interface IMacro {
  name: string;
  tooltipDesc: string;
  macro: string;

  icon: string;
  color: string;
  bgColor: string;

  mode: MacroActivationType;
  key: string;
  isDefault?: boolean;
}
