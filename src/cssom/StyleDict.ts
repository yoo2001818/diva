import { CSSStyleDict } from './dict';

export type StylePriority = 'important' | null;

export interface StyleDictRecord<T = any> {
  value: T;
  priority: StylePriority;
}

export interface StyleDict {
  get size(): number;
  keys(): IterableIterator<keyof CSSStyleDict>;
  entries(): IterableIterator<[keyof CSSStyleDict, StyleDictRecord<any>]>;
  has<K extends keyof CSSStyleDict>(property: K): boolean;
  get<K extends keyof CSSStyleDict>(
    property: K,
  ): StyleDictRecord<CSSStyleDict[K]> | null;
  getValue<K extends keyof CSSStyleDict>(property: K): CSSStyleDict[K] | null;
  getPriority<K extends keyof CSSStyleDict>(property: K): 'important' | null;
  set<K extends keyof CSSStyleDict>(
    property: K,
    value: CSSStyleDict[K] | null,
    priority?: 'important' | null,
  ): void;
  remove<K extends keyof CSSStyleDict>(property: K): void;
  clear(): void;
}
