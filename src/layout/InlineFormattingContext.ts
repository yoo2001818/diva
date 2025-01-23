import { Box, LayoutBox } from './Box';
import { StyleData } from './StyleData';

export class InlineFormattingContext {
  containingBox: Box;
  lineBoxes: LayoutBox[];
  lines: { box: Box; items: StyleData[]; remaining: number }[];
  constructor(containingBox: Box) {
    this.containingBox = containingBox;
    this.lineBoxes = [];
    this.lines = [];
  }
  feed(item: StyleData): void {
    // 1. Initially, it would need to check what elements (and text) reside in
    //    the same line. In other words, each bounds of each node is determined
    //    and "chopped up" to each lines. This must include all the children,
    //    including grandchildren to calculate it. In other words, just like how
    //    a text render would do (it is!) It must traverse the node in-order and
    //    lay out the text and the nodes.
    // 2. After a line is finished, the vertical height of the line will be
    //    calculated. Text baseline and other heights are calculated using the
    //    font, and other nodes are lined up to match that. After the height is
    //    calculated, the nodes are placed according to the line.
    const lineBox = new Box();
    lineBox.width = this.containingBox.width;
    // FIXME: inline-in-inline nodes must be dealt differently
    item.layout(lineBox);
    const box = item.principalBox;
    let currentLine = this.lines[this.lines.length - 1];
    if (currentLine == null || currentLine.remaining < box.clientWidth) {
      this.newline();
      currentLine = this.lines[this.lines.length - 1];
    }
    currentLine.items.push(item);
    currentLine.remaining -= box.clientWidth;
  }
  newline(): void {
    this.lines.push({
      box: new Box(),
      items: [],
      remaining: this.containingBox.width,
    });
  }
  finalize(): void {}
}
