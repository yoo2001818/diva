import {
  CSSPercentage,
  CSSVerticalAlign,
} from '../../cssom/dict';
import { Element } from '../../dom/Element';
import { Box } from '../Box';
import { buildFontDeclaration } from '../Font';
import { LayoutDocument } from '../LayoutDocument';
import { LayoutWalker } from '../LayoutWalker';
import { TextMetricsProvider } from '../TextMetrics';
import { BlockLayoutNode } from './BlockLayoutNode';
import { FloatManager } from './FloatManager';
import { InlineBlockLayoutNode } from './InlineBlockLayoutNode';
import {
  InlineEndMarkerLayoutNode,
  InlineStartMarkerLayoutNode,
} from './InlineMarkerLayoutNode';
import { LineBoxLayoutNode, LineItemLayoutNode } from './LineBoxLayoutNode';
import { LayoutNode } from './LayoutNode';
import { TextRunLayoutNode } from './TextRunLayoutNode';
import type { LayoutNodeFactory } from './LayoutNodeFactory';
import { tokenizeText, WhiteSpaceMode } from './TextTokenizer';

type ResolvedVerticalAlign =
  | { type: 'baseline' }
  | { type: 'top' }
  | { type: 'bottom' }
  | { type: 'middle' }
  | { type: 'text-top' }
  | { type: 'text-bottom' }
  | { type: 'sub' }
  | { type: 'super' }
  | { type: 'length'; value: number }
  | { type: 'percentage'; value: number };

interface InlineStrut {
  lineHeight: number;
  fontSize: number;
  baselineOffset: number;
  textTopOffset: number;
  textBottomOffset: number;
}

interface LineItemDescriptor {
  node: LineItemLayoutNode;
  kind: 'text' | 'inline-block' | 'marker';
  blockSize: number;
  baselineOffset: number;
  verticalAlign: ResolvedVerticalAlign;
  fontSize: number;
  lineHeight: number;
  top: number;
}

interface MeasuredText {
  width: number;
  height: number;
  ascent: number;
  descent: number;
  fontSize: number;
  lineHeight: number;
}

interface FontMetrics {
  fontSize: number;
  lineHeight: number;
  font: string;
  ascent: number;
  descent: number;
  height: number;
}

export class InlineBoxLayoutNode extends LayoutNode {
  readonly domNode: Element;
  children: LineBoxLayoutNode[] = [];
  private fontMetricsCache: WeakMap<Element, FontMetrics> = new WeakMap();

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

  private resolveWhiteSpaceMode(styleSource: Element): WhiteSpaceMode {
    const value = styleSource._computedStyle.get('whiteSpace').type;
    switch (value) {
      case 'nowrap':
        return 'nowrap';
      case 'pre':
        return 'pre';
      case 'normal':
      default:
        return 'normal';
    }
  }

  private resolveVerticalAlign(styleSource: Element): ResolvedVerticalAlign {
    const value = styleSource._computedStyle.get('verticalAlign') as CSSVerticalAlign;
    switch (value.type) {
      case 'top':
      case 'bottom':
      case 'middle':
      case 'text-top':
      case 'text-bottom':
      case 'sub':
      case 'super':
      case 'baseline':
        return { type: value.type };
      case 'length':
        return { type: 'length', value: value.value };
      case 'percentage':
        return { type: 'percentage', value: value.value };
      default:
        return { type: 'baseline' };
    }
  }

  private resolveTextStyleMetrics(styleSource: Element): {
    fontSize: number;
    lineHeight: number;
    font: string;
  } {
    const font = buildFontDeclaration(styleSource._computedStyle);
    const lineHeight = BlockLayoutNode.resolveLineHeight(
      styleSource._computedStyle,
      font.fontSize,
    );
    return {
      fontSize: font.fontSize,
      lineHeight,
      font: font.font,
    };
  }

  private resolveFontMetrics(
    styleSource: Element,
    metrics: TextMetricsProvider,
  ): FontMetrics {
    const cached = this.fontMetricsCache.get(styleSource);
    if (cached != null) {
      return cached;
    }

    const styleMetrics = this.resolveTextStyleMetrics(styleSource);
    const measured = metrics.measure({
      text: 'Mg',
      fontSize: styleMetrics.fontSize,
      lineHeight: styleMetrics.lineHeight,
      font: styleMetrics.font,
    });
    const ascent =
      Number.isFinite(measured.ascent) && measured.ascent > 0
        ? measured.ascent
        : styleMetrics.fontSize * 0.8;
    const descent =
      Number.isFinite(measured.descent) && measured.descent >= 0
        ? measured.descent
        : styleMetrics.fontSize * 0.2;
    const height = Math.max(styleMetrics.lineHeight, ascent + descent);

    const resolved: FontMetrics = {
      fontSize: styleMetrics.fontSize,
      lineHeight: styleMetrics.lineHeight,
      font: styleMetrics.font,
      ascent,
      descent,
      height,
    };
    this.fontMetricsCache.set(styleSource, resolved);
    return resolved;
  }

  private measureText(
    text: string,
    styleSource: Element,
    metrics: TextMetricsProvider,
  ): MeasuredText {
    const fontMetrics = this.resolveFontMetrics(styleSource, metrics);
    const measured = metrics.measure({
      text,
      fontSize: fontMetrics.fontSize,
      lineHeight: fontMetrics.lineHeight,
      font: fontMetrics.font,
    });
    return {
      width: measured.width,
      height: fontMetrics.height,
      ascent: fontMetrics.ascent,
      descent: fontMetrics.descent,
      fontSize: fontMetrics.fontSize,
      lineHeight: fontMetrics.lineHeight,
    };
  }

  private resolveLineStrut(metrics: TextMetricsProvider): InlineStrut {
    const fontMetrics = this.resolveFontMetrics(this.domNode, metrics);
    const glyphHeight = fontMetrics.ascent + fontMetrics.descent;
    const leading = Math.max(0, fontMetrics.lineHeight - glyphHeight);
    const baselineOffset = leading / 2 + fontMetrics.ascent;
    return {
      lineHeight: fontMetrics.lineHeight,
      fontSize: fontMetrics.fontSize,
      baselineOffset,
      textTopOffset: baselineOffset - fontMetrics.ascent,
      textBottomOffset: baselineOffset + fontMetrics.descent,
    };
  }

  private resolveItemStyleSource(item: LineItemLayoutNode): Element {
    if (item instanceof TextRunLayoutNode) {
      return item.inlineStack[item.inlineStack.length - 1] ?? this.domNode;
    }
    if (item instanceof InlineBlockLayoutNode) {
      return item.domNode;
    }
    if (item instanceof InlineStartMarkerLayoutNode || item instanceof InlineEndMarkerLayoutNode) {
      return item.domNode;
    }
    return this.domNode;
  }

  private findLastLineBox(node: LayoutNode | null): LineBoxLayoutNode | null {
    if (node == null) {
      return null;
    }
    if (node instanceof LineBoxLayoutNode) {
      return node;
    }
    const children = node.getChildren();
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const found = this.findLastLineBox(children[i]);
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  private resolveInlineBlockBaselineOffset(node: InlineBlockLayoutNode): number {
    const marginTop = node.box.margin.top;
    const lastLine = this.findLastLineBox(node.block);
    if (lastLine == null) {
      return marginTop + node.box.outerBox.height;
    }
    const lineTopOffset = lastLine.box.outerBox.top - node.box.outerBox.top;
    return marginTop + lineTopOffset + lastLine.baselineOffset;
  }

  private shiftSubtreeY(node: LayoutNode, dy: number): void {
    if (dy === 0) {
      return;
    }
    node.box.outerBox.top += dy;
    node.box.scrollBox.top += dy;
    node.box.innerBox.top += dy;
    const children = node.getChildren();
    for (let i = 0; i < children.length; i += 1) {
      this.shiftSubtreeY(children[i], dy);
    }
  }

  private resolvePercentageShift(value: CSSPercentage, lineHeight: number): number {
    return lineHeight * (value.value / 100);
  }

  private resolveItemTop(
    descriptor: LineItemDescriptor,
    lineTop: number,
    lineHeight: number,
    baselineY: number,
    strut: InlineStrut,
  ): number {
    switch (descriptor.verticalAlign.type) {
      case 'top':
        return lineTop;
      case 'bottom':
        return lineTop + lineHeight - descriptor.blockSize;
      case 'middle': {
        const xHeightApprox = strut.fontSize * 0.5;
        const targetMiddle = baselineY + xHeightApprox / 2;
        return targetMiddle - descriptor.blockSize / 2;
      }
      case 'text-top':
        return lineTop + strut.textTopOffset;
      case 'text-bottom':
        return lineTop + strut.textBottomOffset - descriptor.blockSize;
      case 'sub':
        return baselineY - descriptor.baselineOffset + descriptor.fontSize * 0.2;
      case 'super':
        return baselineY - descriptor.baselineOffset - descriptor.fontSize * 0.2;
      case 'length':
        return baselineY - descriptor.baselineOffset - descriptor.verticalAlign.value;
      case 'percentage': {
        const shift = this.resolvePercentageShift(
          { type: 'percentage', value: descriptor.verticalAlign.value },
          descriptor.lineHeight,
        );
        return baselineY - descriptor.baselineOffset - shift;
      }
      case 'baseline':
      default:
        return baselineY - descriptor.baselineOffset;
    }
  }

  private applyLineAlignment(
    line: LineBoxLayoutNode,
    y: number,
    fallbackLineHeight: number,
    metrics: TextMetricsProvider,
  ): number {
    const strut = this.resolveLineStrut(metrics);
    const descriptors: LineItemDescriptor[] = [];
    let maxItemBlockSize = 0;

    for (let i = 0; i < line.children.length; i += 1) {
      const item = line.children[i];
      const styleSource = this.resolveItemStyleSource(item);
      const styleMetrics = this.resolveTextStyleMetrics(styleSource);
      if (item instanceof TextRunLayoutNode) {
        const ascent = item.ascent ?? styleMetrics.fontSize * 0.8;
        const descent = item.descent ?? styleMetrics.fontSize * 0.2;
        const glyphHeight = ascent + descent;
        const blockSize = Math.max(item.box.outerBox.height, glyphHeight);
        const leading = Math.max(0, blockSize - glyphHeight);
        descriptors.push({
          node: item,
          kind: 'text',
          blockSize,
          baselineOffset: leading / 2 + ascent,
          verticalAlign: this.resolveVerticalAlign(styleSource),
          fontSize: styleMetrics.fontSize,
          lineHeight: styleMetrics.lineHeight,
          top: y,
        });
        maxItemBlockSize = Math.max(maxItemBlockSize, blockSize);
        continue;
      }

      if (item instanceof InlineBlockLayoutNode) {
        const blockSize = item.box.outerBox.height + item.box.margin.height;
        descriptors.push({
          node: item,
          kind: 'inline-block',
          blockSize,
          baselineOffset: this.resolveInlineBlockBaselineOffset(item),
          verticalAlign: this.resolveVerticalAlign(styleSource),
          fontSize: styleMetrics.fontSize,
          lineHeight: styleMetrics.lineHeight,
          top: y,
        });
        maxItemBlockSize = Math.max(maxItemBlockSize, blockSize);
        continue;
      }

      descriptors.push({
        node: item,
        kind: 'marker',
        blockSize: 0,
        baselineOffset: 0,
        verticalAlign: { type: 'baseline' },
        fontSize: styleMetrics.fontSize,
        lineHeight: styleMetrics.lineHeight,
        top: y,
      });
    }

    const baseLineHeight = Math.max(strut.lineHeight, maxItemBlockSize, fallbackLineHeight);
    let topExtra = 0;
    let bottomExtra = 0;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const lineHeight = baseLineHeight + topExtra + bottomExtra;
      const baselineY = y + strut.baselineOffset + topExtra;
      let minTop = y;
      let maxBottom = y + lineHeight;

      for (let i = 0; i < descriptors.length; i += 1) {
        const descriptor = descriptors[i];
        const top = this.resolveItemTop(descriptor, y, lineHeight, baselineY, strut);
        descriptor.top = top;
        const bottom = top + descriptor.blockSize;
        minTop = Math.min(minTop, top);
        maxBottom = Math.max(maxBottom, bottom);
      }

      const neededTop = Math.max(0, y - minTop);
      const neededBottom = Math.max(0, maxBottom - (y + lineHeight));
      if (neededTop <= topExtra && neededBottom <= bottomExtra) {
        break;
      }
      topExtra = Math.max(topExtra, neededTop);
      bottomExtra = Math.max(bottomExtra, neededBottom);
    }

    const finalLineHeight = baseLineHeight + topExtra + bottomExtra;
    const finalBaselineOffset = strut.baselineOffset + topExtra;
    const finalBaselineY = y + finalBaselineOffset;

    for (let i = 0; i < descriptors.length; i += 1) {
      const descriptor = descriptors[i];
      const top = this.resolveItemTop(
        descriptor,
        y,
        finalLineHeight,
        finalBaselineY,
        strut,
      );
      descriptor.top = top;

      if (descriptor.node instanceof InlineBlockLayoutNode) {
        const currentMarginTop =
          descriptor.node.box.outerBox.top - descriptor.node.box.margin.top;
        const dy = top - currentMarginTop;
        this.shiftSubtreeY(descriptor.node, dy);
        continue;
      }

      descriptor.node.box.outerBox.top = top;
      descriptor.node.box.scrollBox.top = top;
      descriptor.node.box.innerBox.top = top;

      if (descriptor.kind === 'text') {
        descriptor.node.box.outerBox.height = descriptor.blockSize;
        descriptor.node.box.scrollBox.height = descriptor.blockSize;
        descriptor.node.box.innerBox.height = descriptor.blockSize;
      }
    }

    line.baselineOffset = finalBaselineOffset;
    line.box.outerBox.height = finalLineHeight;
    line.box.scrollBox.height = finalLineHeight;
    line.box.innerBox.height = finalLineHeight;
    return finalLineHeight;
  }

  layoutSegment(
    walker: LayoutWalker,
    containing: Box,
    flowTop: number,
    activeInlineStack: Element[],
    metrics: TextMetricsProvider,
    factory: LayoutNodeFactory,
    floatManager: FloatManager,
  ): boolean {
    this.children = [];
    this.fontMetricsCache = new WeakMap();

    let y = flowTop;
    let producedAny = false;

    while (true) {
      floatManager.pruneAbove(y);

      let segment = floatManager.lineSegmentAt(
        y,
        containing.left,
        containing.left + containing.width,
      );
      while (segment.right <= segment.left) {
        const nextY = floatManager.nextY(y);
        if (nextY == null || nextY <= y) {
          break;
        }
        y = nextY;
        segment = floatManager.lineSegmentAt(
          y,
          containing.left,
          containing.left + containing.width,
        );
      }

      const line = factory.createLineBox(
        this.domNode,
        this,
        segment.left,
        y,
        Math.max(0, segment.right - segment.left),
      );

      const items = line.children;
      const lineStartX = segment.left;
      let x = lineStartX;
      let maxItemHeight = 0;
      let touchedLine = false;
      let boundaryTriggered = false;
      let endOfStream = false;
      let wrapTriggered = false;
      let forcedBreak = false;

      if (activeInlineStack.length > 0) {
        for (let i = 0; i < activeInlineStack.length; i += 1) {
          items.push(
            factory.createInlineStartMarker(
              activeInlineStack[i],
              line,
              [...activeInlineStack],
              true,
              x,
              y,
            ),
          );
        }
      }

      while (true) {
        const item = walker.peek();
        if (item == null) {
          endOfStream = true;
          break;
        }

        if (item.type === 'start') {
          const display = BlockLayoutNode.resolveDisplay(item.element);
          if (display === 'none') {
            walker.consume(false);
            continue;
          }
          if (display === 'block') {
            boundaryTriggered = true;
            break;
          }

          if (display === 'inline') {
            activeInlineStack.push(item.element);
            items.push(
              factory.createInlineStartMarker(
                item.element,
                line,
                [...activeInlineStack],
                false,
                x,
                y,
              ),
            );
            touchedLine = true;
            walker.consume(true);
            continue;
          }

          if (display === 'inline-block') {
            const styleSource =
              activeInlineStack[activeInlineStack.length - 1] ?? this.domNode;
            const whiteSpaceMode = this.resolveWhiteSpaceMode(styleSource);
            const wrapAllowed = whiteSpaceMode === 'normal';

            const inlineContaining = new Box();
            inlineContaining.left = x;
            inlineContaining.top = y;
            inlineContaining.width = Math.max(0, segment.right - x);
            inlineContaining.height = containing.height;

            const inlineBlock = factory.createInlineBlock(
              item.element,
              line,
              [...activeInlineStack],
            );
            inlineBlock.layoutAtomic(inlineContaining, y, metrics, factory);
            const blockWidth =
              inlineBlock.box.outerBox.width + inlineBlock.box.margin.width;

            if (wrapAllowed && x > lineStartX && x + blockWidth > segment.right) {
              wrapTriggered = true;
              break;
            }

            items.push(inlineBlock);
            x += blockWidth;
            maxItemHeight = Math.max(
              maxItemHeight,
              inlineBlock.box.outerBox.height + inlineBlock.box.margin.height,
            );
            touchedLine = true;
            walker.consume(false);
            continue;
          }
        }

        if (item.type === 'end') {
          if (activeInlineStack.includes(item.element)) {
            items.push(
              factory.createInlineEndMarker(
                item.element,
                line,
                [...activeInlineStack],
                false,
                x,
                y,
              ),
            );
            const index = activeInlineStack.lastIndexOf(item.element);
            if (index !== -1) {
              activeInlineStack.splice(index, activeInlineStack.length - index);
            }
            touchedLine = true;
          }
          walker.consume(true);
          continue;
        }

        if (item.type === 'text') {
          const styleSource =
            activeInlineStack[activeInlineStack.length - 1] ?? this.domNode;
          const whiteSpaceMode = this.resolveWhiteSpaceMode(styleSource);
          const remainingText = item.text.data.slice(item.index);
          const tokens = tokenizeText(remainingText, whiteSpaceMode);
          const wrapAllowed = whiteSpaceMode === 'normal';

          if (tokens.length === 0) {
            walker.consumeText(remainingText.length);
            continue;
          }

          let consumedLength = 0;

          for (let i = 0; i < tokens.length; i += 1) {
            const token = tokens[i];

            if (token.type === 'newline') {
              consumedLength += token.sourceLength;
              walker.consumeText(consumedLength);
              consumedLength = 0;
              forcedBreak = true;
              touchedLine = true;
              break;
            }

            if (wrapAllowed && token.type === 'space' && x === lineStartX) {
              consumedLength += token.sourceLength;
              continue;
            }

            const measured = this.measureText(token.text, styleSource, metrics);
            if (wrapAllowed && x > lineStartX && x + measured.width > segment.right) {
              wrapTriggered = true;
              break;
            }

            const run = factory.createTextRun(
              item.text,
              line,
              token.text,
              [...activeInlineStack],
              x,
              y,
            );
            run.box.outerBox.width = measured.width;
            run.box.scrollBox.width = measured.width;
            run.box.innerBox.width = measured.width;
            run.box.outerBox.height = measured.height;
            run.box.scrollBox.height = measured.height;
            run.box.innerBox.height = measured.height;
            run.ascent = measured.ascent;
            run.descent = measured.descent;
            run.fontSize = measured.fontSize;

            items.push(run);
            x += measured.width;
            maxItemHeight = Math.max(maxItemHeight, measured.height);
            touchedLine = true;
            consumedLength += token.sourceLength;
          }

          if (consumedLength > 0) {
            walker.consumeText(consumedLength);
          }

          if (forcedBreak || wrapTriggered) {
            break;
          }
          continue;
        }
      }

      if (!touchedLine && !forcedBreak) {
        if (boundaryTriggered || endOfStream) {
          break;
        }
        if (wrapTriggered) {
          break;
        }
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
              y,
            ),
          );
        }
      }

      const fallbackLineHeight = maxItemHeight;
      const lineHeight = this.applyLineAlignment(line, y, fallbackLineHeight, metrics);

      this.children.push(line);
      producedAny = true;

      y = line.box.outerBox.top + lineHeight;

      if (boundaryTriggered || endOfStream) {
        break;
      }
      if (forcedBreak || wrapTriggered) {
        continue;
      }
      break;
    }

    if (!producedAny) {
      this.box.outerBox.height = 0;
      this.box.scrollBox.height = 0;
      this.box.innerBox.height = 0;
      return false;
    }

    const height = Math.max(0, y - this.box.outerBox.top);
    this.box.outerBox.height = height;
    this.box.scrollBox.height = height;
    this.box.innerBox.height = height;
    return true;
  }
}
