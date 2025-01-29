import type { Element } from '../dom/Element';
import { Box, LayoutBox } from './Box';
import { layoutBlocks } from './FormattingContext';
import { CSSStyleDeclaration } from '../cssom/CSSStyleDeclaration';
import { ComputedStyle } from './ComputedStyle';

export class StyleData {
  node: Element;
  style: CSSStyleDeclaration;
  computedStyle: ComputedStyle;

  // Each box will contain all properties necessary to render the node
  // (to allow pseudo and inline elements)
  // Box's width or height, location can be determined dynamically, but its
  // margin/border/padding will be determined on creation
  // Each box's location is determined relative to the parent's box.
  // Principal block -> additional boxes -> inline boxes
  boxes: LayoutBox[] = [];

  offsetParent: Element | null = null;

  constructor(node: Element) {
    this.node = node;
    this.computedStyle = node._computedStyle;
    this.style = node._computedStyle.style;
  }

  get children(): StyleData[] {
    const children: Element[] = [];
    for (let i = 0; i < (this.node as Element).children.length; i += 1) {
      children.push((this.node as Element).children[i]);
    }
    return children.map((v) => v.styleData);
  }

  get principalBox(): LayoutBox {
    return this.boxes[0]!;
  }

  layout(containingBox: Box): void {
    layoutBlocks(containingBox, this, this.children);
  }
}
