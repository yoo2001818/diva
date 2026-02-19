import { Element } from '../../dom/Element';
import { Box } from '../Box';
import { LayoutDocument } from '../LayoutDocument';
import { TextMetricsProvider } from '../TextMetrics';
import { LayoutNode } from './LayoutNode';
import type { LayoutNodeFactory } from './LayoutNodeFactory';
import { BlockLayoutNode } from './BlockLayoutNode';

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
    this.box = block.box;
  }

  getChildren(): LayoutNode[] {
    if (this.block == null) {
      return [];
    }
    return [this.block];
  }
}
