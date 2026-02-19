import { CSSColor, CSSStyleDict } from '../cssom/dict';
import { Element } from '../dom/Element';
import { TextRunLayoutNode } from '../layout/nodes/TextRunLayoutNode';
import { mapColor } from './color';

function stringifyFontFamily(fontFamily: CSSStyleDict['fontFamily']): string {
  if (fontFamily.length === 0) {
    return 'sans-serif';
  }
  const families = fontFamily.map((entry) => {
    if (entry.type === 'string') {
      return `"${entry.value}"`;
    }
    return entry.value;
  });
  return families.join(', ');
}

function stringifyFontWeight(weight: CSSStyleDict['fontWeight']): string {
  if (weight.type === 'number') {
    return String(weight.value);
  }
  return weight.type;
}

function resolveStyleSource(node: TextRunLayoutNode): Element | null {
  if (node.inlineStack.length > 0) {
    return node.inlineStack[node.inlineStack.length - 1];
  }
  return node.domNode.parentElement;
}

export interface TextPaintInstruction {
  text: string;
  x: number;
  y: number;
  font: string;
  fillStyle: string;
}

export function resolveTextPaintInstruction(
  node: TextRunLayoutNode,
): TextPaintInstruction {
  const styleSource = resolveStyleSource(node);
  if (styleSource == null) {
    return {
      text: node.text,
      x: node.box.outerBox.left,
      y: node.box.outerBox.top,
      font: '16px sans-serif',
      fillStyle: '#000000',
    };
  }

  const computed = styleSource._computedStyle;
  const fontStyle = computed.get('fontStyle').type;
  const fontVariant = computed.get('fontVariant').type;
  const fontWeight = stringifyFontWeight(computed.get('fontWeight'));
  const fontSize = computed.getFontSize();
  const fontFamily = stringifyFontFamily(computed.get('fontFamily'));
  const color = mapColor(computed.get('color') as CSSColor);

  const y = node.box.outerBox.top + (node.box.outerBox.height - fontSize) / 2;

  return {
    text: node.text,
    x: node.box.outerBox.left,
    y,
    font: `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`,
    fillStyle: color,
  };
}
