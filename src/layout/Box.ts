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
  margin: Spacing = new Spacing();
  border: Spacing = new Spacing();
  padding: Spacing = new Spacing();

  get clientWidth(): number {
    return this.padding.left + this.padding.right + this.contentWidth;
  }

  get clientHeight(): number {
    return this.padding.top + this.padding.bottom + this.contentHeight;
  }

  get offsetWidth(): number {
    // TODO: scroll bars
    return this.border.left + this.border.right + this.clientWidth;
  }

  get offsetHeight(): number {
    // TODO: scroll bars
    return this.border.top + this.border.bottom + this.clientHeight;
  }
}
