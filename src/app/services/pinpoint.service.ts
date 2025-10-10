import { computed, inject, Injectable, signal } from '@angular/core';
import { get, sortBy, uniq } from 'lodash';
import { linkedQueryParam } from 'ngxtension/linked-query-param';
import { BaseClassType, INPCDefinition, Rollable } from '../../interfaces';
import {
  extractAllItemsFromBehavior,
  extractAllItemsFromDialog,
} from '../helpers/data';
import { ModService } from './mod.service';

interface ItemDropDescriptor {
  npcName?: string;
  itemName?: string;

  originName: string;

  chance: number;
  maxChance: number;
}

interface ItemUseDescriptor {
  npcName?: string;
  recipeName?: string;
  questName?: string;
  containingItemName?: string;
  npcScriptName?: string;
  droptableName?: string;
  mapAndObjectName?: string;

  extraDescription?: string;
}

interface NPCUseDescriptor {
  spawnerName?: string;
  questName?: string;
  stemName?: string;

  extraDescription?: string;
}

interface STEMUseDescriptor {
  itemTrait?: string;
  itemRandomTrait?: string;
  itemEffect?: string;

  npcTrait?: string;
  npcSkill?: string;
  npcBaseEffect?: string;

  traitTree?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PinpointService {
  private modService = inject(ModService);

  public activePinpointTab = linkedQueryParam<number | undefined>('pptab', {
    parse: (value) => parseInt(value ?? '0', 10),
  });
  public isPinpointing = signal<boolean>(false);

  public pinpointMap = signal<string | undefined>(undefined);
  public pinpointItem = signal<string | undefined>(undefined);
  public pinpointNPC = signal<string | undefined>(undefined);
  public pinpointSTEM = signal<string | undefined>(undefined);

  public mapInformation = computed(() => {
    const map = this.pinpointMap();
    if (!map) return [];

    return [
      ...this.getItemsFromMapSpawnerNPCs(map),
      ...this.getItemsFromMapDroptables(map),
    ];
  });

  public itemInformation = computed(() => {
    const item = this.pinpointItem();
    if (!item) return [];

    return this.getItemUses(item, this.modService.availableClasses());
  });

  public npcInformation = computed(() => {
    const npc = this.pinpointNPC();
    if (!npc) return { uses: [], drops: [] };

    return {
      uses: this.getNPCUses(npc),
      drops: this.getNPCDrops(npc),
    };
  });

  public stemInformation = computed(() => {
    const stem = this.pinpointSTEM();
    if (!stem) return [];

    return this.getSTEMUses(stem);
  });

  public togglePinpointing(newSetting = !this.isPinpointing()) {
    this.isPinpointing.set(newSetting);

    this.pinpointMap.set(undefined);
    this.pinpointItem.set(undefined);
    this.pinpointNPC.set(undefined);
    this.pinpointSTEM.set(undefined);
  }

  public searchMap(map: string) {
    this.pinpointMap.set(map);
    this.isPinpointing.set(true);
    this.activePinpointTab.set(0);
  }

  public searchItem(item: string | undefined) {
    this.pinpointItem.set(item);
    this.isPinpointing.set(true);
    this.activePinpointTab.set(1);
  }

  public searchNPC(npc: string | undefined) {
    this.pinpointNPC.set(npc);
    this.isPinpointing.set(true);
    this.activePinpointTab.set(2);
  }

  public searchSTEM(stem: string | undefined) {
    this.pinpointSTEM.set(stem);
    this.isPinpointing.set(true);
    this.activePinpointTab.set(3);
  }

  private getDroppedItemsFromNPC(ref: INPCDefinition): ItemDropDescriptor[] {
    const drops =
      ref.drops?.map((d) => ({
        npcName: ref.npcId,
        chance: d.chance,
        maxChance: d.maxChance ?? -1,
        itemName: d.result,
        originName: `NPC: ${ref.npcId}`,
      })) ?? [];

    const dropPool =
      ref.dropPool?.items?.map((d) => ({
        npcName: ref.npcId,
        chance: d.chance,
        maxChance: d.maxChance ?? -1,
        itemName: d.result,
        originName: `NPC: ${ref.npcId}`,
      })) ?? [];

    const copyDrops =
      ref.copyDrops
        ?.map((c) => {
          const potentials = get(ref.items, c.result) as Rollable[];
          return (
            potentials?.map((p) => ({
              npcName: ref.npcId,
              chance: -1,
              maxChance: -1,
              itemName: p.result,
              originName: `NPC: ${ref.npcId}`,
            })) ?? []
          );
        })
        .flat(Infinity) ?? [];

    const tans = ref.tansFor
      ? {
          npcName: ref.npcId,
          chance: 100,
          maxChance: 100,
          itemName: ref.tansFor,
          originName: `NPC: ${ref.npcId}`,
        }
      : undefined;

    return [...drops, ...dropPool, ...copyDrops, tans]
      .filter(Boolean)
      .flat()
      .filter((entry) => entry?.itemName !== 'none') as ItemDropDescriptor[];
  }

  private getItemUsesFromNPC(
    ref: INPCDefinition,
    item: string,
  ): ItemUseDescriptor[] {
    const drops: ItemUseDescriptor[] =
      ref.drops
        ?.filter((d) => d.result === item)
        .map(() => ({
          npcName: ref.npcId,
          extraDescription: 'DROP',
        })) ?? [];

    const dropPool: ItemUseDescriptor[] =
      ref.dropPool?.items
        ?.filter((d) => d.result === item)
        .map(() => ({
          npcName: ref.npcId,
          extraDescription: 'DROPPOOL',
        })) ?? [];

    const copyDrops: ItemUseDescriptor[] =
      ref.copyDrops
        ?.map((c) => {
          const potentials = get(ref.items, c.result) as Rollable[];
          return potentials
            ?.filter((f) => f.result === item)
            .map(() => ({
              npcName: ref.npcId,
              extraDescription: 'COPYDROP',
            }));
        })
        .flat(2) ?? [];

    const equipment: ItemUseDescriptor[] = Object.values(
      ref.items?.equipment ?? {},
    )
      .flat()
      .filter((r) => r.result === item)
      .map(() => ({
        npcName: ref.npcId,
        extraDescription: 'EQUIPMENT',
      }));

    const sack: ItemUseDescriptor[] = (ref.items?.sack ?? [])
      .filter((r) => r.result === item)
      .map(() => ({
        npcName: ref.npcId,
        extraDescription: 'SACK',
      }));

    const tans: ItemUseDescriptor | undefined =
      ref.tansFor === item
        ? {
            npcName: ref.npcId,
            extraDescription: `TANS`,
          }
        : undefined;

    return (
      [
        ...drops,
        ...dropPool,
        ...copyDrops,
        ...equipment,
        ...sack,
        tans,
      ] as ItemUseDescriptor[]
    )
      .filter(Boolean)
      .flat();
  }

  private getItemsFromMapSpawnerNPCs(map: string): ItemDropDescriptor[] {
    const mod = this.modService.mod();

    const mapData = mod.maps.find((m) => m.name === map)?.map;
    if (!mapData) return [];

    const allSpawners = uniq(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mapData.layers[10].objects.map((o: any) => o.properties.tag as string),
    );
    if (allSpawners.length === 0) return [];

    const allLairs = mapData.layers[10].objects
      .map((o: any) => o.properties.lairName as string)
      .filter(Boolean);

    const allSpawnerRefs = allSpawners
      .map((s) => mod.spawners.find((m) => m.tag === s))
      .filter((s) => (s?.npcIds.length ?? 0) > 0);

    if (allLairs.length === 0 && allSpawnerRefs.length === 0) return [];

    const allNPCNames = uniq([
      ...allLairs,
      ...allSpawnerRefs
        .map((s) => s?.npcIds.map((m) => m.result))
        .flat(Infinity),
    ]);

    const allNPCRefs = allNPCNames.map((m) =>
      mod.npcs.find((npc) => npc.npcId === m),
    );
    if (allNPCRefs.length === 0) return [];

    const allDrops: ItemDropDescriptor[] = sortBy(allNPCRefs, 'npcId')
      .map((ref) => {
        if (!ref) return [];
        return this.getDroppedItemsFromNPC(ref);
      })
      .flat(Infinity) as ItemDropDescriptor[];

    return allDrops;
  }

  private getItemsFromMapDroptables(map: string): ItemDropDescriptor[] {
    const mod = this.modService.mod();

    const mapData = mod.maps.find((m) => m.name === map)?.map;
    if (!mapData) return [];

    const region = mapData.properties.region;

    const dropTables = mod.drops.filter(
      (m) => m.mapName === map || m.regionName === region || m.isGlobal,
    );

    return dropTables
      .map((d) => {
        let originName = 'DT (global)';
        if (d.mapName) originName = `DT (${map})`;
        if (d.regionName) originName = `DT (${region})`;

        return d.drops.map((m) => ({
          originName: m.requireHoliday
            ? `[${m.requireHoliday}] ${originName}`
            : originName,
          itemName: m.result,
          chance: m.chance,
          maxChance: m.maxChance ?? -1,
        }));
      })
      .flat();
  }

  private getItemUses(
    item: string,
    validClasses: BaseClassType[],
  ): ItemUseDescriptor[] {
    const mod = this.modService.mod();

    // gather usages
    const containingItems =
      mod.items.filter((f) =>
        f.containedItems?.find((c) => c.result === item),
      ) ?? [];

    const recipeUses =
      mod.recipes.filter(
        (r) =>
          r.item === item ||
          r.ingredients?.some((i) => i === item) ||
          r.ozIngredients?.some((i) => i.display === item),
      ) ?? [];

    const questUses = mod.quests.filter((q) => q.requirements.item === item);

    const npcScriptUses = mod.dialogs.filter((sc) =>
      Object.values(sc.items?.equipment ?? {}).some((s) => s === item),
    );

    const npcDialogUses = mod.dialogs.filter((sc) =>
      extractAllItemsFromDialog(sc, validClasses).some((s) => s === item),
    );

    const npcBehaviorUses = mod.dialogs.filter((sc) =>
      extractAllItemsFromBehavior(sc).some((s) => s === item),
    );

    const droptableUses = mod.drops.filter((f) =>
      f.drops.some((d) => d.result === item),
    );

    const heldItemsOnMap = mod.maps
      .map((map) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
          mapName: map.name,
          helds: map.map.layers[8].objects
            .filter((o: any) => (o.properties?.requireHeld as string) === item)
            .flat(),
        };
      })
      .filter((m) => m.helds.length > 0);

    const peddleItemsOnMap = mod.maps
      .map((map) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
          mapName: map.name,
          peddles: map.map.layers[9].objects
            .filter((o: any) => (o.properties?.peddleItem as string) === item)
            .flat(),
        };
      })
      .filter((m) => m.peddles.length > 0);

    // format usages
    const containingItemDescs: ItemUseDescriptor[] = containingItems.map(
      (c) => ({
        containingItemName: c.name,
        extraDescription: 'CONTAINS',
      }),
    );

    const recipeDescs: ItemUseDescriptor[] = recipeUses.map((r) => ({
      recipeName: r.name,
      extraDescription: r.item === item ? 'RESULT' : 'INGREDIENT',
    }));

    const questDescs: ItemUseDescriptor[] = questUses.map((q) => ({
      questName: q.name,
      extraDescription: 'REQUIRED',
    }));

    const npcDescs: ItemUseDescriptor[] = sortBy(mod.npcs, 'npcId')
      .flatMap((n) => this.getItemUsesFromNPC(n, item))
      .filter(Boolean);

    const heldDescs: ItemUseDescriptor[] = heldItemsOnMap
      .map((m) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return m.helds.map((h: any) => ({
          mapAndObjectName: `${m.mapName} (${h.x / 64}, ${h.y / 64 - 1})`,
          extraDescription: 'UNLOCKS',
        }));
      })
      .flat();

    const peddleDescs: ItemUseDescriptor[] = peddleItemsOnMap
      .map((m) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return m.peddles.map((h: any) => ({
          mapAndObjectName: `${m.mapName} (${h.x / 64}, ${h.y / 64 - 1})`,
          extraDescription: 'PEDDLES',
        }));
      })
      .flat();

    const npcScriptDescs: ItemUseDescriptor[] = npcScriptUses.map((sc) => ({
      npcScriptName: sc.tag,
      extraDescription: 'EQUIPMENT',
    }));

    const npcDialogDescs: ItemUseDescriptor[] = npcDialogUses.map((sc) => ({
      npcScriptName: sc.tag,
      extraDescription: 'DIALOG',
    }));

    const npcBehaviorDescs: ItemUseDescriptor[] = npcBehaviorUses.map((sc) => ({
      npcScriptName: sc.tag,
      extraDescription: 'BEHAVIOR',
    }));

    const droptableDescs: ItemUseDescriptor[] = droptableUses.map((d) => ({
      droptableName: d.mapName ?? d.regionName ?? 'Global',
      extraDescription: 'DROPTABLE',
    }));

    return [
      ...containingItemDescs,
      ...recipeDescs,
      ...questDescs,
      ...npcDescs,
      ...npcScriptDescs,
      ...npcDialogDescs,
      ...npcBehaviorDescs,
      ...droptableDescs,
      ...heldDescs,
      ...peddleDescs,
    ] as ItemUseDescriptor[];
  }

  private getNPCUses(npc: string): NPCUseDescriptor[] {
    const mod = this.modService.mod();

    const lairMaps: NPCUseDescriptor[] = mod.maps
      .map((m) => {
        const lairSpawners = m.map.layers[10].objects.filter(
          (o: any) => o.properties.lairName === npc,
        );

        return lairSpawners.map((spawner: any) => ({
          spawnerName: 'Lair',
          extraDescription: `MAP ${m.name} (${spawner.x / 64}, ${
            spawner.y / 64 - 1
          })`,
        })) as NPCUseDescriptor[];
      })
      .flat();

    const relatedSpawners = mod.spawners
      .filter((s) => s.npcIds.some((n) => n.result === npc))
      .map((m) => m.tag);

    const relatedSpawnerUses = mod.maps
      .map((m) => {
        const foundSpawners = m.map.layers[10].objects.filter((o: any) =>
          relatedSpawners.includes(o.properties.tag as string),
        );

        return foundSpawners.map((spawner: any) => ({
          spawnerName: spawner.properties.tag,
          extraDescription: `MAP ${m.name} (${spawner.x / 64}, ${
            spawner.y / 64 - 1
          })`,
        })) as NPCUseDescriptor[];
      })
      .flat();

    const relatedQuests = mod.quests
      .filter((q) => q.requirements?.npcIds?.includes(npc))
      .map((q) => ({
        questName: q.name,
      }));

    const relatedSTEMs = mod.stems
      .filter(
        (f) =>
          f._hasSpell && f.spell?.spellMeta?.creatureSummoned?.includes(npc),
      )
      .map((s) => ({
        stemName: s._gameId,
      }));

    return [
      ...lairMaps,
      ...relatedSpawnerUses,
      ...relatedQuests,
      ...relatedSTEMs,
    ].filter(Boolean);
  }

  private getNPCDrops(npc: string): Rollable[] {
    const mod = this.modService.mod();

    const npcData = mod.npcs.find((n) => n.npcId === npc);
    if (!npcData) return [];

    const allPossibleSpawners = mod.spawners
      .filter((s) => s.npcIds.some((n) => n.result === npc))
      .map((s) => s.tag);

    const allMaps = mod.maps.filter((m) =>
      m.map.layers[10].objects.some(
        (o: any) =>
          o.properties.lairName === npc ||
          allPossibleSpawners.includes(o.properties.tag as string),
      ),
    );

    const allMapNames = allMaps.map((m) => m.name);
    const allMapRegions = allMaps.map((m) => m.map.properties.region as string);

    const droptables = mod.drops.filter(
      (d) =>
        d.isGlobal ||
        (d.mapName && allMapNames.includes(d.mapName)) ||
        (d.regionName && allMapRegions.includes(d.regionName)),
    );

    return [
      ...(npcData.drops ?? []),
      ...(npcData.dropPool?.items ?? []),
      ...(
        npcData.copyDrops?.map((c) => {
          return get(npcData.items, c.result) as Rollable[];
        }) ?? []
      ).flat(),
      ...(npcData.tansFor
        ? [
            {
              result: npcData.tansFor,
              chance: -1,
            },
          ]
        : []),
      ...droptables.map((d) => d.drops).flat(),
    ]
      .filter(Boolean)
      .filter((i) => i.result !== 'none');
  }

  private getSTEMUses(stem: string): STEMUseDescriptor[] {
    const mod = this.modService.mod();

    const ret: STEMUseDescriptor[] = [];

    mod.items.forEach((item) => {
      if (item.trait?.name === stem) {
        ret.push({
          itemTrait: item.name,
        });
      }

      if (item.randomTrait?.name?.includes(stem)) {
        ret.push({
          itemRandomTrait: item.name,
        });
      }

      if (item.useEffect?.name === stem) {
        ret.push({
          itemEffect: item.name,
        });
      }

      if (item.breakEffect?.name === stem) {
        ret.push({
          itemEffect: item.name,
        });
      }

      if (item.equipEffect?.name === stem) {
        ret.push({
          itemEffect: item.name,
        });
      }

      if (item.trapEffect?.name === stem) {
        ret.push({
          itemEffect: item.name,
        });
      }

      if (item.strikeEffect?.name === stem) {
        ret.push({
          itemEffect: item.name,
        });
      }

      if (item.encrustGive?.strikeEffect?.name === stem) {
        ret.push({
          itemEffect: item.name,
        });
      }
    });

    mod.npcs.forEach((npc) => {
      if (npc.traitLevels?.[stem]) {
        ret.push({
          npcTrait: npc.npcId,
        });
      }

      if (npc.usableSkills?.some((s) => s.result === stem)) {
        ret.push({
          npcSkill: npc.npcId,
        });
      }

      if (npc.baseEffects?.some((e) => e.name === stem)) {
        ret.push({
          npcBaseEffect: npc.npcId,
        });
      }
    });

    mod.traitTrees.forEach((t) => {
      t.data.treeOrder.forEach((treeName) => {
        const treeData = t.data.trees[treeName];
        treeData.tree.forEach((row) => {
          row.traits.forEach((trait) => {
            if (trait.name === stem) {
              ret.push({
                traitTree: `${treeName} (${t.name})`,
              });
            }
          });
        });
      });
    });

    return ret;
  }
}
