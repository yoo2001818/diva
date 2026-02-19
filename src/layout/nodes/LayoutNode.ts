import { Node } from '../../dom/Node';
import { LayoutBox } from '../Box';
import { LayoutDocument } from '../LayoutDocument';

export type LayoutNodeKind =
  | 'block'
  | 'inline-box'
  | 'line-box'
  | 'text-run'
  | 'inline-block'
  | 'inline-start'
  | 'inline-end';

export abstract class LayoutNode {
  readonly layoutDocument: LayoutDocument;
  readonly kind: LayoutNodeKind;
  readonly domNode: Node;
  readonly parent: LayoutNode | null;
  box: LayoutBox;

  constructor(
    layoutDocument: LayoutDocument,
    kind: LayoutNodeKind,
    domNode: Node,
    parent: LayoutNode | null,
    box: LayoutBox = new LayoutBox(),
  ) {
    this.layoutDocument = layoutDocument;
    this.kind = kind;
    this.domNode = domNode;
    this.parent = parent;
    this.box = box;
    this.layoutDocument.registerNode(this);
  }

  getChildren(): LayoutNode[] {
    return [];
  }
}
