import { LayoutNode } from './LayoutNode';

export class InlineNode extends LayoutNode {
  isInline(): boolean {
    return true;
  }
}
