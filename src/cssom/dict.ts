export interface CSSLength {
  type: 'length';
  unit?: 'em' | 'ex' | 'in' | 'cm' | 'mm' | 'pt' | 'pc' | 'px';
  value: number;
}
export interface CSSPercentage {
  type: 'percentage';
  value: number;
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

export interface CSSStyleDict {
  paddingTop: CSSPadding;
  paddingRight: CSSPadding;
  paddingBottom: CSSPadding;
  paddingLeft: CSSPadding;
  marginTop: CSSMargin;
  marginRight: CSSMargin;
  marginBottom: CSSMargin;
  marginLeft: CSSMargin;
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
}
