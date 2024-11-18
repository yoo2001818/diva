import { Document } from '../dom/Document';
import { Box } from '../layout/Box';
import { StyleData } from '../layout/StyleData';

export class CanvasRenderer {
  doc: Document;
  canvas: HTMLCanvasElement;

  constructor(doc: Document, canvas: HTMLCanvasElement) {
    this.doc = doc;
    this.canvas = canvas;
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
    styleData.boxes.forEach((box) => {
      // ...
    });
    styleData.children.forEach((child) => {
      this._renderStyle(child);
    });
  }
}
