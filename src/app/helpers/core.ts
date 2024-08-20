import { ICoreContent } from '../../interfaces';
import { id } from './id';

export const defaultCore: () => ICoreContent = () => ({
  _id: id(),
  name: '',
  yaml: '',
});
