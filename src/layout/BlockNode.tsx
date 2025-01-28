import { LayoutNode } from './LayoutNode';

export class BlockNode extends LayoutNode {
  children: LayoutNode[] = [];

  construct(): void {
    this.children = [];
  }
}
