import { CSSRule } from './CSSRule';

export class CSSRuleList extends Array<CSSRule> {
  item(index: number): CSSRule | null {
    return this[index] ?? null;
  }
}
