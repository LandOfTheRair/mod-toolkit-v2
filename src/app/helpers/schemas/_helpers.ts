import { difference, get, isNumber, isUndefined } from 'lodash';
import { HasIdentification, Schema } from '../../../interfaces';

export function isInteger(num: any): boolean {
  return isNumber(num) && Math.floor(num) === num;
}

export function isCosmetic(cos: any): boolean {
  return !!cos.name;
}

export function isRequirement(req: any): boolean {
  return !!(req.level || req.baseClass || req.alignment || req.quest);
}

export function isSuccor(suc: any): boolean {
  return suc.map && isInteger(suc.x) && isInteger(suc.y);
}

export function isOptionalRollable(rol: any): boolean {
  if (!rol || rol.length === 0) return true;

  return !!(rol[0].chance && rol[0].result);
}

export function isRollable(rol: any): boolean {
  return !!(rol.length > 0 && rol[0].chance && rol[0].result);
}

export function isTrait(trait: any): boolean {
  return !!(trait.name && isNumber(trait.level));
}

export function isIntegerBetween(min: any, max: any): (val: any) => boolean {
  return (num) => num >= min && num <= max && isInteger(num);
}

export function isEffect(eff: any): boolean {
  return eff.name && isNumber(eff.potency);
}

export function isEncrust(enc: any): boolean {
  return !!(enc.stats || enc.equipEffect || enc.strikeEffect);
}

export function isDropPool(pool: any): boolean {
  return (
    isInteger(pool.choose.min) &&
    isInteger(pool.choose.max) &&
    isRollable(pool.items)
  );
}

export function isRandomNumber(num: any) {
  return isInteger(num.min) && isInteger(num.max);
}

export function validateSchema<T extends HasIdentification>(
  label: string,
  obj: T,
  schema: Schema
): string[] {
  const errors: string[] = [];

  schema.forEach(([prop, required, validator]) => {
    const value = get(obj, prop);

    if (isUndefined(value)) {
      if (required)
        errors.push(
          `Property '${prop}' is required, but absent in '${label}'.`
        );
      return;
    }

    if (!validator(value))
      errors.push(
        `Property '${prop}' does not pass validation for '${label}'.`
      );
  });

  const basePropsSchema = schema
    .filter((x) => !x[0].includes('.'))
    .map((x) => x[0]);
  const baseObjProps = Object.keys(obj).filter((x) => !['_id'].includes(x));

  const diff = difference(baseObjProps, basePropsSchema);
  if (diff.length > 0) {
    errors.push(
      `Properties ${diff.join(',')} are in '${label}' but not in schema.`
    );
  }

  return errors;
}
