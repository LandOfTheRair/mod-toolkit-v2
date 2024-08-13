import { HasIdentification } from './identified';

export interface IEditorMap extends HasIdentification {
  name: string;
  map: any;
}
