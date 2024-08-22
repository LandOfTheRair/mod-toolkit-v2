import { HasIdentification } from './identified';

export interface ICoreContent extends HasIdentification {
  name: string;
  desc: string;
  yaml: string;
  json: any;
}
