import { CSSBorderStyle, CSSColor, CSSStyleDict } from '../cssom/dict';

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

export class BorderStyle {
  style: CSSBorderStyle = { type: 'solid' };
  color: CSSColor = { type: 'hash', value: '000000' };
}

export class BackgroundStyle {
  color: CSSColor = { type: 'identifier', value: 'transparent' };
}

export class LayoutBox {
  // Box seen by the outside node (border box)
  outerBox: Box = new Box();
  // Box of the scrolling area (excluding scrollbars)
  scrollBox: Box = new Box();
  // Box of the content inside the scroll box (padding box)
  innerBox: Box = new Box();
  scrollTop: number = 0;
  scrollLeft: number = 0;
  margin: Spacing = new Spacing();
  border: Spacing = new Spacing();
  padding: Spacing = new Spacing();
  borderTopStyle: BorderStyle = new BorderStyle();
  borderRightStyle: BorderStyle = new BorderStyle();
  borderBottomStyle: BorderStyle = new BorderStyle();
  borderLeftStyle: BorderStyle = new BorderStyle();
  background: BackgroundStyle = new BackgroundStyle();

  // Contents intrinsic to the node, e.g. background, color, border,
  // are described here
  get clientWidth(): number {
    return this.outerBox.width;
  }

  get clientHeight(): number {
    return this.outerBox.height;
  }

  get contentWidth(): number {
    return this.scrollBox.width - this.padding.width;
  }

  get contentHeight(): number {
    return this.scrollBox.height - this.padding.height;
  }
}

export class TextBox extends LayoutBox {
  text: string = '';
  fontSize: number = 16;
  fontStyle: CSSStyleDict['fontStyle'] = { type: 'normal' };
  fontVariant: CSSStyleDict['fontVariant'] = { type: 'normal' };
  fontWeight: number = 400;
  lineHeight: number = 22;
}
