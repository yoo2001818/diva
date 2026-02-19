import { CSSColor } from '../cssom/dict';
import { Element } from '../dom/Element';
import {
  buildFontDeclaration,
  DEFAULT_FONT_DECLARATION,
} from '../layout/Font';
import { TextRunLayoutNode } from '../layout/nodes/TextRunLayoutNode';
import { mapColor } from './color';

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
      font: DEFAULT_FONT_DECLARATION,
      fillStyle: '#000000',
    };
  }

  const computed = styleSource._computedStyle;
  const font = buildFontDeclaration(computed);
  const color = mapColor(computed.get('color') as CSSColor);

  let y = node.box.outerBox.top + (node.box.outerBox.height - font.fontSize) / 2;
  if (node.ascent != null && node.descent != null) {
    const glyphHeight = node.ascent + node.descent;
    const leading = Math.max(0, node.box.outerBox.height - glyphHeight);
    y = node.box.outerBox.top + leading / 2;
  }

  return {
    text: node.text,
    x: node.box.outerBox.left,
    y,
    font: font.font,
    fillStyle: color,
  };
}
