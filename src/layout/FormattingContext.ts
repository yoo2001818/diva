import { LayoutBox } from './Box';
import { StyleData } from './StyleData';

export function layoutBlocks(
  containingBox: LayoutBox,
  item: StyleData,
  children: StyleData[],
): void {
  // Disregard floats for now
  const parentLeft = containingBox.offsetLeft + containingBox.padding.left;
  const parentTop = containingBox.offsetTop + containingBox.padding.top;
  const parentWidth = containingBox.contentWidth;

  let width = parentWidth;
  let height = 0;
  const box = new LayoutBox();
  box.offsetLeft = parentLeft;
  box.offsetTop = parentTop;
}
