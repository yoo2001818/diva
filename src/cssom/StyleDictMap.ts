import { CSSStyleDict } from './dict';

export type StylePriority = 'important' | null;

export interface StyleDictRecord<T = any> {
  value: T;
  priority: StylePriority;
}

export class StyleDictMap {
  records: Map<keyof CSSStyleDict, StyleDictRecord<any>> = new Map();

  get<K extends keyof CSSStyleDict>(
    property: K,
  ): StyleDictRecord<CSSStyleDict[K]> | null {
    const record = this.records.get(property);
    if (record == null) {
      return null;
    }
    return record;
  }
  getValue<K extends keyof CSSStyleDict>(property: K): CSSStyleDict[K] | null {
    const record = this.get(property);
    if (record == null) {
      return null;
    }
    return record.value;
  }
  getPriority<K extends keyof CSSStyleDict>(property: K): 'important' | null {
    const record = this.get(property);
    if (record == null) {
      return null;
    }
    return record.priority;
  }
  set<K extends keyof CSSStyleDict>(
    property: K,
    value: CSSStyleDict[K] | null,
    priority: 'important' | null = null,
  ): void {
    if (value == null) {
      this.remove(property);
      return;
    }
    this.records.set(property, { value, priority });
  }
  remove<K extends keyof CSSStyleDict>(property: K): void {
    this.records.delete(property);
  }
}
