import { Node } from '../../dom/Node';

export type FloatSide = 'left' | 'right';
export type ClearValue = 'none' | 'left' | 'right' | 'both';

export interface FloatRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  side: FloatSide;
  domNode: Node;
}

export class FloatManager {
  private floats: FloatRect[] = [];

  addFloat(rect: FloatRect): void {
    this.floats.push(rect);
  }

  importRects(rects: FloatRect[]): void {
    for (let i = 0; i < rects.length; i += 1) {
      this.floats.push({ ...rects[i] });
    }
  }

  snapshot(): FloatRect[] {
    return this.floats.map((rect) => ({ ...rect }));
  }

  isEmpty(): boolean {
    return this.floats.length === 0;
  }

  pruneAbove(y: number): void {
    this.floats = this.floats.filter((rect) => rect.bottom > y);
  }

  clearY(y: number, clear: ClearValue): number {
    if (clear === 'none') {
      return y;
    }
    let nextY = y;
    for (let i = 0; i < this.floats.length; i += 1) {
      const rect = this.floats[i];
      if (rect.bottom <= y) {
        continue;
      }
      if (clear === 'both' || clear === rect.side) {
        if (rect.bottom > nextY) {
          nextY = rect.bottom;
        }
      }
    }
    return nextY;
  }

  lineSegmentAt(
    y: number,
    containerLeft: number,
    containerRight: number,
  ): { left: number; right: number } {
    let left = containerLeft;
    let right = containerRight;

    for (let i = 0; i < this.floats.length; i += 1) {
      const rect = this.floats[i];
      if (y < rect.top || y >= rect.bottom) {
        continue;
      }
      if (rect.side === 'left') {
        if (rect.right > left) {
          left = rect.right;
        }
      } else if (rect.left < right) {
        right = rect.left;
      }
    }

    return { left, right };
  }

  nextY(y: number): number | null {
    let nextY: number | null = null;
    for (let i = 0; i < this.floats.length; i += 1) {
      const rect = this.floats[i];
      if (rect.bottom <= y) {
        continue;
      }
      if (nextY == null || rect.bottom < nextY) {
        nextY = rect.bottom;
      }
    }
    return nextY;
  }

  deepestBottom(): number {
    let bottom = 0;
    for (let i = 0; i < this.floats.length; i += 1) {
      if (this.floats[i].bottom > bottom) {
        bottom = this.floats[i].bottom;
      }
    }
    return bottom;
  }
}
