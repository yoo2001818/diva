import { CSSColor, CSSLength } from '../cssom/dict';
import { Box, LayoutBox } from './Box';
import { StyleData } from './StyleData';

export function calcLength(value: CSSLength, _item: StyleData): number {
  // Assume everything in px for now
  return value.value;
}

export function calcWidth(containingBox: Box, item: StyleData): number | null {
  const width = item.style._getRaw('width');
  switch (width.type) {
    case 'auto':
      return null;
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

export function calcHeight(containingBox: Box, item: StyleData): number | null {
  const height = item.style._getRaw('height');
  switch (height.type) {
    case 'auto':
      return null;
    case 'inherit':
      return 0;
    case 'length':
      return calcLength(height, item);
    case 'percentage':
      return containingBox.height * (height.value / 100);
    default:
      return null;
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
  box.background.color = item.computedStyle.get('backgroundColor') as CSSColor;
  box.borderTopStyle.color = item.computedStyle.get(
    'borderTopColor',
  ) as CSSColor;
  box.borderLeftStyle.color = item.computedStyle.get(
    'borderLeftColor',
  ) as CSSColor;
  box.borderRightStyle.color = item.computedStyle.get(
    'borderRightColor',
  ) as CSSColor;
  box.borderBottomStyle.color = item.computedStyle.get(
    'borderBottomColor',
  ) as CSSColor;
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
  const setHeight = calcHeight(containingBox, item);

  let height = 0;
  let prevMarginBottom = 0;
  const box = new LayoutBox();
  updateBoxStyles(box, item);
  box.outerBox.left = parentLeft + box.margin.left;
  box.outerBox.top = parentTop + box.margin.top;
  box.outerBox.width = setWidth ?? containingBox.width - box.margin.width;
  box.scrollBox.width = box.outerBox.width - box.border.width;
  box.innerBox.width = box.contentWidth;

  children.forEach((child) => {
    // Pass a box with correct location, and parent height
    // TODO: Couldn't this just use a regular box?
    const childBox = new Box();
    childBox.top = box.padding.top + height;
    childBox.left = box.padding.left;
    childBox.width = box.contentWidth;
    childBox.height = containingBox.height;
    child.layout(childBox);
    const childPrincipalBox = child.principalBox;
    const shiftedHeight = Math.min(
      prevMarginBottom,
      childPrincipalBox.margin.top,
    );
    childPrincipalBox.outerBox.top -= shiftedHeight;
    prevMarginBottom = childPrincipalBox.margin.bottom;
    height +=
      childPrincipalBox.clientHeight +
      childPrincipalBox.margin.height -
      shiftedHeight;
  });

  box.innerBox.height = height + box.padding.height;
  box.outerBox.height =
    setHeight != null
      ? setHeight
      : height + box.border.height + box.padding.height;

  item.boxes[0] = box;
}
