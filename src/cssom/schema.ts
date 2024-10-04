import { CSSPadding, CSSStyleDict } from './dict';
import { Parser } from './parse';
import { stringifyMargin, stringifySideShorthand } from './stringify';

export interface CSSSchemaEntry {
  get(dict: CSSStyleDict): string;
  set(dict: CSSStyleDict, value: string): void;
}

type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

const paddingEntry = (
  key: KeysMatching<CSSStyleDict, CSSPadding>,
): CSSSchemaEntry => ({
  get(dict) {
    return stringifyMargin(dict[key]);
  },
  set(dict, value) {
    const parser = new Parser();
    parser.reset(value);
    const val = parser.paddingEntry();
    if (val != null) {
      dict[key] = val;
    }
  },
});

export const schema = {
  paddingTop: paddingEntry('paddingTop'),
  paddingRight: paddingEntry('paddingRight'),
  paddingBottom: paddingEntry('paddingBottom'),
  paddingLeft: paddingEntry('paddingLeft'),
  padding: {
    get(dict) {
      return stringifySideShorthand(
        [
          dict.paddingTop,
          dict.paddingRight,
          dict.paddingBottom,
          dict.paddingLeft,
        ],
        stringifyMargin,
      );
    },
    set(dict, value) {
      const parser = new Parser();
      parser.reset(value);
      const val = parser.padding();
      if (val != null) {
        dict.paddingTop = val[0];
        dict.paddingRight = val[1];
        dict.paddingBottom = val[2];
        dict.paddingLeft = val[3];
      }
    },
  },
} satisfies Record<string, CSSSchemaEntry>;
