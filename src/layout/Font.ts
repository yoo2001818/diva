import { CSSStyleDict } from '../cssom/dict';
import { ComputedStyle } from './ComputedStyle';

export const DEFAULT_FONT_SIZE_PX = 16;
export const DEFAULT_FONT_FAMILY = 'serif';
export const DEFAULT_FONT_DECLARATION = `normal normal normal ${DEFAULT_FONT_SIZE_PX}px ${DEFAULT_FONT_FAMILY}`;

export interface FontDeclaration {
  font: string;
  fontSize: number;
}

export function stringifyFontFamily(fontFamily: CSSStyleDict['fontFamily']): string {
  if (fontFamily.length === 0) {
    return DEFAULT_FONT_FAMILY;
  }
  const families = fontFamily.map((entry) => {
    if (entry.type === 'string') {
      return `"${entry.value}"`;
    }
    return entry.value;
  });
  return families.join(', ');
}

export function stringifyFontWeight(weight: CSSStyleDict['fontWeight']): string {
  if (weight.type === 'number') {
    return String(weight.value);
  }
  return weight.type;
}

export function buildDefaultFontDeclaration(fontSize: number): string {
  return `normal normal normal ${fontSize}px ${DEFAULT_FONT_FAMILY}`;
}

export function buildFontDeclaration(style: ComputedStyle): FontDeclaration {
  const fontStyle = style.get('fontStyle').type;
  const fontVariant = style.get('fontVariant').type;
  const fontWeight = stringifyFontWeight(style.get('fontWeight'));
  const fontSize = style.getFontSize();
  const fontFamily = stringifyFontFamily(style.get('fontFamily'));
  return {
    font: `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`,
    fontSize,
  };
}
