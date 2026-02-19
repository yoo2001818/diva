import { Element } from '../../dom/Element';
import { LayoutDocument } from '../LayoutDocument';
import { createZeroBox } from './utils';
import { InlineEndMarkerLayoutNode, InlineStartMarkerLayoutNode } from './InlineMarkerLayoutNode';
import { InlineBlockLayoutNode } from './InlineBlockLayoutNode';
import { LayoutNode } from './LayoutNode';
import { TextRunLayoutNode } from './TextRunLayoutNode';

export type LineItemLayoutNode =
  | TextRunLayoutNode
  | InlineBlockLayoutNode
  | InlineStartMarkerLayoutNode
  | InlineEndMarkerLayoutNode;

export class LineBoxLayoutNode extends LayoutNode {
  readonly domNode: Element;
  children: LineItemLayoutNode[] = [];

  constructor(
    layoutDocument: LayoutDocument,
    domNode: Element,
    parent: LayoutNode | null,
    left: number,
    top: number,
    width: number,
  ) {
    super(layoutDocument, 'line-box', domNode, parent, createZeroBox(left, top));
    this.domNode = domNode;
    this.box.outerBox.width = width;
    this.box.scrollBox.width = width;
    this.box.innerBox.width = width;
  }

  getChildren(): LayoutNode[] {
    return this.children;
  }
}
