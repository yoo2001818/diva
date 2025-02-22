import { CSSStyleDeclaration } from './CSSStyleDeclaration';
import { CSSStyleSheet } from './CSSStyleSheet';

export class CSSRule {
  _cssText: string = '';
  _parentStyleSheet: CSSStyleSheet | null = null;

  constructor(cssText: string) {
    this._cssText = cssText;
  }

  get parentRule(): CSSRule | null {
    return null;
  }

  get parentStyleSheet(): CSSStyleSheet | null {
    return this._parentStyleSheet;
  }

  get cssText(): string {
    return this._cssText;
  }

  set cssText(_value: string) {
    // Must do nothing
  }
}

export class CSSStyleRule extends CSSRule {
  selectorText: string = '';
  style: CSSStyleDeclaration = new CSSStyleDeclaration();
}

export function parseCSSRules(text: string): CSSRule[] {
  // TODO: Add a CSS parser, construct them, etc
  return [];
}
