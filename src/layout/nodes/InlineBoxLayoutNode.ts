import { Element } from '../../dom/Element';
import { Box } from '../Box';
import { LayoutDocument } from '../LayoutDocument';
import { LayoutWalker } from '../LayoutWalker';
import { TextMetricsProvider } from '../TextMetrics';
import { LineBoxLayoutNode, LineItemLayoutNode } from './LineBoxLayoutNode';
import { LayoutNode } from './LayoutNode';
import type { LayoutNodeFactory } from './LayoutNodeFactory';
import { BlockLayoutNode } from './BlockLayoutNode';
import { TextRunLayoutNode } from './TextRunLayoutNode';

export class InlineBoxLayoutNode extends LayoutNode {
  readonly domNode: Element;
  children: [LineBoxLayoutNode] | [] = [];

  constructor(
    layoutDocument: LayoutDocument,
    domNode: Element,
    parent: LayoutNode | null,
    left: number,
    top: number,
    width: number,
  ) {
    super(layoutDocument, 'inline-box', domNode, parent);
    this.domNode = domNode;
    this.box.outerBox.left = left;
    this.box.outerBox.top = top;
    this.box.outerBox.width = width;
    this.box.scrollBox.left = left;
    this.box.scrollBox.top = top;
    this.box.scrollBox.width = width;
    this.box.innerBox.left = left;
    this.box.innerBox.top = top;
    this.box.innerBox.width = width;
  }

  getChildren(): LayoutNode[] {
    return this.children;
  }

  private applyInlineItemHeight(item: LineItemLayoutNode, height: number): void {
    if (item.kind === 'text-run' || item.kind === 'inline-start' || item.kind === 'inline-end') {
      item.box.outerBox.height = height;
      item.box.scrollBox.height = height;
      item.box.innerBox.height = height;
    }
  }

  private measureTextRun(
    run: TextRunLayoutNode,
    styleSource: Element,
    metrics: TextMetricsProvider,
  ): { width: number; height: number } {
    const fontSize = styleSource._computedStyle.getFontSize();
    const lineHeight = BlockLayoutNode.resolveLineHeight(styleSource._computedStyle, fontSize);
    return metrics.measure({
      text: run.text,
      fontSize,
      lineHeight,
    });
  }

  layoutSegment(
    walker: LayoutWalker,
    containing: Box,
    flowTop: number,
    activeInlineStack: Element[],
    metrics: TextMetricsProvider,
    factory: LayoutNodeFactory,
  ): boolean {
    const line = factory.createLineBox(this.domNode, this, containing.left, flowTop, containing.width);

    const items = line.children;
    let x = line.box.innerBox.left;
    let lineHeight = 0;
    let touched = false;
    const carriedInlineStack = [...activeInlineStack];
    let reopened = carriedInlineStack.length === 0;

    const ensureReopened = (): void => {
      if (reopened) {
        return;
      }
      reopened = true;
      for (let i = 0; i < carriedInlineStack.length; i += 1) {
        items.push(
          factory.createInlineStartMarker(
            carriedInlineStack[i],
            line,
            [...carriedInlineStack],
            true,
            x,
            flowTop,
          ),
        );
      }
    };

    while (true) {
      const item = walker.peek();
      if (item == null) {
        break;
      }

      if (item.type === 'start') {
        const display = BlockLayoutNode.resolveDisplay(item.element);
        if (display === 'none') {
          walker.consume(false);
          continue;
        }
        if (display === 'block') {
          break;
        }

        ensureReopened();

        if (display === 'inline') {
          activeInlineStack.push(item.element);
          items.push(
            factory.createInlineStartMarker(
              item.element,
              line,
              [...activeInlineStack],
              false,
              x,
              flowTop,
            ),
          );
          touched = true;
          walker.consume(true);
          continue;
        }

        if (display === 'inline-block') {
          const inlineContaining = new Box();
          inlineContaining.left = x;
          inlineContaining.top = flowTop;
          inlineContaining.width = containing.width;
          inlineContaining.height = containing.height;

          const inlineBlock = factory.createInlineBlock(
            item.element,
            line,
            [...activeInlineStack],
          );
          inlineBlock.layoutAtomic(inlineContaining, flowTop, metrics, factory);
          items.push(inlineBlock);
          x += inlineBlock.box.outerBox.width + inlineBlock.box.margin.width;
          lineHeight = Math.max(
            lineHeight,
            inlineBlock.box.outerBox.height + inlineBlock.box.margin.height,
          );
          touched = true;
          walker.consume(false);
          continue;
        }
      }

      if (item.type === 'end') {
        if (activeInlineStack.includes(item.element)) {
          ensureReopened();
          items.push(
            factory.createInlineEndMarker(
              item.element,
              line,
              [...activeInlineStack],
              false,
              x,
              flowTop,
            ),
          );
          const index = activeInlineStack.lastIndexOf(item.element);
          if (index !== -1) {
            activeInlineStack.splice(index, activeInlineStack.length - index);
          }
          touched = true;
        }
        walker.consume(true);
        continue;
      }

      if (item.type === 'text') {
        const text = item.text.data.slice(item.index);
        if (text.length === 0) {
          walker.consume(true);
          continue;
        }

        ensureReopened();

        const run = factory.createTextRun(
          item.text,
          line,
          text,
          [...activeInlineStack],
          x,
          flowTop,
        );
        const styleSource =
          activeInlineStack[activeInlineStack.length - 1] ?? this.domNode;
        const measured = this.measureTextRun(run, styleSource, metrics);
        run.box.outerBox.width = measured.width;
        run.box.scrollBox.width = measured.width;
        run.box.innerBox.width = measured.width;
        run.box.outerBox.height = measured.height;
        run.box.scrollBox.height = measured.height;
        run.box.innerBox.height = measured.height;

        items.push(run);
        x += measured.width;
        lineHeight = Math.max(lineHeight, measured.height);
        touched = true;
        walker.consumeText(text.length);
        continue;
      }
    }

    if (!touched) {
      return false;
    }

    if (lineHeight <= 0) {
      const fontSize = this.domNode._computedStyle.getFontSize();
      lineHeight = BlockLayoutNode.resolveLineHeight(this.domNode._computedStyle, fontSize);
    }

    if (activeInlineStack.length > 0) {
      for (let i = activeInlineStack.length - 1; i >= 0; i -= 1) {
        items.push(
          factory.createInlineEndMarker(
            activeInlineStack[i],
            line,
            [...activeInlineStack],
            true,
            x,
            flowTop,
          ),
        );
      }
    }

    for (let i = 0; i < items.length; i += 1) {
      this.applyInlineItemHeight(items[i], lineHeight);
    }

    line.box.outerBox.height = lineHeight;
    line.box.scrollBox.height = lineHeight;
    line.box.innerBox.height = lineHeight;

    this.box.outerBox.height = lineHeight;
    this.box.scrollBox.height = lineHeight;
    this.box.innerBox.height = lineHeight;

    this.children = [line];
    return true;
  }
}
