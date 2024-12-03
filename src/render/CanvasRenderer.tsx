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
    this._renderStyle(body.styleData);
  }

  _renderStyle(styleData: StyleData): void {
    const ctx = this.ctx;
    styleData.boxes.forEach((box) => {
      // Draw borders
      ctx.fillStyle = mapColor(box.borderTopStyle.color);
      ctx.fillRect(
        box.offsetTop,
        box.offsetLeft,
        box.clientWidth,
        box.border.top,
      );
      ctx.fillStyle = mapColor(box.borderLeftStyle.color);
      ctx.fillRect(
        box.offsetTop,
        box.offsetLeft,
        box.border.left,
        box.clientHeight,
      );
      ctx.fillStyle = mapColor(box.borderRightStyle.color);
      ctx.fillRect(
        box.offsetTop,
        box.offsetLeft + box.clientWidth - box.border.right,
        box.border.right,
        box.clientHeight,
      );
      ctx.fillStyle = mapColor(box.borderBottomStyle.color);
      ctx.fillRect(
        box.offsetTop + box.clientHeight - box.border.bottom,
        box.offsetLeft,
        box.clientWidth,
        box.border.bottom,
      );
      // Draw background
      ctx.fillStyle = mapColor(box.background.color);
      ctx.fillRect(
        box.offsetTop,
        box.offsetLeft,
        box.clientWidth,
        box.clientHeight,
      );
    });
    styleData.children.forEach((child) => {
      this._renderStyle(child);
    });
  }
}
