import { Node } from '../dom/Node';
import { Box } from './Box';
import type { BlockLayoutNode } from './nodes/BlockLayoutNode';
import type { LayoutNode } from './nodes/LayoutNode';

export class LayoutDocument {
  root: BlockLayoutNode | null = null;
  viewport: Box;
  nodesByDom: WeakMap<Node, LayoutNode[]> = new WeakMap();

  constructor(viewport: Box) {
    this.viewport = viewport;
  }

  registerNode(node: LayoutNode): void {
    const list = this.nodesByDom.get(node.domNode);
    if (list == null) {
      this.nodesByDom.set(node.domNode, [node]);
      return;
    }
    list.push(node);
  }
}
