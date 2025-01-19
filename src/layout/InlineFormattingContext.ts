import { Box, LayoutBox } from './Box';
import { StyleData } from './StyleData';

export class InlineFormattingContext {
  containingBox: Box;
  lineBoxes: LayoutBox[];
  constructor(containingBox: Box) {
    this.containingBox = containingBox;
    this.lineBoxes = [];
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
  }
  newline(): void {}
  finalize(): void {}
}
