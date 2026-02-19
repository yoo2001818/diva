import { Element } from '../dom/Element';
import { CSSStyleRule } from './CSSRule';
import { CSSStyleDeclarationInternal } from './CSSStyleDeclaration';
import { CSSStyleDict } from './dict';
import { StyleDict, StyleDictRecord } from './StyleDict';
import { getSpecificity, hasHigherPriority } from './utils';

interface CascadedRecord {
  record: StyleDictRecord<any>;
  specificity: number;
  order: number;
}

function shouldOverride(
  prev: CascadedRecord,
  next: CascadedRecord,
): boolean {
  if (prev.record.priority !== next.record.priority) {
    return hasHigherPriority(next.record.priority, prev.record.priority);
  }
  if (next.specificity !== prev.specificity) {
    return next.specificity > prev.specificity;
  }
  return next.order > prev.order;
}

export class StyleDictCascaded implements StyleDict {
  elementStyle: StyleDict;
  element: Element;
  affectedRules: CSSStyleRule[] = [];
  cachedMap: Map<keyof CSSStyleDict, StyleDictRecord<any>> = new Map();
  cachedDirty: boolean = true;

  constructor(elementStyle: StyleDict, element: Element) {
    this.elementStyle = elementStyle;
    this.element = element;
    this.affectedRules = [];
    const styleSheets = element.ownerDocument!.styleSheets;
    styleSheets._updateSignal.add(() => {
      this.cachedDirty = true;
    });
    element._attributesChangedSignal.add(() => {
      this.cachedDirty = true;
    });
  }

  _updateRuleList(): void {
    const rules: CSSStyleRule[] = [];
    const styleSheets = this.element.ownerDocument!.styleSheets;
    for (const sheet of styleSheets) {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSStyleRule) {
          if (this.element.matches(rule.selectorText)) {
            rules.push(rule);
          }
        }
      }
    }
    this.affectedRules = rules;
  }

  _updateMap(): void {
    if (!this.cachedDirty) {
      return;
    }
    this._updateRuleList();

    const resolved = new Map<keyof CSSStyleDict, CascadedRecord>();

    // Inline style acts like highest specificity declaration in author styles.
    let inlineOrder = 1_000_000_000;
    for (const [property, record] of this.elementStyle.entries()) {
      resolved.set(property, {
        record,
        specificity: 1_000_000_000,
        order: inlineOrder,
      });
      inlineOrder += 1;
    }

    let order = 0;
    const styleSheets = this.element.ownerDocument!.styleSheets;
    for (const sheet of styleSheets) {
      for (const rule of sheet.cssRules) {
        if (!(rule instanceof CSSStyleRule)) {
          continue;
        }
        if (!this.element.matches(rule.selectorText)) {
          continue;
        }

        const specificity = getSpecificity(this.element, rule.selectorText);
        const dictMap = (rule.style as CSSStyleDeclarationInternal)._dictMap;
        for (const [property, record] of dictMap.entries()) {
          const next: CascadedRecord = {
            record,
            specificity,
            order,
          };
          const prev = resolved.get(property);
          if (prev == null || shouldOverride(prev, next)) {
            resolved.set(property, next);
          }
        }
        order += 1;
      }
    }

    this.cachedMap.clear();
    for (const [property, data] of resolved.entries()) {
      this.cachedMap.set(property, data.record);
    }

    this.cachedDirty = false;
  }

  get size(): number {
    this._updateMap();
    return this.cachedMap.size;
  }
  keys(): IterableIterator<keyof CSSStyleDict> {
    this._updateMap();
    return this.cachedMap.keys();
  }
  entries(): IterableIterator<[keyof CSSStyleDict, StyleDictRecord<any>]> {
    this._updateMap();
    return this.cachedMap.entries();
  }
  has<K extends keyof CSSStyleDict>(property: K): boolean {
    this._updateMap();
    return this.cachedMap.has(property);
  }
  clear(): void {
    // noop
  }
  get<K extends keyof CSSStyleDict>(
    property: K,
  ): StyleDictRecord<CSSStyleDict[K]> | null {
    this._updateMap();
    const record = this.cachedMap.get(property);
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
    _property: K,
    _value: CSSStyleDict[K] | null,
    _priority: 'important' | null = null,
  ): void {
    // noop
  }
  remove<K extends keyof CSSStyleDict>(_property: K): void {
    // noop
  }
}
