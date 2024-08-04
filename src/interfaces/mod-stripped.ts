import { DamageType } from './itemtypes';

export interface IStatusEffectInfo {
  name: string;
  endsAt: number;
  extra: {
    potency: number;
    damageType: DamageType;
  };
}
