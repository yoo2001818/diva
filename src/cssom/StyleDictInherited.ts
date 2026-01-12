import { Element } from '../dom/Element';
import { STYLE_PROPERTY_DESCRIPTOR_MAP } from './descriptor';
import { CSSKeyword, CSSStyleDict } from './dict';
import { StyleDict, StyleDictRecord } from './StyleDict';
import { StyleDictCascaded } from './StyleDictCascaded';

type CleanedValue<T> = Exclude<T, CSSKeyword<'initial' | 'inherit'>>;

export class StyleDictInherited implements Omit<StyleDict, 'get' | 'getValue'> {
  cascadedDict: StyleDictCascaded;
  element: Element;

  constructor(cascadedDict: StyleDictCascaded, element: Element) {
    this.cascadedDict = cascadedDict;
    this.element = element;
  }
  get size(): number {
    return this.cascadedDict.size;
  }
  keys(): IterableIterator<keyof CSSStyleDict> {
    return this.cascadedDict.keys();
  }
  entries(): IterableIterator<[keyof CSSStyleDict, StyleDictRecord<any>]> {
    throw new Error('Method not implemented.');
  }
  has<K extends keyof CSSStyleDict>(property: K): boolean {
    return this.cascadedDict.has(property);
  }
  get<K extends keyof CSSStyleDict>(
    property: K,
  ): StyleDictRecord<CleanedValue<CSSStyleDict[K]>> {
    const entry = this.cascadedDict.get(property);
    const descriptor = STYLE_PROPERTY_DESCRIPTOR_MAP[property];
    if (entry == null && !descriptor.isInherited) {
      return {
        value: descriptor.default as any,
        priority: null,
      };
    }
    if (entry == null || (entry.value as any).type === 'inherit') {
      // TODO: caching
      const parent = this.element.parentElement;
      if (parent == null) {
        return {
          value: descriptor.default as any,
          priority: null,
        };
      }
      return parent._computedStyle.inheritedDict.get(property);
    }
    if ((entry.value as any).type === 'initial') {
      return { value: descriptor.default as any, priority: null };
    }
    return entry as any;
  }
  getValue<K extends keyof CSSStyleDict>(
    property: K,
  ): CleanedValue<CSSStyleDict[K]> {
    const record = this.get(property);
    return record.value;
  }
  getPriority<K extends keyof CSSStyleDict>(property: K): 'important' | null {
    const record = this.get(property);
    return record.priority;
  }
  set<K extends keyof CSSStyleDict>(
    _property: K,
    _value: CSSStyleDict[K] | null,
    _priority?: 'important' | null,
  ): void {
    // noop
  }
  remove<K extends keyof CSSStyleDict>(_property: K): void {
    // noop
  }
  clear(): void {
    // noop
  }
}
