export interface CSSLength {
  type: 'length';
  unit?: 'em' | 'ex' | 'in' | 'cm' | 'mm' | 'pt' | 'pc' | 'px';
  value: number;
}
export interface CSSPercentage {
  type: 'percentage';
  value: number;
}
export interface CSSHash {
  type: 'hash';
  value: string;
}
export interface CSSIndentifier {
  type: 'identifier';
  value: string;
}
export interface CSSString {
  type: 'string';
  value: string;
}
export interface CSSNumber {
  type: 'number';
  value: number;
}
export interface CSSRgb {
  type: 'rgb';
  args: number[];
}
export type CSSColor = CSSHash | CSSIndentifier | CSSRgb;
export interface CSSUrl {
  type: 'url';
  value: string;
}
export type CSSKeyword<T extends string> = {
  type: T;
};
export type CSSPadding = CSSLength | CSSPercentage | CSSKeyword<'inherit'>;
export type CSSMargin =
  | CSSLength
  | CSSPercentage
  | CSSKeyword<'auto'>
  | CSSKeyword<'inherit'>;
export type CSSBorderStyle = CSSKeyword<
  | 'none'
  | 'hidden'
  | 'dotted'
  | 'dashed'
  | 'solid'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset'
>;
export type CSSBorderWidth =
  | CSSKeyword<'thin' | 'medium' | 'thick'>
  | CSSLength;
export type CSSDisplay = CSSKeyword<
  | 'inline'
  | 'block'
  | 'list-item'
  | 'inline-block'
  | 'table'
  | 'inline-table'
  | 'table-row-group'
  | 'table-header-group'
  | 'table-footer-group'
  | 'table-row'
  | 'table-column-group'
  | 'table-column'
  | 'table-cell'
  | 'table-caption'
  | 'none'
>;
export type CSSFontAbsoluteSize = CSSKeyword<
  'xx-small' | 'x-small' | 'small' | 'medium' | 'large' | 'x-large' | 'xx-large'
>;
export type CSSFontRelativeSize = CSSKeyword<'larger' | 'smaller'>;
export type CSSFontSize =
  | CSSFontAbsoluteSize
  | CSSFontRelativeSize
  | CSSLength
  | CSSPercentage
  | CSSKeyword<'inherit'>;
export type CSSPosition = CSSKeyword<
  'static' | 'relative' | 'absolute' | 'fixed'
>;
export type CSSVerticalAlign =
  | CSSKeyword<
      | 'baseline'
      | 'sub'
      | 'super'
      | 'top'
      | 'text-top'
      | 'middle'
      | 'bottom'
      | 'text-bottom'
    >
  | CSSPercentage
  | CSSLength;

export interface CSSStyleDict {
  backgroundAttachment: CSSKeyword<'scroll' | 'fixed' | 'inherit'>;
  backgroundColor: CSSColor | CSSKeyword<'inherit'>;
  backgroundImage: CSSUrl | CSSKeyword<'none' | 'inherit'>;
  backgroundPositionX:
    | CSSLength
    | CSSPercentage
    | CSSKeyword<'left' | 'center' | 'right' | 'inherit'>;
  backgroundPositionY:
    | CSSLength
    | CSSPercentage
    | CSSKeyword<'top' | 'center' | 'bottom' | 'inherit'>;
  backgroundRepeat: CSSKeyword<
    'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'inherit'
  >;
  borderCollapse: CSSKeyword<'collapse' | 'separate' | 'inherit'>;
  borderTopColor: CSSColor | CSSKeyword<'inherit'>;
  borderTopStyle: CSSBorderStyle | CSSKeyword<'inherit'>;
  borderTopWidth: CSSBorderWidth | CSSKeyword<'inherit'>;
  borderRightColor: CSSColor | CSSKeyword<'inherit'>;
  borderRightStyle: CSSBorderStyle | CSSKeyword<'inherit'>;
  borderRightWidth: CSSBorderWidth | CSSKeyword<'inherit'>;
  borderBottomColor: CSSColor | CSSKeyword<'inherit'>;
  borderBottomStyle: CSSBorderStyle | CSSKeyword<'inherit'>;
  borderBottomWidth: CSSBorderWidth | CSSKeyword<'inherit'>;
  borderLeftColor: CSSColor | CSSKeyword<'inherit'>;
  borderLeftStyle: CSSBorderStyle | CSSKeyword<'inherit'>;
  borderLeftWidth: CSSBorderWidth | CSSKeyword<'inherit'>;
  top: CSSMargin;
  right: CSSMargin;
  bottom: CSSMargin;
  left: CSSMargin;
  clear: CSSKeyword<'none' | 'left' | 'right' | 'both' | 'inherit'>;
  color: CSSColor | CSSKeyword<'inherit'>;
  direction: CSSKeyword<'ltr' | 'rtl' | 'inherit'>;
  display: CSSDisplay | CSSKeyword<'inherit'>;
  float: CSSKeyword<'left' | 'right' | 'none' | 'inherit'>;
  fontFamily: (CSSString | CSSIndentifier)[];
  fontSize: CSSFontSize;
  fontStyle: CSSKeyword<'normal' | 'italic' | 'oblique' | 'inherit'>;
  fontVariant: CSSKeyword<'normal' | 'small-caps' | 'inherit'>;
  fontWeight:
    | CSSKeyword<'normal' | 'bold' | 'bolder' | 'lighter' | 'inherit'>
    | CSSNumber;
  width: CSSLength | CSSPercentage | CSSKeyword<'auto'> | CSSKeyword<'inherit'>;
  height:
    | CSSLength
    | CSSPercentage
    | CSSKeyword<'auto'>
    | CSSKeyword<'inherit'>;
  minWidth: CSSLength | CSSPercentage | CSSKeyword<'inherit'>;
  minHeight: CSSLength | CSSPercentage | CSSKeyword<'inherit'>;
  maxWidth:
    | CSSLength
    | CSSPercentage
    | CSSKeyword<'none'>
    | CSSKeyword<'inherit'>;
  maxHeight:
    | CSSLength
    | CSSPercentage
    | CSSKeyword<'none'>
    | CSSKeyword<'inherit'>;
  letterSpacing: CSSKeyword<'normal' | 'inherit'> | CSSLength;
  lineHeight:
    | CSSKeyword<'normal' | 'inherit'>
    | CSSNumber
    | CSSLength
    | CSSPercentage;
  paddingTop: CSSPadding;
  paddingRight: CSSPadding;
  paddingBottom: CSSPadding;
  paddingLeft: CSSPadding;
  marginTop: CSSMargin;
  marginRight: CSSMargin;
  marginBottom: CSSMargin;
  marginLeft: CSSMargin;
  outlineColor: CSSColor | CSSKeyword<'invert' | 'inherit'>;
  outlineStyle: CSSBorderStyle | CSSKeyword<'inherit'>;
  outlineWidth: CSSBorderWidth | CSSKeyword<'inherit'>;
  overflow: CSSKeyword<'visible' | 'hidden' | 'scroll' | 'auto' | 'inherit'>;
  position: CSSPosition | CSSKeyword<'inherit'>;
  textAlign: CSSKeyword<'left' | 'right' | 'center' | 'justify' | 'inherit'>;
  textDecoration:
    | CSSKeyword<'underline' | 'overline' | 'line-through' | 'blink'>[]
    | CSSKeyword<'inherit'>;
  textIndent: CSSLength | CSSPercentage | CSSKeyword<'inherit'>;
  textTransform: CSSKeyword<
    'capitalize' | 'uppercase' | 'lowercase' | 'none' | 'inherit'
  >;
  verticalAlign: CSSVerticalAlign | CSSKeyword<'inherit'>;
  visibility: CSSKeyword<'visible' | 'hidden' | 'collapse' | 'inherit'>;
  whiteSpace: CSSKeyword<
    'normal' | 'pre' | 'nowrap' | 'pre-wrap' | 'pre-line' | 'inherit'
  >;
  wordSpacing: CSSKeyword<'normal' | 'inherit'> | CSSLength;
  zIndex: CSSKeyword<'auto' | 'inherit'> | CSSNumber;
}
