import { CSSStyleDeclaration } from './CSSStyleDeclaration';
import { CSSStyleSheet } from './CSSStyleSheet';

export class CSSRule {
  cssText: string = '';

  get parentRule(): CSSRule | null {
    return null;
  }

  get parentStyleSheet(): CSSStyleSheet | null {
    return null;
  }
}

export class CSSStyleRule extends CSSRule {
  selectorText: string = '';
  style: CSSStyleDeclaration = new CSSStyleDeclaration();
}
