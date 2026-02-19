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

  layout(
    containing: Box,
    flowTop: number,
    metrics: TextMetricsProvider,
    factory: LayoutNodeFactory,
  ): void {
    const resolved = this.buildBox(containing, flowTop);
    this.children = [];

    const childContaining = new Box();
    childContaining.left = this.box.innerBox.left;
    childContaining.top = this.box.innerBox.top;
    childContaining.width = this.box.contentWidth;
    childContaining.height = containing.height;

    const walker = new LayoutWalker(this.domNode);
    const activeInlineStack: Element[] = [];
    let cursorY = this.box.innerBox.top;

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
          const child = factory.createBlock(item.element, this);
          child.layout(childContaining, cursorY, metrics, factory);
          this.children.push(child);
          cursorY = child.box.outerBox.top + child.box.outerBox.height + child.box.margin.bottom;
          walker.consume(false);
          continue;
        }
      }

      const inlineNode = factory.createInlineBox(
        this.domNode,
        this,
        childContaining.left,
        cursorY,
        childContaining.width,
      );
      const produced = inlineNode.layoutSegment(
        walker,
        childContaining,
        cursorY,
        activeInlineStack,
        metrics,
        factory,
      );
      if (!produced) {
        walker.consume(true);
        continue;
      }
      this.children.push(inlineNode);
      cursorY =
        inlineNode.box.outerBox.top +
        inlineNode.box.outerBox.height +
        inlineNode.box.margin.bottom;
    }

    const contentHeight = Math.max(0, cursorY - this.box.innerBox.top);
    this.finalizeHeight(resolved, contentHeight);
  }

  getChildren(): LayoutNode[] {
    return this.children;
  }
}
