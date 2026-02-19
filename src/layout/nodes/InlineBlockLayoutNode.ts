import { Element } from '../../dom/Element';
import { Box } from '../Box';
import { LayoutDocument } from '../LayoutDocument';
import { TextMetricsProvider } from '../TextMetrics';
import { LayoutNode } from './LayoutNode';
import type { LayoutNodeFactory } from './LayoutNodeFactory';
import { BlockLayoutNode } from './BlockLayoutNode';

function copyBoxGeometry(from: Box, to: Box): void {
  to.left = from.left;
  to.top = from.top;
  to.width = from.width;
  to.height = from.height;
}

export class InlineBlockLayoutNode extends LayoutNode {
  readonly domNode: Element;
  inlineStack: Element[];
  block: BlockLayoutNode | null = null;

  constructor(
    layoutDocument: LayoutDocument,
    domNode: Element,
    parent: LayoutNode | null,
    inlineStack: Element[],
  ) {
    super(layoutDocument, 'inline-block', domNode, parent);
    this.domNode = domNode;
    this.inlineStack = inlineStack;
  }

  layoutAtomic(
    containing: Box,
    flowTop: number,
    metrics: TextMetricsProvider,
    factory: LayoutNodeFactory,
  ): void {
    const block = factory.createBlock(this.domNode, this);
    block.layout(containing, flowTop, metrics, factory);
    this.block = block;

    copyBoxGeometry(block.box.outerBox, this.box.outerBox);
    copyBoxGeometry(block.box.scrollBox, this.box.scrollBox);
    copyBoxGeometry(block.box.innerBox, this.box.innerBox);

    this.box.margin.top = block.box.margin.top;
    this.box.margin.right = block.box.margin.right;
    this.box.margin.bottom = block.box.margin.bottom;
    this.box.margin.left = block.box.margin.left;

    this.box.border.top = block.box.border.top;
    this.box.border.right = block.box.border.right;
    this.box.border.bottom = block.box.border.bottom;
    this.box.border.left = block.box.border.left;

    this.box.padding.top = block.box.padding.top;
    this.box.padding.right = block.box.padding.right;
    this.box.padding.bottom = block.box.padding.bottom;
    this.box.padding.left = block.box.padding.left;

    this.box.background.color = block.box.background.color;
    this.box.borderTopStyle.color = block.box.borderTopStyle.color;
    this.box.borderRightStyle.color = block.box.borderRightStyle.color;
    this.box.borderBottomStyle.color = block.box.borderBottomStyle.color;
    this.box.borderLeftStyle.color = block.box.borderLeftStyle.color;
  }

  getChildren(): LayoutNode[] {
    if (this.block == null) {
      return [];
    }
    return [this.block];
  }
}
