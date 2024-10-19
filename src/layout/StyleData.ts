import type { Element } from '../dom/Element';
import type { Node } from '../dom/Node';
import { LayoutBox, Spacing } from './Box';
import { layoutBlocks } from './FormattingContext';

export class StyleData {
  node: Node;
  style: CSSStyleDeclaration = new CSSStyleDeclaration();

  margin: Spacing = new Spacing();
  border: Spacing = new Spacing();
  // Principal block -> additional boxes -> inline boxes
  boxes: LayoutBox[] = [];

  offsetParent: Element | null = null;
  scrollTop: number = 0;
  scrollLeft: number = 0;
  scrollWidth: number = 0;
  scrollHeight: number = 0;

  constructor(node: Node) {
    this.node = node;
  }

  layout(containingBox: LayoutBox): void {
    // Assuming the block layout..
    const children: Element[] = [];
    for (let i = 0; i < (this.node as Element).children.length; i += 1) {
      children.push((this.node as Element).children[i]);
    }
    layoutBlocks(
      containingBox,
      this,
      children.map((v) => v.styleData),
    );
  }
}
