import {
  CSSBorderStyle,
  CSSColor,
  CSSKeyword,
  CSSLength,
  CSSPercentage,
} from '../../cssom/dict';
import { Element } from '../../dom/Element';
import { Box, Spacing } from '../Box';
import { ComputedStyle } from '../ComputedStyle';
import { LayoutDocument } from '../LayoutDocument';
import { LayoutWalker } from '../LayoutWalker';
import { TextMetricsProvider, defaultLineHeight } from '../TextMetrics';
import { FloatManager, FloatSide, ClearValue } from './FloatManager';
import { InlineBoxLayoutNode } from './InlineBoxLayoutNode';
import { LayoutNode } from './LayoutNode';
import type { LayoutNodeFactory } from './LayoutNodeFactory';

export type DisplayType = 'none' | 'block' | 'inline' | 'inline-block';

type LengthOrPercentage = CSSLength | CSSPercentage;

interface BlockBoxResolveResult {
  margin: Spacing;
  border: Spacing;
  padding: Spacing;
  contentWidth: number;
  contentHeight: number | null;
  backgroundColor: CSSColor;
  borderTopColor: CSSColor;
  borderRightColor: CSSColor;
  borderBottomColor: CSSColor;
  borderLeftColor: CSSColor;
}

function colorOrFallback(value: CSSColor | null, fallback: string): CSSColor {
  return value ?? { type: 'identifier', value: fallback };
}

function asClearValue(value: CSSKeyword<string>): ClearValue {
  switch (value.type) {
    case 'left':
    case 'right':
    case 'both':
      return value.type;
    case 'none':
    default:
      return 'none';
  }
}

function asFloatSide(value: CSSKeyword<string>): FloatSide | 'none' {
  switch (value.type) {
    case 'left':
    case 'right':
      return value.type;
    case 'none':
    default:
      return 'none';
  }
}

export class BlockLayoutNode extends LayoutNode {
  readonly domNode: Element;
  children: Array<BlockLayoutNode | InlineBoxLayoutNode> = [];

  constructor(
    layoutDocument: LayoutDocument,
    domNode: Element,
    parent: LayoutNode | null,
  ) {
    super(layoutDocument, 'block', domNode, parent);
    this.domNode = domNode;
  }

  static resolveDisplay(element: Element): DisplayType {
    const display = element._computedStyle.get('display');
    switch (display.type) {
      case 'none':
        return 'none';
      case 'inline':
        return 'inline';
      case 'inline-block':
        return 'inline-block';
      default:
        return 'block';
    }
  }

  static resolveLineHeight(style: ComputedStyle, fontSize: number): number {
    const value = style.get('lineHeight');
    if (Array.isArray(value)) {
      return defaultLineHeight(fontSize);
    }
    switch (value.type) {
      case 'length':
        return value.value;
      case 'percentage':
        return fontSize * (value.value / 100);
      case 'number':
        return fontSize * value.value;
      case 'normal':
      default:
        return defaultLineHeight(fontSize);
    }
  }

  private static resolveLength(value: LengthOrPercentage, reference: number): number {
    switch (value.type) {
      case 'length':
        return value.value;
      case 'percentage':
        return reference * (value.value / 100);
      default:
        return 0;
    }
  }

  private static resolveSpacing(
    value: CSSLength | CSSPercentage | CSSKeyword<'auto'>,
    referenceWidth: number,
  ): number {
    if (value.type === 'auto') {
      return 0;
    }
    return this.resolveLength(value, referenceWidth);
  }

  private static resolveBorderWidth(
    style: ComputedStyle,
    styleKey:
      | 'borderTopStyle'
      | 'borderRightStyle'
      | 'borderBottomStyle'
      | 'borderLeftStyle',
    widthKey:
      | 'borderTopWidth'
      | 'borderRightWidth'
      | 'borderBottomWidth'
      | 'borderLeftWidth',
  ): number {
    const borderStyle = style.get(styleKey) as CSSBorderStyle;
    if (borderStyle.type === 'none' || borderStyle.type === 'hidden') {
      return 0;
    }
    const borderWidth = style.get(widthKey) as CSSLength | CSSKeyword<string>;
    if ('value' in borderWidth) {
      return borderWidth.value;
    }
    switch (borderWidth.type) {
      case 'thin':
        return 1;
      case 'medium':
        return 3;
      case 'thick':
        return 5;
      default:
        return 0;
    }
  }

  static resolveFloat(element: Element): FloatSide | 'none' {
    const value = element._computedStyle.get('float') as CSSKeyword<string>;
    return asFloatSide(value);
  }

  static resolveClear(element: Element): ClearValue {
    const value = element._computedStyle.get('clear') as CSSKeyword<string>;
    return asClearValue(value);
  }

  static resolveMarginTop(element: Element, referenceWidth: number): number {
    const value = element._computedStyle.get('marginTop') as
      | CSSLength
      | CSSPercentage
      | CSSKeyword<'auto'>;
    return this.resolveSpacing(value, referenceWidth);
  }

  static collapseMargins(a: number, b: number): number {
    if (a >= 0 && b >= 0) {
      return Math.max(a, b);
    }
    if (a <= 0 && b <= 0) {
      return Math.min(a, b);
    }
    return a + b;
  }

  private resolveBlockBox(containing: Box): BlockBoxResolveResult {
    const style = this.domNode._computedStyle;

    const margin = new Spacing();
    margin.top = BlockLayoutNode.resolveSpacing(style.get('marginTop') as any, containing.width);
    margin.right = BlockLayoutNode.resolveSpacing(style.get('marginRight') as any, containing.width);
    margin.bottom = BlockLayoutNode.resolveSpacing(style.get('marginBottom') as any, containing.width);
    margin.left = BlockLayoutNode.resolveSpacing(style.get('marginLeft') as any, containing.width);

    const padding = new Spacing();
    padding.top = BlockLayoutNode.resolveSpacing(style.get('paddingTop') as any, containing.width);
    padding.right = BlockLayoutNode.resolveSpacing(style.get('paddingRight') as any, containing.width);
    padding.bottom = BlockLayoutNode.resolveSpacing(style.get('paddingBottom') as any, containing.width);
    padding.left = BlockLayoutNode.resolveSpacing(style.get('paddingLeft') as any, containing.width);

    const border = new Spacing();
    border.top = BlockLayoutNode.resolveBorderWidth(style, 'borderTopStyle', 'borderTopWidth');
    border.right = BlockLayoutNode.resolveBorderWidth(style, 'borderRightStyle', 'borderRightWidth');
    border.bottom = BlockLayoutNode.resolveBorderWidth(style, 'borderBottomStyle', 'borderBottomWidth');
    border.left = BlockLayoutNode.resolveBorderWidth(style, 'borderLeftStyle', 'borderLeftWidth');

    const widthValue = style.get('width') as LengthOrPercentage | CSSKeyword<'auto'>;
    const rawWidth =
      widthValue.type === 'auto'
        ? null
        : BlockLayoutNode.resolveLength(widthValue as LengthOrPercentage, containing.width);
    const contentWidth =
      rawWidth ??
      Math.max(0, containing.width - margin.width - border.width - padding.width);

    const heightValue = style.get('height') as LengthOrPercentage | CSSKeyword<'auto'>;
    const contentHeight =
      heightValue.type === 'auto'
        ? null
        : BlockLayoutNode.resolveLength(heightValue as LengthOrPercentage, containing.height);

    return {
      margin,
      border,
      padding,
      contentWidth,
      contentHeight,
      backgroundColor: colorOrFallback(style.get('backgroundColor') as CSSColor, 'transparent'),
      borderTopColor: colorOrFallback(style.get('borderTopColor') as CSSColor, 'black'),
      borderRightColor: colorOrFallback(style.get('borderRightColor') as CSSColor, 'black'),
      borderBottomColor: colorOrFallback(style.get('borderBottomColor') as CSSColor, 'black'),
      borderLeftColor: colorOrFallback(style.get('borderLeftColor') as CSSColor, 'black'),
    };
  }

  private buildBox(containing: Box, flowTop: number): BlockBoxResolveResult {
    const resolved = this.resolveBlockBox(containing);

    this.box.margin = resolved.margin;
    this.box.padding = resolved.padding;
    this.box.border = resolved.border;
    this.box.background.color = resolved.backgroundColor;
    this.box.borderTopStyle.color = resolved.borderTopColor;
    this.box.borderRightStyle.color = resolved.borderRightColor;
    this.box.borderBottomStyle.color = resolved.borderBottomColor;
    this.box.borderLeftStyle.color = resolved.borderLeftColor;

    this.box.outerBox.left = containing.left + this.box.margin.left;
    this.box.outerBox.top = flowTop + this.box.margin.top;
    this.box.outerBox.width = Math.max(
      0,
      resolved.contentWidth + this.box.padding.width + this.box.border.width,
    );

    this.box.scrollBox.left = this.box.outerBox.left + this.box.border.left;
    this.box.scrollBox.top = this.box.outerBox.top + this.box.border.top;
    this.box.scrollBox.width = Math.max(0, this.box.outerBox.width - this.box.border.width);

    this.box.innerBox.left = this.box.scrollBox.left + this.box.padding.left;
    this.box.innerBox.top = this.box.scrollBox.top + this.box.padding.top;
    this.box.innerBox.width = Math.max(0, this.box.scrollBox.width - this.box.padding.width);

    return resolved;
  }

  private finalizeHeight(
    resolved: BlockBoxResolveResult,
    contentHeightFromChildren: number,
  ): void {
    const contentHeight = resolved.contentHeight ?? contentHeightFromChildren;
    this.box.innerBox.height = Math.max(0, contentHeight);
    this.box.scrollBox.height = Math.max(0, contentHeight + this.box.padding.height);
    this.box.outerBox.height = Math.max(0, this.box.scrollBox.height + this.box.border.height);
  }

  private shiftSubtree(node: LayoutNode, dx: number, dy: number): void {
    node.box.outerBox.left += dx;
    node.box.outerBox.top += dy;
    node.box.scrollBox.left += dx;
    node.box.scrollBox.top += dy;
    node.box.innerBox.left += dx;
    node.box.innerBox.top += dy;
    const children = node.getChildren();
    for (let i = 0; i < children.length; i += 1) {
      this.shiftSubtree(children[i], dx, dy);
    }
  }

  private marginLeft(node: BlockLayoutNode): number {
    return node.box.outerBox.left - node.box.margin.left;
  }

  private marginRight(node: BlockLayoutNode): number {
    return this.marginLeft(node) + node.box.outerBox.width + node.box.margin.width;
  }

  private marginTop(node: BlockLayoutNode): number {
    return node.box.outerBox.top - node.box.margin.top;
  }

  private marginBottom(node: BlockLayoutNode): number {
    return this.marginTop(node) + node.box.outerBox.height + node.box.margin.height;
  }

  private resolveAvailableSegment(
    startY: number,
    clear: ClearValue,
    containing: Box,
    activeFloats: FloatManager,
  ): { y: number; left: number; right: number } {
    let y = activeFloats.clearY(startY, clear);
    let segment = activeFloats.lineSegmentAt(
      y,
      containing.left,
      containing.left + containing.width,
    );

    while (segment.right <= segment.left) {
      const nextY = activeFloats.nextY(y);
      if (nextY == null || nextY <= y) {
        break;
      }
      y = nextY;
      segment = activeFloats.lineSegmentAt(
        y,
        containing.left,
        containing.left + containing.width,
      );
    }

    return {
      y,
      left: segment.left,
      right: segment.right,
    };
  }

  private placeFloat(
    element: Element,
    side: FloatSide,
    containing: Box,
    normalFlowY: number,
    activeFloats: FloatManager,
    localFloats: FloatManager,
    metrics: TextMetricsProvider,
    factory: LayoutNodeFactory,
  ): BlockLayoutNode {
    const placement = this.resolveAvailableSegment(
      normalFlowY,
      BlockLayoutNode.resolveClear(element),
      containing,
      activeFloats,
    );
    const y = placement.y;

    const floatContaining = new Box();
    floatContaining.left = placement.left;
    floatContaining.top = containing.top;
    floatContaining.width = Math.max(0, placement.right - placement.left);
    floatContaining.height = containing.height;

    const child = factory.createBlock(element, this);
    child.layout(floatContaining, y, metrics, factory);

    if (side === 'right') {
      const marginWidth = child.box.outerBox.width + child.box.margin.width;
      const desiredMarginLeft = placement.right - marginWidth;
      const currentMarginLeft = this.marginLeft(child);
      const dx = desiredMarginLeft - currentMarginLeft;
      if (dx !== 0) {
        this.shiftSubtree(child, dx, 0);
      }
    }

    const rect = {
      left: this.marginLeft(child),
      right: this.marginRight(child),
      top: this.marginTop(child),
      bottom: this.marginBottom(child),
      side,
      domNode: child.domNode,
    };
    activeFloats.addFloat(rect);
    localFloats.addFloat(rect);

    return child;
  }

  private cloneFloatManager(floatManager: FloatManager): FloatManager {
    const clone = new FloatManager();
    clone.importRects(floatManager.snapshot());
    return clone;
  }

  private canCollapseWithParentTop(clear: ClearValue, hasInFlowContent: boolean): boolean {
    if (clear !== 'none') {
      return false;
    }
    if (hasInFlowContent) {
      return false;
    }
    if (this.box.border.top !== 0 || this.box.padding.top !== 0) {
      return false;
    }
    return true;
  }

  private canCollapseWithParentBottom(resolved: BlockBoxResolveResult): boolean {
    if (resolved.contentHeight != null) {
      return false;
    }
    if (this.box.border.bottom !== 0 || this.box.padding.bottom !== 0) {
      return false;
    }
    return true;
  }

  layout(
    containing: Box,
    flowTop: number,
    metrics: TextMetricsProvider,
    factory: LayoutNodeFactory,
    intrudingFloats: FloatManager | null = null,
  ): void {
    const resolved = this.buildBox(containing, flowTop);
    this.children = [];

    const childContaining = new Box();
    childContaining.left = this.box.innerBox.left;
    childContaining.top = this.box.innerBox.top;
    childContaining.width = this.box.contentWidth;
    childContaining.height = containing.height;

    const localFloats = new FloatManager();
    const activeFloats = new FloatManager();
    if (intrudingFloats != null && !intrudingFloats.isEmpty()) {
      activeFloats.importRects(intrudingFloats.snapshot());
    }

    const walker = new LayoutWalker(this.domNode);
    const activeInlineStack: Element[] = [];
    let normalFlowY = this.box.innerBox.top;
    let normalFlowBottom = this.box.innerBox.top;
    let hasPreviousInFlowBlock = false;
    let previousInFlowBlockMarginBottom = 0;
    let hasInFlowContent = false;

    while (true) {
      activeFloats.pruneAbove(normalFlowY);
      localFloats.pruneAbove(normalFlowY);
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

        const floatSide = BlockLayoutNode.resolveFloat(item.element);
        if (floatSide !== 'none' && (display === 'block' || display === 'inline-block')) {
          const floatNode = this.placeFloat(
            item.element,
            floatSide,
            childContaining,
            normalFlowY,
            activeFloats,
            localFloats,
            metrics,
            factory,
          );
          this.children.push(floatNode);
          walker.consume(false);
          continue;
        }

        if (display === 'block') {
          const clear = BlockLayoutNode.resolveClear(item.element);
          const marginTop = BlockLayoutNode.resolveMarginTop(
            item.element,
            childContaining.width,
          );
          const clearY = activeFloats.clearY(normalFlowY, clear);
          const collapseWithParentTop =
            !hasPreviousInFlowBlock &&
            this.canCollapseWithParentTop(clear, hasInFlowContent) &&
            localFloats.isEmpty() &&
            this.children.length === 0;
          let childFlowTop = clearY;
          if (collapseWithParentTop) {
            childFlowTop = clearY - marginTop;
          } else if (clear === 'none' && hasPreviousInFlowBlock) {
            const collapsedMargin = BlockLayoutNode.collapseMargins(
              previousInFlowBlockMarginBottom,
              marginTop,
            );
            childFlowTop =
              clearY - previousInFlowBlockMarginBottom + collapsedMargin - marginTop;
          }

          const child = factory.createBlock(item.element, this);
          child.layout(
            childContaining,
            childFlowTop,
            metrics,
            factory,
            this.cloneFloatManager(activeFloats),
          );

          if (collapseWithParentTop) {
            const collapsedTopMargin = BlockLayoutNode.collapseMargins(
              this.box.margin.top,
              marginTop,
            );
            const delta = collapsedTopMargin - this.box.margin.top;
            if (delta !== 0) {
              this.shiftSubtree(this, 0, delta);
              this.shiftSubtree(child, 0, delta);
              childContaining.top += delta;
              normalFlowY += delta;
              normalFlowBottom += delta;
            }
            this.box.margin.top = collapsedTopMargin;
          }

          this.children.push(child);
          normalFlowY = this.marginBottom(child);
          normalFlowBottom = normalFlowY;
          hasPreviousInFlowBlock = true;
          previousInFlowBlockMarginBottom = child.box.margin.bottom;
          hasInFlowContent = true;
          walker.consume(false);
          continue;
        }
      }

      const inlineNode = factory.createInlineBox(
        this.domNode,
        this,
        childContaining.left,
        normalFlowY,
        childContaining.width,
      );
      const produced = inlineNode.layoutSegment(
        walker,
        childContaining,
        normalFlowY,
        activeInlineStack,
        metrics,
        factory,
        this.cloneFloatManager(activeFloats),
      );
      if (!produced) {
        const next = walker.peek();
        if (
          next != null &&
          next.type === 'start' &&
          BlockLayoutNode.resolveDisplay(next.element) === 'block'
        ) {
          continue;
        }
        walker.consume(true);
        continue;
      }
      this.children.push(inlineNode);
      normalFlowY =
        inlineNode.box.outerBox.top +
        inlineNode.box.outerBox.height +
        inlineNode.box.margin.bottom;
      normalFlowBottom = normalFlowY;
      hasPreviousInFlowBlock = false;
      previousInFlowBlockMarginBottom = 0;
      hasInFlowContent = true;
    }

    if (hasPreviousInFlowBlock && this.canCollapseWithParentBottom(resolved)) {
      const collapsedBottomMargin = BlockLayoutNode.collapseMargins(
        this.box.margin.bottom,
        previousInFlowBlockMarginBottom,
      );
      this.box.margin.bottom = collapsedBottomMargin;
      normalFlowBottom -= previousInFlowBlockMarginBottom;
    }

    const deepestFloatBottom = localFloats.deepestBottom();
    const bottom = Math.max(normalFlowBottom, deepestFloatBottom);
    const contentHeight = Math.max(0, bottom - this.box.innerBox.top);
    this.finalizeHeight(resolved, contentHeight);
  }

  getChildren(): LayoutNode[] {
    return this.children;
  }
}
