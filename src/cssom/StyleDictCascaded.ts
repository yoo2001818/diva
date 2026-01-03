import { Element } from '../dom/Element';
import { CSSStyleRule } from './CSSRule';
import { CSSStyleDeclarationInternal } from './CSSStyleDeclaration';
import { CSSStyleDict } from './dict';
import { StyleDict, StyleDictRecord } from './StyleDict';
import { getSpecificity, hasHigherPriority } from './utils';

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
      // TODO: This needs to be removed when the element is deleted..
      this.cachedDirty = true;
    });
    this.element._computedStyle.style._changedSignal.add(() => {
      // TODO: This needs to be removed when the element is deleted..
      this.cachedDirty = true;
    });
  }

  _updateRuleList(): void {
    const rules: { rule: CSSStyleRule; specificity: number }[] = [];
    const styleSheets = this.element.ownerDocument!.styleSheets;
    for (const sheet of styleSheets) {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSStyleRule) {
          if (this.element.matches(rule.selectorText)) {
            // Parse the selector, retrieve specificity
            const specificity = getSpecificity(this.element, rule.selectorText);
            rules.push({ rule, specificity });
          }
        }
      }
    }
    rules.sort((a, b) => b.specificity - a.specificity);
    this.affectedRules = rules.map((v) => v.rule);
  }

  _updateMap(): void {
    if (!this.cachedDirty) {
      return;
    }
    this._updateRuleList();
    this.cachedMap.clear();
    // Walk every rule and store each map
    for (const [property, value] of this.elementStyle.entries()) {
      this.cachedMap.set(property, value);
    }
    for (const rule of this.affectedRules) {
      const dictMap = (rule.style as CSSStyleDeclarationInternal)._dictMap;
      for (const [property, value] of dictMap.entries()) {
        const prev = this.cachedMap.get(property);
        if (prev == null || hasHigherPriority(value.priority, prev.priority)) {
          this.cachedMap.set(property, value);
        }
      }
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
