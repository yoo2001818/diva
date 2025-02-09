import { createInlineBoxNode, createLayoutNode } from './createLayoutNode';
import { InlineBoxNode } from './InlineBoxNode';
import { LayoutNode } from './LayoutNode';

export class BlockNode extends LayoutNode {
  children: LayoutNode[] = [];

  construct(): void {
    this.children = [];
    let node = this.node!.firstChild;
    let inlineBox: InlineBoxNode | null = null;
    while (node != null) {
      const layoutNode = createLayoutNode(node);
      if (layoutNode?.isBlock()) {
        // If a block node is encountered, aka the inline box concludes, just
        // unregister the block node.
        if (inlineBox != null) {
          inlineBox = null;
        }
        this.children.push(layoutNode);
        layoutNode.resolveStyle();
        layoutNode.construct();
      } else if (layoutNode != null) {
        // If an inline node is encountered, aka the inline box needs to be
        // present, start one if not present.
        if (inlineBox == null) {
          inlineBox = createInlineBoxNode(this.node);
          this.children.push(inlineBox);
        }
        inlineBox.feed(layoutNode);
      }
      node = node.nextSibling;
    }
  }

  layout(): void {}

  isBlock(): boolean {
    return true;
  }
}
