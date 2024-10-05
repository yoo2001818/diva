import { CSSStyleDict } from './dict';
import { parse, Parser } from './parse';
import { stringifySideShorthand, stringifySize } from './stringify';

export interface CSSSchemaEntry {
  get(dict: CSSStyleDict): string;
  set(dict: CSSStyleDict, value: string): void;
}

function entry<K extends keyof CSSStyleDict>(
  key: K,
  get: (v: CSSStyleDict[K]) => string,
  parseFunc: (v: Parser) => CSSStyleDict[K] | null,
): CSSSchemaEntry {
  return {
    get(dict) {
      return get(dict[key]);
    },
    set(dict, input) {
      const value = parse(input, parseFunc);
      if (value != null) {
        dict[key] = value;
      }
    },
  };
}

function sideShorthand<K extends keyof CSSStyleDict>(
  keys: [K, K, K, K],
  get: (v: CSSStyleDict[K]) => string,
  parseFunc: (v: Parser) => CSSStyleDict[K] | null,
): CSSSchemaEntry {
  return {
    get(dict) {
      return stringifySideShorthand(
        [dict[keys[0]], dict[keys[1]], dict[keys[2]], dict[keys[3]]],
        get,
      );
    },
    set(dict, input) {
      const value = parse(input, (v) => v.sideShorthand(() => parseFunc(v)));
      if (value != null) {
        dict[keys[0]] = value[0];
        dict[keys[1]] = value[1];
        dict[keys[2]] = value[2];
        dict[keys[3]] = value[3];
      }
    },
  };
}

function sideShorthandSet<K extends keyof CSSStyleDict, K2 extends string>(
  name: K2,
  keys: [K, K, K, K],
  get: (v: CSSStyleDict[K]) => string,
  parseFunc: (v: Parser) => CSSStyleDict[K] | null,
): Record<K | K2, CSSSchemaEntry> {
  return {
    [keys[0]]: entry(keys[0], get, parseFunc),
    [keys[1]]: entry(keys[1], get, parseFunc),
    [keys[2]]: entry(keys[2], get, parseFunc),
    [keys[3]]: entry(keys[3], get, parseFunc),
    [name]: sideShorthand(keys, get, parseFunc),
  } as Record<K | K2, CSSSchemaEntry>;
}

export const schema = {
  ...sideShorthandSet(
    'padding',
    ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.percentage(),
        () => v.keyword('inherit'),
      ),
  ),
  ...sideShorthandSet(
    'margin',
    ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.percentage(),
        () => v.keyword('auto'),
        () => v.keyword('inherit'),
      ),
  ),
} satisfies Record<string, CSSSchemaEntry>;
