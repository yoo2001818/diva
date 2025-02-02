import { Element } from '../dom/Element';
import { Node } from '../dom/Node';
import { LayoutBox } from './Box';
import { ComputedStyle } from './ComputedStyle';

export abstract class LayoutNode {
  node: Node | null = null;
  computedStyle: ComputedStyle | null = null;
  box: LayoutBox;

  constructor(node: Node | null) {
    this.node = node;
    this.box = new LayoutBox();
  }

  /**
   * Resolves and generates computed style for the node.
   */
  resolveStyle(): void {
    if (this.node instanceof Element) {
      this.computedStyle = this.node._computedStyle;
    } else {
      this.computedStyle = this.node!.parentElement!._computedStyle;
    }
    this.computedStyle!.update();
  }

  /**
   * Constructs the layout tree.
   */
  construct(): void {}

  /**
   * Calculate layouts for the layout tree.
   */
  layout(): void {}

  isBlock(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }
}
