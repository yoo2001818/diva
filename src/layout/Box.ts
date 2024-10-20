export class Box {
  top: number = 0;
  left: number = 0;
  width: number = 0;
  height: number = 0;
}

export class Spacing {
  top: number = 0;
  right: number = 0;
  bottom: number = 0;
  left: number = 0;

  get width(): number {
    return this.left + this.right;
  }

  get height(): number {
    return this.top + this.bottom;
  }
}

export class LayoutBox {
  offsetTop: number = 0;
  offsetLeft: number = 0;
  contentWidth: number = 0;
  contentHeight: number = 0;
  definesOffset: boolean = false;
}
