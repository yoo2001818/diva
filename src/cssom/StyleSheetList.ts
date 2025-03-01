import { CSSStyleSheet } from './CSSStyleSheet';

export class StyleSheetList extends Array<CSSStyleSheet> {
  item(index: number): CSSStyleSheet | null {
    return this[index] ?? null;
  }
}
