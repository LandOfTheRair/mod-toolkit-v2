import { isNumber, isString, isUndefined } from 'lodash';
import { IItemDefinition, SkillType } from '../../../interfaces';

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
const ShieldClasses = ['Shield', 'Saucer'];
const ArmorClasses = ['Tunic', 'Breastplate', 'Fur', 'Fullplate', 'Scaleplate'];
const SackableWeaponClasses = ['Axe', 'Dagger', 'Hammer', 'Saucer'];
const SackableArmorClasses = ['Tunic', 'Fur'];

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

function fillInItemProperties(itemData: IItemDefinition) {
  itemData.type ??= 'martial';
  if (!itemData.stats) itemData.stats = {};

  conditionallyAddInformation(itemData);

  return itemData;
}

export function formatItems(items: IItemDefinition[]): IItemDefinition[] {
  return items.map((item: any) => {
    if (!item.sellValue) delete item.sellValue;
    if (!item.maxUpgrades) delete item.maxUpgrades;
    if (!item.secondaryType) delete item.secondaryType;
    if (!item.quality) delete item.quality;
    if (item.succorInfo && !item.succorInfo.map) delete item.succorInfo;
    if (item.cosmetic && !item.cosmetic.name) delete item.cosmetic;
    if (item.containedItems && !item.containedItems.length)
      delete item.containedItems;
    if (!item.trait.name) delete item.trait;
    if (item.randomTrait.name.length === 0) delete item.randomTrait;
    if (item.useEffect && !item.useEffect.name) delete item.useEffect;
    if (item.strikeEffect && !item.strikeEffect.name) delete item.strikeEffect;
    if (item.breakEffect && !item.breakEffect.name) delete item.breakEffect;
    if (item.equipEffect && !item.equipEffect.name) delete item.equipEffect;

    if (item.requirements) {
      if (!item.requirements.baseClass) delete item.requirements.baseClass;
      if (!item.requirements.level) delete item.requirements.level;
      if (!item.requirements.baseClass && !item.requirements.level)
        delete item.requirements;
    }

    return fillInItemProperties(item as IItemDefinition);
  });
}
