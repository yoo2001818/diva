import { Signal } from '../dom/Signal';
import { parseCSSRules } from './CSSRule';
import { CSSRuleList } from './CSSRuleList';

export class CSSStyleSheet {
  cssRules: CSSRuleList = new CSSRuleList();
  _updateSignal: Signal<[]> = new Signal();

  constructor(_options: CSSStyleSheetInit = {}) {}

  get ownerRule(): CSSRule | null {
    return null;
  }

  insertRule(text: string, index: number = 0): number {
    if (index > this.cssRules.length) {
      throw new DOMException('IndexSizeError');
    }
    const rules = parseCSSRules(text);
    this.cssRules.splice(index, 0, ...rules);
    rules.forEach((rule) => (rule._parentStyleSheet = this));
    this._updateSignal.emit();
    return index;
  }

  deleteRule(index: number): void {
    if (index >= this.cssRules.length) {
      throw new DOMException('IndexSizeError');
    }
    this.cssRules[index]._parentStyleSheet = null;
    this.cssRules.splice(index, 1);
    this._updateSignal.emit();
  }

  replace(text: string): Promise<CSSStyleSheet> {
    this.replaceSync(text);
    return Promise.resolve(this);
  }

  replaceSync(text: string): void {
    this.cssRules.forEach((rule) => (rule._parentStyleSheet = null));
    this.cssRules.splice(0, this.cssRules.length);
    this.insertRule(text);
  }
}
