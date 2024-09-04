import { isObject, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import { isArrayOf, isTraitTreeObject } from './_helpers';

export const traitTreeSchema: Schema = [
  ['name', true, isString],
  ['data', true, isObject],
  ['data.treeOrder', true, isArrayOf(isString)],
  ['data.trees', true, isTraitTreeObject],
];
