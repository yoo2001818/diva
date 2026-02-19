import { Document } from '../dom/Document';
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
      const text = resolveTextPaintInstruction(node);
      this.ctx.font = text.font;
      this.ctx.fillStyle = text.fillStyle;
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(text.text, text.x, text.y);
      return;
    }
    if (
      node instanceof InlineStartMarkerLayoutNode ||
      node instanceof InlineEndMarkerLayoutNode
    ) {
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
