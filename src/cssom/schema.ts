import { CSSStyleDict } from './dict';

export interface CSSSchemaEntry {
  get(dict: CSSStyleDict): string;
  set(dict: CSSStyleDict, value: string): void;
}

export const schema = {
  paddingTop: {},
};
