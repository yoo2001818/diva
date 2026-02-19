import { LayoutBox } from '../Box';

export function createZeroBox(left: number, top: number): LayoutBox {
  const box = new LayoutBox();
  box.outerBox.left = left;
  box.outerBox.top = top;
  box.outerBox.width = 0;
  box.outerBox.height = 0;
  box.scrollBox.left = left;
  box.scrollBox.top = top;
  box.scrollBox.width = 0;
  box.scrollBox.height = 0;
  box.innerBox.left = left;
  box.innerBox.top = top;
  box.innerBox.width = 0;
  box.innerBox.height = 0;
  return box;
}
