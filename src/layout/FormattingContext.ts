import { CSSLength } from '../cssom/dict';
import { LayoutBox } from './Box';
import { StyleData } from './StyleData';

export function calcLength(value: CSSLength, _item: StyleData): number {
  // Assume everything in px for now
  return value.value;
}

export function calcWidth(containingBox: LayoutBox, item: StyleData): number {
  const width = item.style._getRaw('width');
  switch (width.type) {
    case 'auto':
      return containingBox.contentWidth;
    case 'inherit':
      return 0;
    case 'length':
      return calcLength(width, item);
    case 'percentage':
      return containingBox.contentWidth * (width.value / 100);
    default:
      return 0;
  }
}

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
