import { CSSStyleDeclaration } from '../cssom/CSSStyleDeclaration';
import { CSSKeyword, CSSLength, CSSStyleDict } from '../cssom/dict';
import { StyleDictCascaded } from '../cssom/StyleDictCascaded';
import { Element } from '../dom/Element';

export class ComputedStyle {
  element: Element;
  style = new CSSStyleDeclaration();
  cascadedDict: StyleDictCascaded;

  constructor(element: Element) {
    this.element = element;
    this.cascadedDict = new StyleDictCascaded(this.style._dictMap, element);
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

  get<K extends keyof CSSStyleDict>(
    key: K,
  ): Exclude<CSSStyleDict[K], CSSKeyword<'inherit'>> {
    const value = this.cascadedDict.getValue(key);
    if (value == null) {
      // Use browser default
      throw new Error('Not implemented yet');
    }
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
