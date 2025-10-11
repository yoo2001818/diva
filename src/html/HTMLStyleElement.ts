import { CSSStyleSheet } from '../cssom/CSSStyleSheet';
import { Document } from '../dom/Document';
import { DOMTokenList } from '../dom/DOMTokenList';
import { HTMLElement } from './HTMLElement';

export class HTMLStyleElement extends HTMLElement {
  _sheet: CSSStyleSheet;

  constructor(document: Document, tagName: string) {
    super(document, tagName);
    this._sheet = new CSSStyleSheet();
    this._update = this._update.bind(this);
    this._childListChangedRecursiveSignal.add(this._update);
    this._characterDataChangedRecursiveSignal.add(this._update);
  }

  _update(): void {
    const text = this.textContent;
    this._sheet.replaceSync(text ?? '');
  }

  get blocking(): DOMTokenList {
    return new DOMTokenList();
  }

  get disabled(): boolean {
    return false;
  }

  set disabled(value: boolean) {}

  get media(): string {
    return '';
  }

  set media(value: string) {}

  get sheet(): CSSStyleSheet {
    return this._sheet;
  }
}
