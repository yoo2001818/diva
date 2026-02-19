import { Element } from '../../dom/Element';
import { Text } from '../../dom/Text';
import { LayoutDocument } from '../LayoutDocument';
import { createZeroBox } from './utils';
import { LayoutNode } from './LayoutNode';

export class TextRunLayoutNode extends LayoutNode {
  readonly domNode: Text;
  text: string;
  inlineStack: Element[];
  ascent: number | null = null;
  descent: number | null = null;
  actualAscent: number | null = null;
  actualDescent: number | null = null;
  fontSize: number | null = null;

  constructor(
    layoutDocument: LayoutDocument,
    domNode: Text,
    parent: LayoutNode | null,
    text: string,
    inlineStack: Element[],
    left: number,
    top: number,
  ) {
    super(layoutDocument, 'text-run', domNode, parent, createZeroBox(left, top));
    this.domNode = domNode;
    this.text = text;
    this.inlineStack = inlineStack;
  }
}
