import { ITraitTree } from '../../interfaces';
import { id } from './id';

export const defaultTraitTree: () => ITraitTree = () => ({
  _id: id(),
  name: '',
  data: {
    treeOrder: [],
    trees: {},
  },
});
