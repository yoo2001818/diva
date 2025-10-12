import { CSSKeyword, CSSLength, CSSPercentage, CSSStyleDict } from '../dict';
import { parse, Parser } from './parse';
import { stringifySideShorthand, stringifySize } from './stringify';
import { StyleDictMap, StyleDictRecord, StylePriority } from '../StyleDictMap';

export interface StyleSchemaEntry {
  get(map: StyleDictMap): string | null;
  getPriority(map: StyleDictMap): StylePriority;
  set(map: StyleDictMap, value: string, priority: StylePriority): void;
  remove(map: StyleDictMap): void;
  coalesceProperties?: string[];
}

export function entry<K extends keyof CSSStyleDict>(
  property: K,
  get: (v: CSSStyleDict[K]) => string,
  parseFunc: (v: Parser) => CSSStyleDict[K] | null,
  coalesceProperties?: string[],
): StyleSchemaEntry {
  return {
    get(map) {
      const value = map.getValue(property);
      if (value != null) return get(value);
      return null;
    },
    getPriority(map) {
      return map.getPriority(property);
    },
    set(map, input, priority) {
      const value = parse(input, parseFunc);
      if (value != null) {
        map.set(property, value, priority);
      }
    },
    remove(map) {
      map.remove(property);
    },
    coalesceProperties: coalesceProperties,
  };
}

type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export function sizeEntry<
  K extends KeysMatching<
    CSSStyleDict,
    CSSLength | CSSPercentage | CSSKeyword<any>
  >,
>(
  property: K,
  keywords: CSSStyleDict[K]['type'][],
  coalesceProperties?: string[],
): StyleSchemaEntry {
  return entry(
    property,
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.percentage(),
        () => v.keyword(...keywords),
      ) as any,
    coalesceProperties,
  );
}

export function getPropertiesPriority<K extends keyof CSSStyleDict>(
  map: StyleDictMap,
  properties: K[],
): StylePriority | null {
  const priority = map.getPriority(properties[0]);
  if (properties.slice(1).every((prop) => map.getPriority(prop) === priority)) {
    return priority;
  }
  return null;
}

export function getProperties<Ks extends (keyof CSSStyleDict)[]>(
  map: StyleDictMap,
  properties: Ks,
): { [K in keyof Ks]: CSSStyleDict[Ks[K]] } | null {
  const records = properties.map((prop) => map.get(prop));
  if (records.some((v) => v == null)) {
    return null;
  }
  if (
    records
      .slice(1)
      .every((record) => record?.priority !== records[0]?.priority)
  ) {
    return null;
  }
  return (records as StyleDictRecord[]).map((record) => record.value) as any;
}

export function shorthandEntry<Ks extends [] | (keyof CSSStyleDict)[]>(
  properties: Ks,
  get: (record: { [K in keyof Ks]: CSSStyleDict[Ks[K]] }) => string,
  parseFunc: (v: Parser) => { [K in keyof Ks]: CSSStyleDict[Ks[K]] } | null,
  coalesceProperties?: string[],
): StyleSchemaEntry {
  return {
    get(map) {
      const values = getProperties(map, properties);
      if (values != null) {
        return get(values);
      }
      return null;
    },
    getPriority(map) {
      return getPropertiesPriority(map, properties) ?? null;
    },
    set(map, input, priority) {
      const value = parse(input, parseFunc);
      if (value != null) {
        properties.forEach((prop, i) => {
          map.set(prop, value[i], priority);
        });
      }
    },
    remove(map) {
      properties.forEach((prop) => {
        map.remove(prop);
      });
    },
    coalesceProperties,
  };
}

export function sideShorthand<K extends keyof CSSStyleDict>(
  properties: [K, K, K, K],
  get: (v: CSSStyleDict[K]) => string,
  parseFunc: (v: Parser) => CSSStyleDict[K] | null,
  coalesceProperties?: string[],
): StyleSchemaEntry {
  return shorthandEntry(
    properties,
    (values) => stringifySideShorthand(values, get),
    (v) => v.sideShorthand(() => parseFunc(v)),
    coalesceProperties,
  );
}

export function sideShorthandSet<
  K extends keyof CSSStyleDict,
  K2 extends string,
>(
  name: K2,
  keys: [K, K, K, K],
  get: (v: CSSStyleDict[K]) => string,
  parseFunc: (v: Parser) => CSSStyleDict[K] | null,
  coalesceProperties: string[] = [],
): Record<K | K2, StyleSchemaEntry> {
  return {
    [keys[0]]: entry(keys[0], get, parseFunc, [name, ...coalesceProperties]),
    [keys[1]]: entry(keys[1], get, parseFunc, [name, ...coalesceProperties]),
    [keys[2]]: entry(keys[2], get, parseFunc, [name, ...coalesceProperties]),
    [keys[3]]: entry(keys[3], get, parseFunc, [name, ...coalesceProperties]),
    [name]: sideShorthand(keys, get, parseFunc, coalesceProperties),
  } as Record<K | K2, StyleSchemaEntry>;
}
