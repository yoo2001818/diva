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

export const INITIAL_VALUES: CSSStyleDict = {
  paddingTop: { type: 'length', value: 0 },
  paddingRight: { type: 'length', value: 0 },
  paddingBottom: { type: 'length', value: 0 },
  paddingLeft: { type: 'length', value: 0 },
  marginTop: { type: 'length', value: 0 },
  marginRight: { type: 'length', value: 0 },
  marginBottom: { type: 'length', value: 0 },
  marginLeft: { type: 'length', value: 0 },
  width: { type: 'auto' },
  height: { type: 'auto' },
  minWidth: { type: 'length', value: 0 },
  minHeight: { type: 'length', value: 0 },
  maxWidth: { type: 'none' },
  maxHeight: { type: 'none' },
};
