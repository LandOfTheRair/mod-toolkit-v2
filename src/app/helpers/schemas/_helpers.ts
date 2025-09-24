import {
  difference,
  get,
  isArray,
  isBoolean,
  isNull,
  isNumber,
  isString,
  isUndefined,
  uniq,
} from 'lodash';
import {
  Allegiance,
  BaseClass,
  Currency,
  DamageClass,
  HasIdentification,
  Holiday,
  ItemClass,
  ItemSlot,
  ITraitTreeRowTrait,
  QuestRewardType,
  Schema,
  SchemaValidator,
  SchemaValidatorMessage,
  Skill,
  Stat,
  Tradeskill,
} from '../../../interfaces';

const itemSlots = uniq([
  'weapon',
  'armor',
  'shield',
  'ring',
  'robe',
  ...Object.values(ItemSlot),
]) as ItemSlot[];

export function isArrayOf(validator: SchemaValidator): SchemaValidator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (val: any) => val.every(validator);
}

export function isArrayOfAtLeastLength(length: number): SchemaValidator {
  return (val: any) => val.filter(Boolean).length >= length;
}

export function isArrayOfAtMostLength(length: number): SchemaValidator {
  return (val: any) => val.filter(Boolean).length <= length;
}

export function isObjectWith(keys: string[]): SchemaValidator {
  return (val: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (Object.keys(val).length !== keys.length) return false;
    return keys.every((k) => !isUndefined(val[k]));
  };
}

export function isObjectWithFailure(keys: string[]): SchemaValidatorMessage {
  return (val: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (Object.keys(val).length !== keys.length)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return `keys: ${keys.join(', ')} vs ${Object.keys(val).join(
        ', '
      )} is of different length`;
    return `keys: ${keys
      .filter((k) => isUndefined(val[k]))
      .join(', ')} must not be undefined`;
  };
}

export function isObjectWithSome(keys: string[]): SchemaValidator {
  return (val: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return Object.keys(val ?? {}).every((k) => keys.includes(k));
  };
}

export function isObjectWithSomeFailure(
  keys: string[]
): SchemaValidatorMessage {
  return (val: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return `extraneous keys: ${Object.keys(val)
      .map((k) => (keys.includes(k) ? '' : k))
      .filter(Boolean)
      .join(', ')}`;
  };
}

export function isPartialObjectOf<T>(possibleVals: T[]): SchemaValidator {
  return (val: any) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.keys(val ?? {}).every((k) => possibleVals.includes(k as T));
}

export function isPartialObjectOfFailure<T>(
  possibleVals: T[]
): SchemaValidatorMessage {
  return (val: any) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    `extraneous keys: ${Object.keys(val)
      .map((k) => (possibleVals.includes(k as T) ? '' : k))
      .filter(Boolean)
      .join(', ')}`;
}

export const isPartialStatObject = isPartialObjectOf<Stat>(Object.values(Stat));
export const isPartialStatObjectFailure = isPartialObjectOfFailure<Stat>(
  Object.values(Stat)
);

export const isPartialSkillObject = isPartialObjectOf<Skill>(
  Object.values(Skill)
);
export const isPartialSkillObjectFailure = isPartialObjectOfFailure<Skill>(
  Object.values(Skill)
);

export const isPartialEquipmentObject = isPartialObjectOf<ItemSlot>(itemSlots);
export const isPartialEquipmentObjectFailure =
  isPartialObjectOfFailure<ItemSlot>(itemSlots);

export const isPartialReputationObject = isPartialObjectOf<Allegiance>(
  Object.values(Allegiance)
);
export const isPartialReputationObjectFailure =
  isPartialObjectOfFailure<Allegiance>(Object.values(Allegiance));

export function isItemClass(val: any): boolean {
  return Object.values(ItemClass).includes(val as ItemClass);
}

export function isSkill(val: any): boolean {
  return Object.values(Skill).includes(val as Skill);
}

export function isTradeskill(val: any): boolean {
  return Object.values(Tradeskill).includes(val as Tradeskill);
}

export function isItemSlot(val: any): boolean {
  return itemSlots.includes(val as ItemSlot);
}

export function isDialogItemSlot(val: any): boolean {
  const dialogSlots = [...itemSlots, 'sack', 'leftHand', 'rightHand'];
  return (
    dialogSlots.includes(val as ItemSlot) ||
    (isArray(val) && val.every((i) => dialogSlots.includes(i as ItemSlot)))
  );
}

export function isTraitObject(val: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.keys(val).every((k) => isInteger(val[k]));
}

export function isStat(val: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(Stat).includes(val);
}

export function isDamageType(val: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(DamageClass).includes(val);
}

export function isAllegiance(val: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(Allegiance).includes(val);
}

export function isCurrency(val: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(Currency).includes(val);
}

export function isHoliday(val: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(Holiday).includes(val);
}

export function isRepMod(val: any): boolean {
  return isInteger(val.delta) && isAllegiance(val.allegiance);
}

export function isDialogChatOption(val: any): boolean {
  return isString(val.text) && isString(val.action);
}

export function isDialogItem(val: any): boolean {
  return isString(val.name) && val.amount ? isNumber(val.amount) : true;
}

export function isAny(): boolean {
  return true;
}

export function is(val: any): SchemaValidator {
  return (match: any) => val === match;
}

export function isRandomStatObject(val: any): boolean {
  const allStats = Object.values(Stat);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.keys(val).every(
    (stat) =>
      allStats.includes(stat as Stat) &&
      isObjectWith(['min', 'max'])(val[stat]) &&
      isInteger(val[stat].min) &&
      isInteger(val[stat].max)
  );
}

export function isRandomTraitObject(val: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return (
    isObjectWith(['name', 'level'])(val) &&
    isArrayOf(isString)(val.name) &&
    isRandomNumber(val.level)
  );
}

export function isNPCEffect(val: any): boolean {
  return val.endsAt === -1 &&
    isString(val.name) &&
    isObjectWithSome(['potency', 'damageType', 'enrageTimer'])(val.extra) &&
    val.extra
    ? (val.extra?.potency ? isNumber(val.extra?.potency) : true) &&
        (val.extra?.damageType ? isDamageType(val.extra?.damageType) : true) &&
        (val.extra?.enrageTimer ? isNumber(val.extra?.enrageTimer) : true)
    : true;
}

export function isQuestReward(val: any): boolean {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.values(QuestRewardType).includes(val.type) &&
    isInteger(val.value) &&
    (val.statName ? isStat(val.statName) || isAllegiance(val.statName) : true)
  );
}

export function isTraitTreeObject(val: any): boolean {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.keys(val)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .map((v) => val[v])
      .every((t) => {
        return t.tree.every((tab: { traits: ITraitTreeRowTrait[] }) => {
          return tab.traits.every((trait) =>
            trait.name ? trait.maxLevel > 0 : true
          );
        });
      })
  );
}

export function is2DNumberArray(val: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return val.every((v: any[]) => v.every((c: any) => isNumber(c)));
}

export function isStringOrBoolean(val: any): boolean {
  return isString(val) || isBoolean(val);
}

export function isOzIngredient(val: any): boolean {
  return isString(val.filter) && isString(val.display) && isInteger(val.ounces);
}

export function isCosmetic(cos: any): boolean {
  return !!cos.name;
}

export function isRequirement(req: any): boolean {
  return !!(req.level || req.baseClass || req.alignment || req.quest);
}

export function isBaseClass(req: any): boolean {
  return Object.values(BaseClass).includes(req as BaseClass);
}

export function isSuccor(suc: any): boolean {
  return suc.map && isInteger(suc.x) && isInteger(suc.y);
}

export function isRollable(rol: any): boolean {
  return !!(rol.chance && rol.result);
}

export function isTrait(trait: any): boolean {
  return !!(trait.name && isNumber(trait.level));
}

export function isInteger(num: any): boolean {
  return isNumber(num) && Math.floor(num) === num;
}

export function isIntegerBetween(min: any, max: any): SchemaValidator {
  return (num) => num >= min && num <= max && isInteger(num);
}

export function isEffect(eff: any): boolean {
  return eff.name && isNumber(eff.potency);
}

export function isBookPage(val: any): boolean {
  return val.id === '' && isString(val.text);
}

export function isDropPool(pool: any): boolean {
  return (
    isInteger(pool.choose.min) &&
    isInteger(pool.choose.max) &&
    isArrayOf(isRollable)(pool.items)
  );
}

export function isRandomNumber(num: any) {
  return (
    isObjectWith(['min', 'max'])(num) &&
    isInteger(num.min) &&
    isInteger(num.max)
  );
}

export function validateSchema<T extends HasIdentification>(
  label: string,
  obj: T,
  schema: Schema
): string[] {
  const errors: string[] = [];

  schema.forEach(([prop, required, validator, message]) => {
    const value = get(obj, prop);

    if (isUndefined(value)) {
      if (required)
        errors.push(
          `Property '${prop}' is required, but absent in '${label}'.`
        );
      return;
    }

    if (!validator(value) && !isNull(value) && !isUndefined(value))
      errors.push(
        `Property '${prop}' (value: ${value}) does not pass validation for '${label}' (${
          message?.(value) ?? 'no additional information provided'
        }).`
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
