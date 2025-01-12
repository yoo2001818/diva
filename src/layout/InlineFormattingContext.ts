import { Box } from './Box';
import { StyleData } from './StyleData';

export class InlineFormattingContext {
  containingBox: Box;
  lines: StyleData[];
  constructor(containingBox: Box) {
    this.containingBox = containingBox;
    this.lines = [];
  }
  feed(item: StyleData): void {}
  newline(): void {}
}
