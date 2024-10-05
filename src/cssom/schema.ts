import {
  CSSBorderStyle,
  CSSKeyword,
  CSSLength,
  CSSMargin,
  CSSPercentage,
  CSSStyleDict,
} from './dict';
import { parse, Parser } from './parse';
import {
  stringifyColor,
  stringifyKeyword,
  stringifyNumber,
  stringifySideShorthand,
  stringifySize,
  stringifyUrl,
} from './stringify';

export interface CSSSchemaEntry {
  get(dict: CSSStyleDict): string;
  set(dict: CSSStyleDict, value: string): void;
}

function entry<K extends keyof CSSStyleDict>(
  key: K,
  get: (v: CSSStyleDict[K]) => string,
  parseFunc: (v: Parser) => CSSStyleDict[K] | null,
): CSSSchemaEntry {
  return {
    get(dict) {
      return get(dict[key]);
    },
    set(dict, input) {
      const value = parse(input, parseFunc);
      if (value != null) {
        dict[key] = value;
      }
    },
  };
}

type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

function sizeEntry<
  K extends KeysMatching<
    CSSStyleDict,
    CSSLength | CSSPercentage | CSSKeyword<any>
  >,
>(key: K, keywords: CSSStyleDict[K]['type'][]): CSSSchemaEntry {
  return entry(
    key,
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.percentage(),
        () => v.keyword(...keywords),
      ) as any,
  );
}

function sideShorthand<K extends keyof CSSStyleDict>(
  keys: [K, K, K, K],
  get: (v: CSSStyleDict[K]) => string,
  parseFunc: (v: Parser) => CSSStyleDict[K] | null,
): CSSSchemaEntry {
  return {
    get(dict) {
      return stringifySideShorthand(
        [dict[keys[0]], dict[keys[1]], dict[keys[2]], dict[keys[3]]],
        get,
      );
    },
    set(dict, input) {
      const value = parse(input, (v) => v.sideShorthand(() => parseFunc(v)));
      if (value != null) {
        dict[keys[0]] = value[0];
        dict[keys[1]] = value[1];
        dict[keys[2]] = value[2];
        dict[keys[3]] = value[3];
      }
    },
  };
}

function sideShorthandSet<K extends keyof CSSStyleDict, K2 extends string>(
  name: K2,
  keys: [K, K, K, K],
  get: (v: CSSStyleDict[K]) => string,
  parseFunc: (v: Parser) => CSSStyleDict[K] | null,
): Record<K | K2, CSSSchemaEntry> {
  return {
    [keys[0]]: entry(keys[0], get, parseFunc),
    [keys[1]]: entry(keys[1], get, parseFunc),
    [keys[2]]: entry(keys[2], get, parseFunc),
    [keys[3]]: entry(keys[3], get, parseFunc),
    [name]: sideShorthand(keys, get, parseFunc),
  } as Record<K | K2, CSSSchemaEntry>;
}

const BORDER_STYLES: CSSBorderStyle['type'][] = [
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
];

export const schema = {
  backgroundAttachment: entry('backgroundAttachment', stringifyKeyword, (v) =>
    v.keyword('scroll', 'fixed', 'inherit'),
  ),
  backgroundColor: entry('backgroundColor', stringifyColor, (v) =>
    v.oneOf(
      () => v.color(),
      () => v.keyword('inherit'),
    ),
  ),
  backgroundImage: entry('backgroundImage', stringifyUrl, (v) =>
    v.oneOf(
      () => v.url(),
      () => v.keyword('none', 'inherit'),
    ),
  ),
  backgroundPositionX: entry('backgroundPositionX', stringifySize, (v) =>
    v.oneOf(
      () => v.length(),
      () => v.percentage(),
      () => v.keyword('left', 'center', 'right', 'inherit'),
    ),
  ),
  backgroundPositionY: entry('backgroundPositionY', stringifySize, (v) =>
    v.oneOf(
      () => v.length(),
      () => v.percentage(),
      () => v.keyword('top', 'center', 'bottom', 'inherit'),
    ),
  ),
  backgroundRepeat: entry('backgroundRepeat', stringifyKeyword, (v) =>
    v.keyword('repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'inherit'),
  ),
  // background-position
  // background
  borderCollapse: entry('borderCollapse', stringifyKeyword, (v) =>
    v.keyword('collapse', 'separate', 'inherit'),
  ),
  // border-color
  // border-style
  // border-width
  // border-top
  // border-right
  // border-bottom
  // border-left
  // border
  top: sizeEntry('top', ['auto', 'inherit']),
  right: sizeEntry('right', ['auto', 'inherit']),
  bottom: sizeEntry('bottom', ['auto', 'inherit']),
  left: sizeEntry('left', ['auto', 'inherit']),
  clear: entry('clear', stringifyKeyword, (v) =>
    v.keyword('none', 'left', 'right', 'both', 'inherit'),
  ),
  color: entry('color', stringifyColor, (v) =>
    v.oneOf(
      () => v.color(),
      () => v.keyword('inherit'),
    ),
  ),
  direction: entry('direction', stringifyKeyword, (v) =>
    v.keyword('ltr', 'rtl', 'inherit'),
  ),
  display: entry('display', stringifyKeyword, (v) =>
    v.keyword(
      'inline',
      'block',
      'list-item',
      'inline-block',
      'table',
      'inline-table',
      'table-row-group',
      'table-header-group',
      'table-footer-group',
      'table-row',
      'table-column-group',
      'table-column',
      'table-cell',
      'table-caption',
      'none',
      'inherit',
    ),
  ),
  float: entry('float', stringifyKeyword, (v) =>
    v.keyword('left', 'right', 'none', 'inherit'),
  ),
  // font-family
  // font-size
  fontStyle: entry('fontStyle', stringifyKeyword, (v) =>
    v.keyword('normal', 'italic', 'oblique', 'inherit'),
  ),
  fontVariant: entry('fontVariant', stringifyKeyword, (v) =>
    v.keyword('normal', 'small-caps', 'inherit'),
  ),
  fontWeight: entry('fontWeight', stringifyNumber, (v) =>
    v.oneOf(
      () => v.keyword('normal', 'bold', 'bolder', 'lighter', 'inherit'),
      () => v.cssNumber(),
    ),
  ),
  // font
  width: sizeEntry('width', ['auto', 'inherit']),
  height: sizeEntry('height', ['auto', 'inherit']),
  minWidth: sizeEntry('minWidth', ['inherit']),
  minHeight: sizeEntry('minHeight', ['inherit']),
  maxWidth: sizeEntry('maxWidth', ['none', 'inherit']),
  maxHeight: sizeEntry('maxHeight', ['none', 'inherit']),
  // letter-spacing
  // line-height
  ...sideShorthandSet(
    'padding',
    ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.percentage(),
        () => v.keyword('inherit'),
      ),
  ),
  ...sideShorthandSet(
    'margin',
    ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.percentage(),
        () => v.keyword('auto'),
        () => v.keyword('inherit'),
      ),
  ),
  outlineColor: entry('outlineColor', stringifyColor, (v) =>
    v.oneOf(
      () => v.color(),
      () => v.keyword('invert', 'inherit'),
    ),
  ),
  outlineStyle: entry('outlineStyle', stringifyKeyword, (v) =>
    v.keyword(...BORDER_STYLES, 'inherit'),
  ),
  outlineWidth: entry('outlineWidth', stringifySize, (v) =>
    v.oneOf(
      () => v.length(),
      () => v.keyword('thin', 'medium', 'thick', 'inherit'),
    ),
  ),
  // outline
  overflow: entry('overflow', stringifyKeyword, (v) =>
    v.keyword('visible', 'hidden', 'scroll', 'auto', 'inherit'),
  ),
  position: entry('position', stringifyKeyword, (v) =>
    v.keyword('static', 'relative', 'absolute', 'fixed', 'inherit'),
  ),
  textAlign: entry('textAlign', stringifyKeyword, (v) =>
    v.keyword('left', 'right', 'center', 'justify', 'inherit'),
  ),
  // text-decoration
  textIndent: sizeEntry('textIndent', ['inherit']),
  textTransform: entry('textTransform', stringifyKeyword, (v) =>
    v.keyword('capitalize', 'uppercase', 'lowercase', 'none', 'inherit'),
  ),
  verticalAlign: sizeEntry('verticalAlign', [
    'baseline',
    'sub',
    'super',
    'top',
    'text-top',
    'middle',
    'bottom',
    'text-bottom',
    'inherit',
  ]),
  visibility: entry('visiblity', stringifyKeyword, (v) =>
    v.keyword('visible', 'hidden', 'collapse', 'inherit'),
  ),
  whiteSpace: entry('whiteSpace', stringifyKeyword, (v) =>
    v.keyword('normal', 'pre', 'nowrap', 'pre-wrap', 'pre-line', 'inherit'),
  ),
  // word-spacing
  // z-index
} satisfies Record<string, CSSSchemaEntry>;
