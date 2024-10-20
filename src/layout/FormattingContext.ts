import { LayoutBox } from './Box';
import { StyleData } from './StyleData';

export function layoutBlocks(
  containingBox: LayoutBox,
  item: StyleData,
  children: StyleData[],
): void {
  // Disregard floats for now
  const parentLeft = containingBox.offsetLeft;
  const parentTop = containingBox.offsetTop;
  const parentWidth = containingBox.contentWidth;

  let height = 0;
  const box = new LayoutBox();
  box.offsetLeft = parentLeft;
  box.offsetTop = parentTop;
  box.contentWidth =
    parentWidth - item.margin.width - item.border.width - item.padding.width;

  children.forEach((child) => {
    child.layout(box);
    height +=
      child.principalBox.contentHeight +
      child.margin.height +
      child.border.height +
      child.padding.height;
  });

  box.contentHeight = height;
}
