import { Document } from '../dom/Document';
import { HTMLCollectionImpl } from '../dom/HTMLCollection';
import { elementGetElementsByTagName } from '../dom/utils/element';
import { HTMLStyleElement } from '../html/HTMLStyleElement';
import { CSSStyleSheet } from './CSSStyleSheet';

export class StyleSheetList extends Array<CSSStyleSheet> {
  _styleNodes: HTMLCollectionImpl;
  constructor(document: Document) {
    super();
    this._styleNodes = elementGetElementsByTagName(document, 'STYLE');
    this._styleNodes._updateSignal.add(() => {
      this._update();
    });
  }
  _update(): void {
    this.length = 0;
    this.push(
      ...this._styleNodes
        .filter((node) => node instanceof HTMLStyleElement)
        .map((node) => node.sheet),
    );
  }
  item(index: number): CSSStyleSheet | null {
    return this[index] ?? null;
  }
}
