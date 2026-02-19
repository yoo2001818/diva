import { Element } from '../../dom/Element';
import { Text } from '../../dom/Text';
import { LayoutDocument } from '../LayoutDocument';
import { BlockLayoutNode } from './BlockLayoutNode';
import { InlineBoxLayoutNode } from './InlineBoxLayoutNode';
import { InlineEndMarkerLayoutNode, InlineStartMarkerLayoutNode } from './InlineMarkerLayoutNode';
import { InlineBlockLayoutNode } from './InlineBlockLayoutNode';
import { LayoutNode } from './LayoutNode';
import { LineBoxLayoutNode } from './LineBoxLayoutNode';
import { TextRunLayoutNode } from './TextRunLayoutNode';

export class LayoutNodeFactory {
  layoutDocument: LayoutDocument;

  constructor(layoutDocument: LayoutDocument) {
    this.layoutDocument = layoutDocument;
  }

  createBlock(domNode: Element, parent: LayoutNode | null): BlockLayoutNode {
    return new BlockLayoutNode(this.layoutDocument, domNode, parent);
  }

  createInlineBox(
    domNode: Element,
    parent: LayoutNode | null,
    left: number,
    top: number,
    width: number,
  ): InlineBoxLayoutNode {
    return new InlineBoxLayoutNode(
      this.layoutDocument,
      domNode,
      parent,
      left,
      top,
      width,
    );
  }

  createLineBox(
    domNode: Element,
    parent: LayoutNode | null,
    left: number,
    top: number,
    width: number,
  ): LineBoxLayoutNode {
    return new LineBoxLayoutNode(this.layoutDocument, domNode, parent, left, top, width);
  }

  createTextRun(
    domNode: Text,
    parent: LayoutNode | null,
    text: string,
    inlineStack: Element[],
    left: number,
    top: number,
  ): TextRunLayoutNode {
    return new TextRunLayoutNode(
      this.layoutDocument,
      domNode,
      parent,
      text,
      inlineStack,
      left,
      top,
    );
  }

  createInlineBlock(
    domNode: Element,
    parent: LayoutNode | null,
    inlineStack: Element[],
  ): InlineBlockLayoutNode {
    return new InlineBlockLayoutNode(this.layoutDocument, domNode, parent, inlineStack);
  }

  createInlineStartMarker(
    domNode: Element,
    parent: LayoutNode | null,
    inlineStack: Element[],
    synthetic: boolean,
    left: number,
    top: number,
  ): InlineStartMarkerLayoutNode {
    return new InlineStartMarkerLayoutNode(
      this.layoutDocument,
      domNode,
      parent,
      inlineStack,
      synthetic,
      left,
      top,
    );
  }

  createInlineEndMarker(
    domNode: Element,
    parent: LayoutNode | null,
    inlineStack: Element[],
    synthetic: boolean,
    left: number,
    top: number,
  ): InlineEndMarkerLayoutNode {
    return new InlineEndMarkerLayoutNode(
      this.layoutDocument,
      domNode,
      parent,
      inlineStack,
      synthetic,
      left,
      top,
    );
  }
}
