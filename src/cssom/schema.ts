import {
  CSSBorderStyle,
  CSSBorderWidth,
  CSSColor,
  CSSKeyword,
  CSSLength,
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
import { kebabize } from './utils';

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

interface BorderEntryValue {
  color: CSSColor | CSSKeyword<'inherit'>;
  style: CSSBorderStyle | CSSKeyword<'inherit'>;
  width: CSSBorderWidth | CSSKeyword<'inherit'>;
}

function borderEntry(
  get: (dict: CSSStyleDict) => BorderEntryValue,
  set: (dict: CSSStyleDict, value: BorderEntryValue) => void,
): CSSSchemaEntry {
  return {
    get(dict) {
      const { color, style, width } = get(dict);
      return [
        stringifySize(width),
        stringifyKeyword(style),
        stringifyColor(color),
      ].join(' ');
    },
    set(dict, input) {
      const item = parse(input, (v) =>
        v.oneOf(
          () => v.keyword('inherit'),
          () =>
            v.any({
              width: () =>
                v.oneOf(
                  () => v.length(),
                  () => v.keyword('thin', 'medium', 'thick'),
                ),
              style: () => v.keyword(...BORDER_STYLES),
              color: () => v.color(),
            }),
        ),
      );
      if (item != null) {
        if ('type' in item) {
          set(dict, { color: item, style: item, width: item });
        } else {
          const prev = { ...get(dict), ...item };
          set(dict, prev);
        }
      }
    },
  };
}

function borderEntryKey(
  colorKey: KeysMatching<CSSStyleDict, BorderEntryValue['color']>[],
  styleKey: KeysMatching<CSSStyleDict, BorderEntryValue['style']>[],
  widthKey: KeysMatching<CSSStyleDict, BorderEntryValue['width']>[],
): CSSSchemaEntry {
  return borderEntry(
    (dict) => ({
      width: dict[widthKey[0]],
      style: dict[styleKey[0]],
      color: dict[colorKey[0]],
    }),
    (dict, value) => {
      widthKey.forEach((k) => (dict[k] = value.width));
      styleKey.forEach((k) => (dict[k] = value.style));
      colorKey.forEach((k) => (dict[k] = value.color));
    },
  );
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
      () => v.keyword('inherit'),
      () => v.color(),
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
  backgroundPosition: {
    get(dict) {
      return (
        stringifySize(dict.backgroundPositionX) +
        ' ' +
        stringifySize(dict.backgroundPositionY)
      );
    },
    set(dict, input) {
      const items = parse(input, (v) =>
        v.oneOf(
          () => v.backgroundPosition(),
          () => v.keyword('inherit'),
        ),
      );
      if (items != null) {
        if (Array.isArray(items)) {
          dict.backgroundPositionX = items[0];
          dict.backgroundPositionY = items[1];
        } else {
          dict.backgroundPositionX = items;
          dict.backgroundPositionY = items;
        }
      }
    },
  },
  backgroundRepeat: entry('backgroundRepeat', stringifyKeyword, (v) =>
    v.keyword('repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'inherit'),
  ),
  background: {
    get(dict) {
      return [
        stringifyColor(dict.backgroundColor),
        stringifyUrl(dict.backgroundImage),
        stringifyKeyword(dict.backgroundRepeat),
        stringifyKeyword(dict.backgroundAttachment),
        stringifySize(dict.backgroundPositionX),
        stringifySize(dict.backgroundPositionY),
      ].join(' ');
    },
    set(dict, input) {
      const item = parse(input, (v) =>
        v.oneOf(
          () => v.keyword('inherit'),
          () =>
            v.any({
              attachment: () => v.keyword('scroll', 'fixed'),
              image: () =>
                v.oneOf(
                  () => v.url(),
                  () => v.keyword('none'),
                ),
              position: () => v.backgroundPosition(),
              repeat: () =>
                v.keyword('repeat', 'repeat-x', 'repeat-y', 'no-repeat'),
              color: () => v.color(),
            }),
        ),
      );
      if (item != null) {
        if ('type' in item) {
          dict.backgroundAttachment = item;
          dict.backgroundImage = item;
          dict.backgroundPositionX = item;
          dict.backgroundPositionY = item;
          dict.backgroundRepeat = item;
          dict.backgroundColor = item;
        } else {
          if (item.attachment) dict.backgroundAttachment = item.attachment;
          if (item.image) dict.backgroundImage = item.image;
          if (item.repeat) dict.backgroundRepeat = item.repeat;
          if (item.color) dict.backgroundColor = item.color;
          if (item.position) {
            dict.backgroundPositionX = item.position[0];
            dict.backgroundPositionY = item.position[1];
          }
        }
      }
    },
  },
  borderCollapse: entry('borderCollapse', stringifyKeyword, (v) =>
    v.keyword('collapse', 'separate', 'inherit'),
  ),
  ...sideShorthandSet(
    'borderColor',
    [
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
    ],
    stringifyColor,
    (v) =>
      v.oneOf(
        () => v.keyword('inherit'),
        () => v.color(),
      ),
  ),
  ...sideShorthandSet(
    'borderStyle',
    [
      'borderTopStyle',
      'borderRightStyle',
      'borderBottomStyle',
      'borderLeftStyle',
    ],
    stringifyKeyword,
    (v) => v.keyword(...BORDER_STYLES, 'inherit'),
  ),
  ...sideShorthandSet(
    'borderWidth',
    [
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
    ],
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.keyword('thin', 'medium', 'thick', 'inherit'),
      ),
  ),
  borderTop: borderEntryKey(
    ['borderTopColor'],
    ['borderTopStyle'],
    ['borderTopWidth'],
  ),
  borderRight: borderEntryKey(
    ['borderRightColor'],
    ['borderRightStyle'],
    ['borderRightWidth'],
  ),
  borderBottom: borderEntryKey(
    ['borderBottomColor'],
    ['borderBottomStyle'],
    ['borderBottomWidth'],
  ),
  borderLeft: borderEntryKey(
    ['borderLeftColor'],
    ['borderLeftStyle'],
    ['borderLeftWidth'],
  ),
  border: borderEntryKey(
    [
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
    ],
    [
      'borderTopStyle',
      'borderRightStyle',
      'borderBottomStyle',
      'borderLeftStyle',
    ],
    [
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
    ],
  ),
  top: sizeEntry('top', ['auto', 'inherit']),
  right: sizeEntry('right', ['auto', 'inherit']),
  bottom: sizeEntry('bottom', ['auto', 'inherit']),
  left: sizeEntry('left', ['auto', 'inherit']),
  clear: entry('clear', stringifyKeyword, (v) =>
    v.keyword('none', 'left', 'right', 'both', 'inherit'),
  ),
  color: entry('color', stringifyColor, (v) =>
    v.oneOf(
      () => v.keyword('inherit'),
      () => v.color(),
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
  fontSize: entry('fontSize', stringifySize, (v) =>
    v.oneOf(
      () =>
        v.keyword(
          'xx-small',
          'x-small',
          'small',
          'medium',
          'large',
          'x-large',
          'xx-large',
          'larger',
          'smaller',
          'inherit',
        ),
      () => v.length(),
      () => v.percentage(),
    ),
  ),
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
  letterSpacing: entry('letterSpacing', stringifySize, (v) =>
    v.oneOf(
      () => v.keyword('normal', 'inherit'),
      () => v.length(),
    ),
  ),
  lineHeight: entry('lineHeight', stringifySize, (v) =>
    v.oneOf(
      () => v.keyword('normal', 'inherit'),
      () => v.length(),
      () => v.percentage(),
      () => v.cssNumber(),
    ),
  ),
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
      () => v.keyword('invert', 'inherit'),
      () => v.color(),
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
  outline: {
    get(dict) {
      return [
        stringifySize(dict.outlineWidth),
        stringifyKeyword(dict.outlineStyle),
        stringifyColor(dict.outlineColor),
      ].join(' ');
    },
    set(dict, input) {
      const item = parse(input, (v) =>
        v.oneOf(
          () => v.keyword('inherit'),
          () =>
            v.any({
              width: () =>
                v.oneOf(
                  () => v.length(),
                  () => v.keyword('thin', 'medium', 'thick'),
                ),
              style: () => v.keyword(...BORDER_STYLES),
              color: () =>
                v.oneOf(
                  () => v.keyword('invert'),
                  () => v.color(),
                ),
            }),
        ),
      );
      if (item != null) {
        if ('type' in item) {
          dict.outlineWidth = item;
          dict.outlineStyle = item;
          dict.outlineColor = item;
        } else {
          if (item.width) dict.outlineWidth = item.width;
          if (item.style) dict.outlineStyle = item.style;
          if (item.color) dict.outlineColor = item.color;
        }
      }
    },
  },
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
  wordSpacing: entry('wordSpacing', stringifySize, (v) =>
    v.oneOf(
      () => v.keyword('normal', 'inherit'),
      () => v.length(),
    ),
  ),
  zIndex: entry('zIndex', stringifyNumber, (v) =>
    v.oneOf(
      () => v.keyword('auto', 'inherit'),
      () => v.cssNumber(),
    ),
  ),
} satisfies Record<string, CSSSchemaEntry>;

export type CSSSchemaKeys = keyof typeof schema;
type Kebab<
  T extends string,
  A extends string = '',
> = T extends `${infer F}${infer R}`
  ? Kebab<R, `${A}${F extends Lowercase<F> ? '' : '-'}${Lowercase<F>}`>
  : A;
export type CSSSchemaKeysKebab = Kebab<CSSSchemaKeys>;

export const schemaKebab = Object.fromEntries(
  Object.entries(schema).map(([key, value]) => [kebabize(key), value]),
);
