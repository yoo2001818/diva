import { CSSStyleRule } from '../cssom/CSSRule';
import { CSSStyleDeclaration } from '../cssom/CSSStyleDeclaration';
import { CSSKeyword, CSSLength, CSSStyleDict } from '../cssom/dict';
import { getSpecificity } from '../cssom/utils';
import { Document } from '../dom/Document';
import { Element } from '../dom/Element';

export class ComputedStyle {
  element: Element;
  style: CSSStyleDeclaration = new CSSStyleDeclaration();

  constructor(element: Element) {
    this.element = element;
  }

  /**
   * Returns the font size in px.
   */
  getFontSize(): number {
    const fontSize = this.get('fontSize');
    const parent = this.element.parentElement!;
    switch (fontSize.type) {
      case 'length':
        switch (fontSize.unit) {
          case 'em': {
            const parentFontSize = parent._computedStyle.getFontSize();
            return parentFontSize * fontSize.value;
          }
          case 'cm':
          case 'ex':
          case 'in':
          case 'mm':
          case 'pc':
          case 'pt':
            // TODO: What am I supposed to do with this?
            return fontSize.value;
          case 'px':
          default:
            return fontSize.value;
        }
      case 'percentage': {
        const parentFontSize = parent._computedStyle.getFontSize();
        return parentFontSize * fontSize.value;
      }
      case 'xx-small':
      case 'x-small':
      case 'small':
      case 'medium':
      case 'large':
      case 'larger':
      case 'x-large':
      case 'xx-large':
      case 'smaller':
      case 'larger':
      default:
        // ...
        return 1;
    }
  }

  _getRaw(key: any) {
    const rules: { rule: CSSStyleRule; specificity: number }[] = [];
    const styleSheets = this.element.ownerDocument!.styleSheets;
    for (const sheet of styleSheets) {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSStyleRule) {
          if (this.element.matches(rule.selectorText)) {
            // Parse the selector, retrieve specificity
            const specificity = getSpecificity(this.element, rule.selectorText);
            rules.push({ rule, specificity });
          }
        }
      }
    }
  }

  get<K extends keyof CSSStyleDict>(
    key: K,
  ): Exclude<CSSStyleDict[K], CSSKeyword<'inherit'>> {
    const value = this.style._getRaw(key);
    if (!Array.isArray(value)) {
      if (value.type === 'inherit') {
        const parent = this.element.parentElement!;
        return parent._computedStyle.get(key);
      }
      if (key !== 'fontSize' && value.type === 'length') {
        const length = value as CSSLength;
        switch (length.unit) {
          case 'em': {
            const fontSize = this.getFontSize();
            return {
              type: 'length',
              unit: 'px',
              value: fontSize * length.value,
            } as any;
          }
          case 'cm':
          case 'ex':
          case 'in':
          case 'mm':
          case 'pc':
          case 'pt':
            // TODO: What am I supposed to do with this?
            return length as any;
          case 'px':
          default:
            return length as any;
        }
      }
      if (key !== 'fontSize' && value.type === 'percentage') {
        const parent = this.element.parentElement!;
        const contentWidth = parent.styleData.principalBox.contentWidth;
        return {
          type: 'length',
          unit: 'px',
          value: (contentWidth * value.value) / 100,
        } as any;
      }
    }
    return value as any;
  }

  getPx(key: keyof CSSStyleDict): number {
    // FIXME: This is not workable
    return (this.get(key) as CSSLength).value;
  }

  update(): void {
    // TODO: Implement caching the style...
  }
}
