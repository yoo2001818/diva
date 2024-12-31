import { Document } from '../dom/Document';
import { Box } from '../layout/Box';
import { StyleData } from '../layout/StyleData';
import { mapColor } from './color';

export class CanvasRenderer {
  doc: Document;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(doc: Document, canvas: HTMLCanvasElement) {
    this.doc = doc;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  layout(): void {
    const body = this.doc.firstElementChild;
    if (body == null) {
      return;
    }
    const box = new Box();
    box.top = 0;
    box.left = 0;
    box.width = this.canvas.width;
    box.height = this.canvas.height;
    body.styleData.layout(box);
  }

  render(): void {
    const body = this.doc.firstElementChild;
    if (body == null) {
      return;
    }
    const box = new Box();
    box.top = 0;
    box.left = 0;
    box.width = this.canvas.width;
    box.height = this.canvas.height;
    this._renderStyle(body.styleData, box);
  }

  _renderStyle(styleData: StyleData, containingBox: Box): void {
    const ctx = this.ctx;
    styleData.boxes.forEach((box) => {
      const absoluteTop = box.outerBox.top + containingBox.top;
      const absoluteLeft = box.outerBox.left + containingBox.left;
      // Draw borders
      ctx.fillStyle = mapColor(box.borderTopStyle.color);
      ctx.fillRect(absoluteTop, absoluteLeft, box.clientWidth, box.border.top);
      ctx.fillStyle = mapColor(box.borderLeftStyle.color);
      ctx.fillRect(
        absoluteLeft,
        absoluteTop,
        box.border.left,
        box.clientHeight,
      );
      ctx.fillStyle = mapColor(box.borderRightStyle.color);
      ctx.fillRect(
        absoluteLeft + box.clientWidth - box.border.right,
        absoluteTop,
        box.border.right,
        box.clientHeight,
      );
      ctx.fillStyle = mapColor(box.borderBottomStyle.color);
      ctx.fillRect(
        absoluteLeft,
        absoluteTop + box.clientHeight - box.border.bottom,
        box.clientWidth,
        box.border.bottom,
      );
      // Draw background
      ctx.fillStyle = mapColor(box.background.color);
      ctx.fillRect(
        absoluteLeft + box.border.left,
        absoluteTop + box.border.top,
        box.clientWidth - box.border.width,
        box.clientHeight - box.border.height,
      );
    });
    const childContainingBox = new Box();
    childContainingBox.top =
      containingBox.top +
      styleData.principalBox.outerBox.top +
      styleData.principalBox.border.top;
    childContainingBox.left =
      containingBox.left +
      styleData.principalBox.outerBox.left +
      styleData.principalBox.border.left;
    styleData.children.forEach((child) => {
      this._renderStyle(child, childContainingBox);
    });
  }
}
