/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Allegiance,
  BaseClass,
  BaseClassType,
  IModKit,
  ItemClass,
  MonsterClass,
  Stat,
  ValidationMessageGroup,
} from '../../../interfaces';

export function validateRNGDungeons(
  mod: IModKit,
  validClasses: BaseClassType[]
): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'RNG Dungeon Configs',
    messages: [],
  };

  const config = mod.cores.find((c) => c.name === 'rngdungeonconfig');
  if (!config) return itemValidations;

  const {
    npcs,
    resources,
    itemScenarios,
    itemConfigs,
    creatures,
    creatureTraits,
    creatureSkills,
    creatureGroupings,
  } = config.json;

  Object.keys(npcs).forEach((npc: any) => {
    const tag = npcs[npc].props.tag;
    if (mod.dialogs.find((d) => d.tag === tag)) return;

    itemValidations.messages.push({
      type: 'error',
      message: `NPC ${tag} is not a valid dialog.`,
    });
  });

  Object.keys(resources).forEach((resource: any) => {
    const id = resources[resource].id;
    if (mod.npcs.find((n) => n.npcId === id)) return;

    itemValidations.messages.push({
      type: 'error',
      message: `Resource ${id} is not a valid NPC.`,
    });
  });

  Object.keys(creatures).forEach((creature: any) => {
    const creatureData = creatures[creature];

    if (
      creatureData.monsterClass &&
      !Object.values(MonsterClass).includes(creatureData.monsterClass)
    ) {
      itemValidations.messages.push({
        type: 'error',
        message: `${creature}: Monster class ${creatureData.monsterClass} is not valid.`,
      });
    }

    if (
      creatureData.baseClass &&
      !Object.values(BaseClass).includes(creatureData.baseClass)
    ) {
      itemValidations.messages.push({
        type: 'error',
        message: `${creature}: Character class ${creatureData.baseClass} is not valid.`,
      });
    }

    if (
      creatureData.weaponType &&
      !Object.values(ItemClass).includes(creatureData.weaponType)
    ) {
      itemValidations.messages.push({
        type: 'error',
        message: `${creature}: Weapon type ${creatureData.weaponType} is not valid.`,
      });
    }

    if (
      creatureData.armorType &&
      !Object.values(ItemClass).includes(creatureData.armorType)
    ) {
      itemValidations.messages.push({
        type: 'error',
        message: `${creature}: Armor type ${creatureData.armorType} is not valid.`,
      });
    }

    Object.keys(creatureData.statChanges ?? {}).forEach((stat) => {
      if (!Object.values(Stat).includes(stat as Stat)) {
        itemValidations.messages.push({
          type: 'error',
          message: `${creature}: Stat ${stat} is not valid.`,
        });
      }
    });

    creatureData.guaranteedSkills?.forEach((skillName: string) => {
      if (!mod.stems.find((s) => s._gameId === skillName)) {
        itemValidations.messages.push({
          type: 'error',
          message: `${creature}: Skill ${skillName} is not valid.`,
        });
      }
    });

    creatureData.guaranteedTraits?.forEach((traitName: string) => {
      if (!mod.stems.find((s) => s._gameId === traitName)) {
        itemValidations.messages.push({
          type: 'error',
          message: `${creature}: Trait ${traitName} is not valid.`,
        });
      }
    });
  });

  validClasses.forEach((baseClass) => {
    if (!creatureSkills[baseClass]) {
      itemValidations.messages.push({
        type: 'error',
        message: `Base class ${baseClass} is not in creatureSkills.`,
      });
    }

    creatureSkills[baseClass]?.forEach((skillData: { name: string }) => {
      if (mod.stems.find((d) => d._gameId === skillData.name)) return;
      itemValidations.messages.push({
        type: 'error',
        message: `Creature Skills (${baseClass}): ${skillData.name} is not a valid STEM.`,
      });
    });

    if (!creatureTraits[baseClass]) {
      itemValidations.messages.push({
        type: 'error',
        message: `Base class ${baseClass} is not in creatureTraits.`,
      });
    }

    creatureTraits[baseClass]?.forEach((traitData: { name: string }) => {
      if (mod.stems.find((d) => d._gameId === traitData.name)) return;
      itemValidations.messages.push({
        type: 'error',
        message: `Creature Traits (${baseClass}): ${traitData.name} is not a valid STEM.`,
      });
    });
  });

  Object.keys(creatureGroupings).forEach((group) => {
    const groupData = creatureGroupings[group];
    groupData.factions?.forEach((faction: Allegiance) => {
      if (!Object.values(Allegiance).includes(faction)) {
        itemValidations.messages.push({
          type: 'error',
          message: `Creature groupings (${group}): ${faction} is not a valid faction.`,
        });
      }
    });
  });

  Object.keys(itemConfigs).forEach((itemConfig) => {
    if (!Object.values(ItemClass).includes(itemConfig as ItemClass)) {
      itemValidations.messages.push({
        type: 'error',
        message: `Item config (${itemConfig}): ${itemConfig} is not a valid item class.`,
      });
    }
  });

  itemScenarios.forEach((scenario: { statChanges: any; name: any }) => {
    Object.keys(scenario.statChanges ?? {}).forEach((stat) => {
      if (!Object.values(Stat).includes(stat as Stat)) {
        itemValidations.messages.push({
          type: 'error',
          message: `Scenario ${scenario.name}: Stat ${stat} is not valid.`,
        });
      }
    });
  });

  return itemValidations;
}
