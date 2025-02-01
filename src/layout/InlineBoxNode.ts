import { createLayoutNode } from './createLayoutNode';
import { InlineEndMarkerNode } from './InlineEndMarkerNode';
import { InlineNode } from './InlineNode';
import { InlineStartMarkerNode } from './InlineStartMarkerNode';
import { LayoutNode } from './LayoutNode';

export class InlineBoxNode extends LayoutNode {
  children: LayoutNode[] = [];

  construct(): void {}

  feed(layoutNode: LayoutNode): void {
    if (layoutNode instanceof InlineNode) {
      // Inline node is completely dissolved, and the 3 components only remain
      // in the tree:
      // - Start marker
      // - Children
      // - End marker
      this.children.push(new InlineStartMarkerNode(layoutNode.node));
      let node = this.node!.firstChild;
      while (node != null) {
        const layoutNode = createLayoutNode(node);
        if (layoutNode != null) {
          this.feed(layoutNode);
        }
        node = node.nextSibling;
      }
      this.children.push(new InlineEndMarkerNode(layoutNode.node));
    } else {
      this.children.push(layoutNode);
      layoutNode.resolveStyle();
      layoutNode.construct();
    }
  }
}
