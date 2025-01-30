import { LayoutNode } from './LayoutNode';

export class InlineBoxNode extends LayoutNode {
  children: LayoutNode[] = [];

  construct(): void {}

  appendChild(layoutNode: LayoutNode): void {
    this.children.push(layoutNode);
  }
}
