import { Element } from '../../dom/Element';
import { LayoutDocument } from '../LayoutDocument';
import { createZeroBox } from './utils';
import { LayoutNode } from './LayoutNode';

abstract class InlineMarkerLayoutNode extends LayoutNode {
  readonly domNode: Element;
  inlineStack: Element[];
  synthetic: boolean;

  constructor(
    layoutDocument: LayoutDocument,
    kind: 'inline-start' | 'inline-end',
    domNode: Element,
    parent: LayoutNode | null,
    inlineStack: Element[],
    synthetic: boolean,
    left: number,
    top: number,
  ) {
    super(layoutDocument, kind, domNode, parent, createZeroBox(left, top));
    this.domNode = domNode;
    this.inlineStack = inlineStack;
    this.synthetic = synthetic;
  }
}

export class InlineStartMarkerLayoutNode extends InlineMarkerLayoutNode {
  constructor(
    layoutDocument: LayoutDocument,
    domNode: Element,
    parent: LayoutNode | null,
    inlineStack: Element[],
    synthetic: boolean,
    left: number,
    top: number,
  ) {
    super(
      layoutDocument,
      'inline-start',
      domNode,
      parent,
      inlineStack,
      synthetic,
      left,
      top,
    );
  }
}

export class InlineEndMarkerLayoutNode extends InlineMarkerLayoutNode {
  constructor(
    layoutDocument: LayoutDocument,
    domNode: Element,
    parent: LayoutNode | null,
    inlineStack: Element[],
    synthetic: boolean,
    left: number,
    top: number,
  ) {
    super(
      layoutDocument,
      'inline-end',
      domNode,
      parent,
      inlineStack,
      synthetic,
      left,
      top,
    );
  }
}
