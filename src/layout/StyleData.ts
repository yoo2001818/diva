import type { Element } from '../dom/Element';
import type { Node } from '../dom/Node';
import { LayoutBox, Spacing } from './Box';
import { layoutBlocks } from './FormattingContext';
import { CSSStyleDeclaration } from '../cssom/CSSStyleDeclaration';
import { ComputedStyle } from './ComputedStyle';

export class StyleData {
  node: Node;
  style: CSSStyleDeclaration = new CSSStyleDeclaration();
  computedStyle: ComputedStyle = new ComputedStyle(this);

  // Each box will contain all properties necessary to render the node
  // (to allow pseudo and inline elements)
  // Box's width or height, location can be determined dynamically, but its
  // margin/border/padding will be determined on creation
  // Each box's location is determined relative to the parent's box.
  // Principal block -> additional boxes -> inline boxes
  boxes: LayoutBox[] = [];

  offsetParent: Element | null = null;

  constructor(node: Node) {
    this.node = node;
  }

  get principalBox(): LayoutBox {
    return this.boxes[0]!;
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
