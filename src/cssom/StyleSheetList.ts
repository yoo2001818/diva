import { CSSStyleSheet } from './CSSStyleSheet';

// FIXME: This needs to be dynamically updated as the StyleSheet
export class StyleSheetList extends Array<CSSStyleSheet> {
  item(index: number): CSSStyleSheet | null {
    return this[index] ?? null;
  }
}
