import { isNumber, isString, isUndefined } from 'lodash';
import { IItemDefinition, SkillType } from '../../src/interfaces';

const ValidItemTypes = [
  'Mace',
  'Axe',
  'Dagger',
  'Wand',
  'Sword',
  'Twohanded',
  'Polearm',
  'Ranged',
  'Martial',
  'Staff',
  'Restoration',
  'Conjuration',
  'Throwing',
  'Thievery',
  'Shortsword',
];

const WeaponClasses = [
  'Axe',
  'Blunderbuss',
  'Broadsword',
  'Crossbow',
  'Dagger',
  'Club',
  'Flail',
  'Greataxe',
  'Greatmace',
  'Greatsword',
  'Hammer',
  'Halberd',
  'Longbow',
  'Longsword',
  'Mace',
  'Saucer',
  'Shield',
  'Shortbow',
  'Shortsword',
  'Spear',
  'Staff',
  'Totem',
  'Wand',
];

const AmmoClasses = ['Arrow'];

const SharpWeaponClasses = [
  'Axe',
  'Blunderbuss',
  'Broadsword',
  'Crossbow',
  'Dagger',
  'Greataxe',
  'Greatsword',
  'Halberd',
  'Longbow',
  'Longsword',
  'Shortbow',
  'Shortsword',
  'Spear',
];

const ShieldClasses = ['Shield', 'Saucer'];

const ArmorClasses = ['Tunic', 'Breastplate', 'Fur', 'Fullplate', 'Scaleplate'];

const RobeClasses = ['Cloak', 'Robe'];

const HeadClasses = ['Hat', 'Helm', 'Skull', 'Saucer'];

const NeckClasses = ['Amulet'];

const WaistClasses = ['Sash'];

const WristsClasses = ['Bracers'];

const RingClasses = ['Ring'];

const FeetClasses = ['Boots'];

const HandsClasses = ['Gloves', 'Claws'];

const EarClasses = ['Earring'];

const SackableWeaponClasses = ['Axe', 'Dagger', 'Hammer', 'Saucer'];

const SackableArmorClasses = ['Tunic', 'Fur'];

const EquippableItemClasses = HeadClasses.concat(NeckClasses)
  .concat(WaistClasses)
  .concat(WristsClasses)
  .concat(RingClasses)
  .concat(FeetClasses)
  .concat(HandsClasses)
  .concat(ArmorClasses)
  .concat(RobeClasses)
  .concat(EarClasses);

const isWeapon = (item: IItemDefinition) =>
  WeaponClasses.includes(item.itemClass);
const isArmor = (item: IItemDefinition) =>
  ArmorClasses.includes(item.itemClass);

const conditionallyAddInformation = (item: IItemDefinition) => {
  if (isWeapon(item)) {
    if (isUndefined(item.isBeltable)) item.isBeltable = true;
    if (isUndefined(item.isSackable)) item.isSackable = false;

    if (SackableWeaponClasses.includes(item.itemClass) && !item.twoHanded)
      item.isSackable = true;
  }

  if (isArmor(item)) {
    if (isUndefined(item.isBeltable)) item.isBeltable = false;
    if (isUndefined(item.isSackable)) item.isSackable = false;

    if (SackableArmorClasses.includes(item.itemClass)) {
      if (isUndefined(item.isSackable)) item.isSackable = true;
    }

    if (['Tunic', 'Fur', 'Scaleplate'].includes(item.itemClass)) {
      if (!item.stats.mitigation) item.stats.mitigation = 10;
    }

    if (['Breastplate', 'Fullplate'].includes(item.itemClass)) {
      if (!item.stats.mitigation) {
        item.stats.mitigation = 25;
        item.isHeavy = true;
      }
    }
  }

  if (isUndefined(item.isSackable)) {
    item.isSackable = true;
  }

  if (item.itemClass === 'Twig') {
    item.type = 'staff';
  }

  if (item.itemClass === 'Tunic' || item.itemClass === 'Fur') {
    item.isSackable = true;
  }

  if (AmmoClasses.includes(item.itemClass)) {
    item.isBeltable = true;
  }

  if (item.type === 'polearm') {
    item.isBeltable = false;
    item.twoHanded = true;
    item.attackRange = 1;
    if (isUndefined(item.proneChance)) item.proneChance = 5;
  }

  if (
    ['Blunderbuss', 'Shortbow', 'Longbow', 'Greatmace', 'Greataxe'].includes(
      item.itemClass
    )
  ) {
    item.twoHanded = true;
    item.secondaryType = 'twohanded';
  }

  if (
    ['Crossbow', 'Shortbow', 'Longbow', 'Blunderbuss'].includes(item.itemClass)
  ) {
    item.canShoot = true;
  }

  if (
    ['Crossbow', 'Shortbow', 'Longbow', 'Blunderbuss'].includes(
      item.itemClass
    ) ||
    item.type === 'ranged'
  ) {
    item.attackRange = 5;
  }

  if (ShieldClasses.includes(item.itemClass)) {
    item.type = 'mace';
    if (!item.stats.accuracy) item.stats.accuracy = 0;
    if (!item.stats.mitigation) item.stats.mitigation = 5;
    if (!item.tier) item.tier = 1;
  }

  if (item.itemClass === 'Mace' && isUndefined(item.proneChance)) {
    item.proneChance = 5;
  }

  if (item.itemClass === 'Flail' && isUndefined(item.proneChance)) {
    item.proneChance = 10;
  }

  if (item.itemClass === 'Club' && isUndefined(item.proneChance)) {
    item.proneChance = 10;
  }

  if (item.type === 'staff') {
    if (isUndefined(item.twoHanded)) item.twoHanded = true;
    if (isUndefined(item.proneChance)) item.proneChance = 10;
  }

  if (item.type === 'twohanded' || item.secondaryType === 'twohanded') {
    item.twoHanded = true;
    if (!item.proneChance && item.type !== 'ranged') item.proneChance = 5;
  }

  if (['Breastplate', 'Fullplate'].includes(item.itemClass)) {
    item.isHeavy = true;
  }

  if (item.itemClass === 'Saucer') {
    item.isSackable = true;
  }

  if (item.itemClass === 'Bottle' || item.itemClass === 'Food') {
    item.ounces = isNumber(item.ounces) ? item.ounces : 1;
  }

  if (item.itemClass === 'Trap') {
    item.trapUses = item.trapUses || 1;
  }

  if (item.randomTrait) {
    if (isString(item.randomTrait.name))
      item.randomTrait.name = [item.randomTrait.name];
    if (isNumber(item.randomTrait.level))
      item.randomTrait.level = {
        min: item.randomTrait.level,
        max: item.randomTrait.level,
      };
  }

  item.type = item.type.toLowerCase() as SkillType;
  if (item.secondaryType)
    item.secondaryType = item.secondaryType.toLowerCase() as SkillType;
};

export function fillInItemProperties(itemData: IItemDefinition) {
  itemData.type ??= 'martial';
  if (!itemData.stats) itemData.stats = {};

  conditionallyAddInformation(itemData);

  return itemData;
}
