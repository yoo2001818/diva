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
}

export class LayoutBox {
  offsetTop: number = 0;
  offsetLeft: number = 0;
  contentWidth: number = 0;
  contentHeight: number = 0;
  definesOffset: boolean = false;
  padding: Spacing = new Spacing();

  get clientWidth(): number {
    return this.padding.left + this.padding.right + this.contentWidth;
  }

  get clientHeight(): number {
    return this.padding.top + this.padding.bottom + this.contentHeight;
  }
}
