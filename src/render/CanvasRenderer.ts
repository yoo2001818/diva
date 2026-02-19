import { Document } from '../dom/Document';
import { CSSBorderStyle, CSSColor, CSSKeyword, CSSLength } from '../cssom/dict';
import { Element } from '../dom/Element';
import { LayoutEngine } from '../layout/LayoutEngine';
import { LayoutDocument } from '../layout/LayoutDocument';
import { LayoutBox } from '../layout/Box';
import { BlockLayoutNode } from '../layout/nodes/BlockLayoutNode';
import { InlineBoxLayoutNode } from '../layout/nodes/InlineBoxLayoutNode';
import { InlineBlockLayoutNode } from '../layout/nodes/InlineBlockLayoutNode';
import {
  LineBoxLayoutNode,
  LineItemLayoutNode,
} from '../layout/nodes/LineBoxLayoutNode';
import {
  InlineEndMarkerLayoutNode,
  InlineStartMarkerLayoutNode,
} from '../layout/nodes/InlineMarkerLayoutNode';
import { TextRunLayoutNode } from '../layout/nodes/TextRunLayoutNode';
import { mapColor } from './color';
import { resolveTextPaintInstruction } from './text';

export class CanvasRenderer {
  doc: Document;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  layoutEngine: LayoutEngine;
  layoutDocument: LayoutDocument | null = null;

  constructor(doc: Document, canvas: HTMLCanvasElement) {
    this.doc = doc;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.layoutEngine = new LayoutEngine();
  }

  layout(): void {
    const root = this.doc.firstElementChild;
    if (root == null) {
      this.layoutDocument = null;
      return;
    }
    this.layoutDocument = this.layoutEngine.layout(root, {
      width: this.canvas.width,
      height: this.canvas.height,
    });
  }

  render(): void {
    if (this.layoutDocument == null || this.layoutDocument.root == null) {
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderBlock(this.layoutDocument.root);
  }

  private drawBox(box: LayoutBox): void {
    const ctx = this.ctx;
    const x = box.outerBox.left;
    const y = box.outerBox.top;
    const width = box.outerBox.width;
    const height = box.outerBox.height;

    if (box.border.top > 0) {
      ctx.fillStyle = mapColor(box.borderTopStyle.color);
      ctx.fillRect(x, y, width, box.border.top);
    }
    if (box.border.left > 0) {
      ctx.fillStyle = mapColor(box.borderLeftStyle.color);
      ctx.fillRect(x, y, box.border.left, height);
    }
    if (box.border.right > 0) {
      ctx.fillStyle = mapColor(box.borderRightStyle.color);
      ctx.fillRect(x + width - box.border.right, y, box.border.right, height);
    }
    if (box.border.bottom > 0) {
      ctx.fillStyle = mapColor(box.borderBottomStyle.color);
      ctx.fillRect(x, y + height - box.border.bottom, width, box.border.bottom);
    }

    const innerWidth = width - box.border.width;
    const innerHeight = height - box.border.height;
    if (innerWidth > 0 && innerHeight > 0) {
      ctx.fillStyle = mapColor(box.background.color);
      ctx.fillRect(
        x + box.border.left,
        y + box.border.top,
        innerWidth,
        innerHeight,
      );
    }
  }

  private resolveBorderWidth(
    styleSource: Element,
    side:
      | 'top'
      | 'right'
      | 'bottom'
      | 'left',
  ): number {
    const style = styleSource._computedStyle;
    const styleKey =
      side === 'top'
        ? 'borderTopStyle'
        : side === 'right'
          ? 'borderRightStyle'
          : side === 'bottom'
            ? 'borderBottomStyle'
            : 'borderLeftStyle';
    const widthKey =
      side === 'top'
        ? 'borderTopWidth'
        : side === 'right'
          ? 'borderRightWidth'
          : side === 'bottom'
            ? 'borderBottomWidth'
            : 'borderLeftWidth';
    const borderStyle = style.get(styleKey) as CSSBorderStyle;
    if (borderStyle.type === 'none' || borderStyle.type === 'hidden') {
      return 0;
    }
    const width = style.get(widthKey) as CSSLength | CSSKeyword<string>;
    if ('value' in width) {
      return width.value;
    }
    switch (width.type) {
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

  private drawInlineDecoration(
    x: number,
    y: number,
    width: number,
    height: number,
    styleSource: Element,
    sides: { top: boolean; right: boolean; bottom: boolean; left: boolean },
  ): void {
    if (width <= 0 || height <= 0) {
      return;
    }
    const style = styleSource._computedStyle;
    const backgroundColor = style.get('backgroundColor') as CSSColor;
    const borderTopColor = style.get('borderTopColor') as CSSColor;
    const borderRightColor = style.get('borderRightColor') as CSSColor;
    const borderBottomColor = style.get('borderBottomColor') as CSSColor;
    const borderLeftColor = style.get('borderLeftColor') as CSSColor;

    this.ctx.fillStyle = mapColor(backgroundColor);
    this.ctx.fillRect(x, y, width, height);

    const top = this.resolveBorderWidth(styleSource, 'top');
    const right = this.resolveBorderWidth(styleSource, 'right');
    const bottom = this.resolveBorderWidth(styleSource, 'bottom');
    const left = this.resolveBorderWidth(styleSource, 'left');

    if (sides.top && top > 0) {
      this.ctx.fillStyle = mapColor(borderTopColor);
      this.ctx.fillRect(x, y - top, width, top);
    }
    if (sides.right && right > 0) {
      this.ctx.fillStyle = mapColor(borderRightColor);
      this.ctx.fillRect(x + width - right, y, right, height);
    }
    if (sides.bottom && bottom > 0) {
      this.ctx.fillStyle = mapColor(borderBottomColor);
      this.ctx.fillRect(x, y + height, width, bottom);
    }
    if (sides.left && left > 0) {
      this.ctx.fillStyle = mapColor(borderLeftColor);
      this.ctx.fillRect(x, y, left, height);
    }
  }

  private isInlineDecorationElement(styleSource: Element): boolean {
    return BlockLayoutNode.resolveDisplay(styleSource) === 'inline';
  }

  private resolveTextDecorationSources(node: TextRunLayoutNode): Element[] {
    const sources: Element[] = [];
    for (let i = 0; i < node.inlineStack.length; i += 1) {
      const candidate = node.inlineStack[i];
      if (this.isInlineDecorationElement(candidate)) {
        sources.push(candidate);
      }
    }
    return sources;
  }

  private renderBlock(node: BlockLayoutNode): void {
    this.drawBox(node.box);
    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      if (child instanceof BlockLayoutNode) {
        this.renderBlock(child);
      } else {
        this.renderInlineBox(child);
      }
    }
  }

  private renderInlineBox(node: InlineBoxLayoutNode): void {
    this.drawBox(node.box);
    for (let i = 0; i < node.children.length; i += 1) {
      this.renderLineBox(node.children[i]);
    }
  }

  private renderLineBox(node: LineBoxLayoutNode): void {
    for (let i = 0; i < node.children.length; i += 1) {
      this.renderInlineItem(node.children[i]);
    }
  }

  private renderInlineItem(node: LineItemLayoutNode): void {
    if (node instanceof InlineBlockLayoutNode) {
      this.renderInlineBlock(node);
      return;
    }
    if (node instanceof TextRunLayoutNode) {
      const decorationSources = this.resolveTextDecorationSources(node);
      for (let i = 0; i < decorationSources.length; i += 1) {
        this.drawInlineDecoration(
          node.box.outerBox.left,
          node.box.outerBox.top,
          node.box.outerBox.width,
          node.box.outerBox.height,
          decorationSources[i],
          { top: true, right: false, bottom: true, left: false },
        );
      }
      const text = resolveTextPaintInstruction(node);
      this.ctx.font = text.font;
      this.ctx.fillStyle = text.fillStyle;
      this.ctx.textBaseline = 'alphabetic';
      this.ctx.fillText(text.text, text.x, text.y);
      return;
    }
    if (node instanceof InlineStartMarkerLayoutNode) {
      if (this.isInlineDecorationElement(node.domNode)) {
        this.drawInlineDecoration(
          node.box.outerBox.left,
          node.box.outerBox.top,
          node.box.outerBox.width,
          node.box.outerBox.height,
          node.domNode,
          { top: true, right: false, bottom: true, left: true },
        );
      }
      return;
    }
    if (node instanceof InlineEndMarkerLayoutNode) {
      if (this.isInlineDecorationElement(node.domNode)) {
        this.drawInlineDecoration(
          node.box.outerBox.left,
          node.box.outerBox.top,
          node.box.outerBox.width,
          node.box.outerBox.height,
          node.domNode,
          { top: true, right: true, bottom: true, left: false },
        );
      }
      return;
    }
  }

  private renderInlineBlock(node: InlineBlockLayoutNode): void {
    this.drawBox(node.box);
    if (node.block == null) {
      return;
    }
    for (let i = 0; i < node.block.children.length; i += 1) {
      const child = node.block.children[i];
      if (child instanceof BlockLayoutNode) {
        this.renderBlock(child);
      } else {
        this.renderInlineBox(child);
      }
    }
  }
}
