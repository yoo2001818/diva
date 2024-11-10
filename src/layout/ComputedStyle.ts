import { CSSLength, CSSStyleDict } from '../cssom/dict';
import type { StyleData } from './StyleData';

export class ComputedStyle {
  styleData: StyleData;
  constructor(styleData: StyleData) {
    this.styleData = styleData;
  }

  /**
   * Returns the font size in px.
   */
  getFontSize(): number {
    const fontSize = this.get('fontSize');
    const parent = this.styleData.node.parentElement!;
    switch (fontSize.type) {
      case 'length':
        switch (fontSize.unit) {
          case 'em': {
            const parentFontSize = parent.styleData.computedStyle.getFontSize();
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
        const parentFontSize = parent.styleData.computedStyle.getFontSize();
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

  get<K extends keyof CSSStyleDict>(key: K): CSSStyleDict[K] {
    const value = this.styleData.style._getRaw(key);
    if (!Array.isArray(value)) {
      if (value.type === 'inherit') {
        const parent = this.styleData.node.parentElement!;
        return parent.styleData.computedStyle.get(key);
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
        const parent = this.styleData.node.parentElement!;
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
}
