import { CSSRuleList } from './CSSRuleList';

export class CSSStyleSheet {
  cssRules: CSSRuleList = new CSSRuleList();

  constructor(options: CSSStyleSheetInit = {}) {}

  get ownerRule(): CSSRule | null {
    return null;
  }

  insertRule(rule: string, index: number = 0): number {
    return 0;
  }

  deleteRule(index: number): void {}

  replace(text: string): Promise<CSSStyleSheet> {
    return Promise.resolve(this);
  }

  replaceSync(text: string): void {}
}
