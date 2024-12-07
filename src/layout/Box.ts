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
  color: CSSColor = { type: 'hash', value: 'ffffff' };
}

export class LayoutBox {
  margin: Spacing = new Spacing();
  border: Spacing = new Spacing();
  padding: Spacing = new Spacing();
  offsetTop: number = 0;
  offsetLeft: number = 0;
  contentWidth: number = 0;
  contentHeight: number = 0;
  scrollTop: number = 0;
  scrollLeft: number = 0;
  scrollWidth: number = 0;
  scrollHeight: number = 0;
  borderTopStyle: BorderStyle = new BorderStyle();
  borderRightStyle: BorderStyle = new BorderStyle();
  borderBottomStyle: BorderStyle = new BorderStyle();
  borderLeftStyle: BorderStyle = new BorderStyle();
  background: BackgroundStyle = new BackgroundStyle();

  // Contents intrinsic to the node, e.g. background, color, border,
  // are described here
  get clientWidth(): number {
    return this.contentWidth + this.border.width + this.padding.width;
  }

  get clientHeight(): number {
    return this.contentHeight + this.border.height + this.padding.height;
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
