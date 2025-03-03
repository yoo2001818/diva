import { CSSStyleSheet } from '../cssom/CSSStyleSheet';
import { DOMTokenList } from '../dom/DOMTokenList';
import { HTMLElement } from './HTMLElement';

export class HTMLStyleElement extends HTMLElement {
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

  get sheet(): CSSStyleSheet | null {
    return null;
  }
}
