import { parse } from 'postcss';
import {
  CSSBorderStyle,
  CSSBorderWidth,
  CSSColor,
  CSSKeyword,
  CSSStyleDict,
} from '../dict';
import { entry, sideShorthandSet } from './base';
import { stringifyColor, stringifyKeyword, stringifySize } from './stringify';

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

export const BORDER_SCHEMA = {
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
};
