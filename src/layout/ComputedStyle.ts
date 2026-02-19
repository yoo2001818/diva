import { CSSStyleDeclaration } from '../cssom/CSSStyleDeclaration';
import { CSSKeyword, CSSLength, CSSStyleDict } from '../cssom/dict';
import { StyleDictCascaded } from '../cssom/StyleDictCascaded';
import { StyleDictInherited } from '../cssom/StyleDictInherited';
import { Element } from '../dom/Element';

export class ComputedStyle {
  element: Element;
  style = new CSSStyleDeclaration();
  cascadedDict: StyleDictCascaded;
  inheritedDict: StyleDictInherited;

  constructor(element: Element) {
    this.element = element;
    this.cascadedDict = new StyleDictCascaded(this.style._dictMap, element);
    this.inheritedDict = new StyleDictInherited(this.cascadedDict, element);
    this.style._changedSignal.add(() => {
      this.cascadedDict.cachedDirty = true;
    });
  }

  /**
   * Returns the font size in px.
   */
  getFontSize(): number {
    const fontSize = this.get('fontSize');
    const parent = this.element.parentElement;
    const parentFontSize = parent?._computedStyle.getFontSize() ?? 16;
    switch (fontSize.type) {
      case 'length':
        switch (fontSize.unit) {
          case 'em': {
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
        return parentFontSize * fontSize.value;
      }
      case 'xx-small':
        return parentFontSize * 0.6;
      case 'x-small':
        return parentFontSize * 0.75;
      case 'small':
        return parentFontSize * 0.89;
      case 'medium':
        return parentFontSize;
      case 'large':
        return parentFontSize * 1.2;
      case 'larger':
        return parentFontSize * 1.2;
      case 'x-large':
        return parentFontSize * 1.5;
      case 'xx-large':
        return parentFontSize * 2;
      case 'smaller':
        return parentFontSize * 0.833;
      default:
        return parentFontSize;
    }
  }

  get<K extends keyof CSSStyleDict>(
    key: K,
  ): Exclude<CSSStyleDict[K], CSSKeyword<'inherit'>> {
    const value = this.inheritedDict.getValue(key);
    if (!Array.isArray(value)) {
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
    }
    return value as any;
  }

  getPx(key: keyof CSSStyleDict): number {
    const value = this.get(key) as CSSLength | CSSKeyword<'thin' | 'medium' | 'thick'>;
    if ((value as CSSLength).type === 'length') {
      return (value as CSSLength).value;
    }
    switch (value.type) {
      case 'thin':
        return 1;
      case 'medium':
        return 3;
      case 'thick':
        return 5;
      default:
        return 0;
    }
  }

  update(): void {
    // TODO: Implement caching the style...
  }
}
