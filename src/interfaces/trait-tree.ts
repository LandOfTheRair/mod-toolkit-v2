export type ITraitTree = Record<string, ITraitTreeData>;

export interface ITraitTreeData {
  treeOrder: string[];

  trees: Record<string, ITraitTreeTab>;
}

export interface ITraitTreeTab {
  desc: string;
  tree: ITraitTreeRow[];
}

export interface ITraitTreeRow {
  traits: ITraitTreeRowTrait[];
}

export interface ITraitTreeRowTrait {
  name: string;
  maxLevel: number;
  requires?: string;
}
