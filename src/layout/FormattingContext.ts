import { CSSLength } from '../cssom/dict';
import { Box, LayoutBox } from './Box';
import { StyleData } from './StyleData';

export function calcLength(value: CSSLength, _item: StyleData): number {
  // Assume everything in px for now
  return value.value;
}

export function calcWidth(containingBox: Box, item: StyleData): number {
  const width = item.style._getRaw('width');
  switch (width.type) {
    case 'auto':
      // Well, we can't do anything yet
      return containingBox.width;
    case 'inherit':
      return 0;
    case 'length':
      return calcLength(width, item);
    case 'percentage':
      return containingBox.width * (width.value / 100);
    default:
      return 0;
  }
}

export function updateBoxStyles(box: LayoutBox, item: StyleData): void {
  box.border.top = item.computedStyle.getPx('borderTopWidth');
  box.border.left = item.computedStyle.getPx('borderLeftWidth');
  box.border.right = item.computedStyle.getPx('borderRightWidth');
  box.border.bottom = item.computedStyle.getPx('borderBottomWidth');
  box.padding.top = item.computedStyle.getPx('paddingTop');
  box.padding.left = item.computedStyle.getPx('paddingLeft');
  box.padding.right = item.computedStyle.getPx('paddingRight');
  box.padding.bottom = item.computedStyle.getPx('paddingBottom');
  box.margin.top = item.computedStyle.getPx('marginTop');
  box.margin.left = item.computedStyle.getPx('marginLeft');
  box.margin.right = item.computedStyle.getPx('marginRight');
  box.margin.bottom = item.computedStyle.getPx('marginBottom');
}

export function layoutBlocks(
  containingBox: Box,
  item: StyleData,
  children: StyleData[],
): void {
  // Disregard floats for now
  const parentLeft = containingBox.left;
  const parentTop = containingBox.top;
  const setWidth = calcWidth(containingBox, item);

  let height = 0;
  const box = new LayoutBox();
  updateBoxStyles(box, item);
  box.offsetLeft = parentLeft;
  box.offsetTop = parentTop;
  // Assuming border-box
  box.contentWidth = setWidth - box.border.width - box.padding.width;

  children.forEach((child) => {
    // Pass a box with correct location, and parent height
    // TODO: Couldn't this just use a regular box?
    const childBox = new Box();
    childBox.top = parentTop + box.border.top + box.padding.top + height;
    childBox.left = parentLeft + box.border.left + box.padding.left;
    childBox.width = box.contentWidth;
    childBox.height = containingBox.height;
    child.layout(childBox);
    const childPrincipalBox = child.principalBox;
    height += childPrincipalBox.clientHeight + childPrincipalBox.margin.height;
  });

  box.contentHeight = height;

  item.boxes[0] = box;
}
