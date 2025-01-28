import { Node } from '../dom/Node';

export abstract class LayoutNode {
  node: Node | null = null;

  constructor(node: Node | null) {
    this.node = node;
  }

  /**
   * Resolves and generates computed style for the node.
   */
  resolveStyle(): void {}

  /**
   * Constructs the layout tree.
   */
  construct(): void {}

  /**
   * Calculate layouts for the layout tree.
   */
  layout(): void {}
}
