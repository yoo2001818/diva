import {
  CSSColor,
  CSSIndentifier,
  CSSKeyword,
  CSSLength,
  CSSStyleDict,
} from './dict';

export interface StylePropertyDescriptor<T> {
  default: T;
  isInherited?: boolean;
}

export type StylePropertyDescriptorMap = {
  [K in keyof CSSStyleDict]: StylePropertyDescriptor<CSSStyleDict[K]>;
};

function keyword<T extends string>(type: T): CSSKeyword<T> {
  return { type };
}
function identifier(value: string): CSSIndentifier {
  return { type: 'identifier', value };
}
const length0: CSSLength = { type: 'length', value: 0 };
const colorDefault: CSSColor = { type: 'hash', value: '000000' };

export const STYLE_PROPERTY_DESCRIPTOR_MAP: StylePropertyDescriptorMap = {
  backgroundAttachment: { default: keyword('scroll') },
  backgroundColor: { default: identifier('transparent') },
  backgroundImage: { default: keyword('none') },
  backgroundPositionX: { default: { type: 'percentage', value: 0 } },
  backgroundPositionY: { default: { type: 'percentage', value: 0 } },
  backgroundRepeat: { default: keyword('repeat') },
  borderCollapse: { default: keyword('separate') },
  borderTopColor: { default: colorDefault },
  borderTopStyle: { default: keyword('none') },
  borderTopWidth: { default: keyword('medium') },
  borderRightColor: { default: colorDefault },
  borderRightStyle: { default: keyword('none') },
  borderRightWidth: { default: keyword('medium') },
  borderBottomColor: { default: colorDefault },
  borderBottomStyle: { default: keyword('none') },
  borderBottomWidth: { default: keyword('medium') },
  borderLeftColor: { default: colorDefault },
  borderLeftStyle: { default: keyword('none') },
  borderLeftWidth: { default: keyword('medium') },
  top: { default: keyword('auto') },
  right: { default: keyword('auto') },
  bottom: { default: keyword('auto') },
  left: { default: keyword('auto') },
  clear: { default: keyword('none') },
  color: { default: colorDefault, isInherited: true },
  direction: { default: keyword('ltr'), isInherited: true },
  display: { default: keyword('inline') },
  float: { default: keyword('none') },
  fontFamily: { default: [identifier('sans-serif')], isInherited: true },
  fontSize: { default: keyword('medium'), isInherited: true },
  fontStyle: { default: keyword('normal'), isInherited: true },
  fontVariant: { default: keyword('normal'), isInherited: true },
  fontWeight: { default: keyword('normal'), isInherited: true },
  width: { default: keyword('auto') },
  height: { default: keyword('auto') },
  minWidth: { default: length0 },
  minHeight: { default: length0 },
  maxWidth: { default: keyword('none') },
  maxHeight: { default: keyword('none') },
  letterSpacing: { default: keyword('normal'), isInherited: true },
  lineHeight: { default: keyword('normal'), isInherited: true },
  paddingTop: { default: length0 },
  paddingRight: { default: length0 },
  paddingBottom: { default: length0 },
  paddingLeft: { default: length0 },
  marginTop: { default: length0 },
  marginRight: { default: length0 },
  marginBottom: { default: length0 },
  marginLeft: { default: length0 },
  outlineColor: { default: keyword('invert') },
  outlineStyle: { default: keyword('none') },
  outlineWidth: { default: keyword('medium') },
  overflow: { default: keyword('visible') },
  position: { default: keyword('static') },
  textAlign: { default: keyword('left'), isInherited: true },
  textDecoration: { default: [] },
  textIndent: { default: length0, isInherited: true },
  textTransform: { default: keyword('none'), isInherited: true },
  verticalAlign: { default: keyword('baseline') },
  visibility: { default: keyword('visible'), isInherited: true },
  whiteSpace: { default: keyword('normal'), isInherited: true },
  wordSpacing: { default: keyword('normal'), isInherited: true },
  zIndex: { default: keyword('auto') },
};
