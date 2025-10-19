import { CSSBorderStyle, CSSStyleDict } from '../dict';
import {
  entry,
  KeysMatching,
  shorthandEntry,
  shorthandEntry2D,
  sideShorthandSet,
  StyleSchemaEntry,
} from './base';
import { stringifyColor, stringifyKeyword, stringifySize } from './stringify';

export const BORDER_STYLES: CSSBorderStyle['type'][] = [
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

function borderEntry(
  colorKey: KeysMatching<CSSStyleDict, CSSStyleDict['borderTopColor']>,
  styleKey: KeysMatching<CSSStyleDict, CSSStyleDict['borderTopStyle']>,
  widthKey: KeysMatching<CSSStyleDict, CSSStyleDict['borderTopWidth']>,
  coalesceProperties?: string[],
): StyleSchemaEntry {
  return shorthandEntry(
    [colorKey, styleKey, widthKey],
    ([color, style, width]) => {
      return [
        stringifySize(width),
        stringifyKeyword(style),
        stringifyColor(color),
      ].join(' ');
    },
    (v) => {
      const item = v.oneOf(
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
      );
      if (item != null) {
        if ('type' in item) {
          return [item, item, item];
        } else {
          return [
            item.color ?? { type: 'hash', value: '000000' },
            item.style ?? { type: 'none' },
            item.width ?? { type: 'length', value: 0 },
          ];
        }
      }
      return null;
    },
    coalesceProperties,
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
    ['border'],
    [['borderTop'], ['borderRight'], ['borderBottom'], ['borderLeft']],
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
    ['border'],
    [['borderTop'], ['borderRight'], ['borderBottom'], ['borderLeft']],
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
    ['border'],
    [['borderTop'], ['borderRight'], ['borderBottom'], ['borderLeft']],
  ),
  borderTop: borderEntry('borderTopColor', 'borderTopStyle', 'borderTopWidth', [
    'border',
  ]),
  borderRight: borderEntry(
    'borderRightColor',
    'borderRightStyle',
    'borderRightWidth',
    ['border'],
  ),
  borderBottom: borderEntry(
    'borderBottomColor',
    'borderBottomStyle',
    'borderBottomWidth',
    ['border'],
  ),
  borderLeft: borderEntry(
    'borderLeftColor',
    'borderLeftStyle',
    'borderLeftWidth',
    ['border'],
  ),
  border: shorthandEntry2D(
    [
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
    ],
    ([color, style, width]) => {
      return [
        stringifySize(width),
        stringifyKeyword(style),
        stringifyColor(color),
      ].join(' ');
    },
    (v) => {
      const item = v.oneOf(
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
      );
      if (item != null) {
        if ('type' in item) {
          return [item, item, item];
        } else {
          return [
            item.color ?? { type: 'hash', value: '000000' },
            item.style ?? { type: 'none' },
            item.width ?? { type: 'length', value: 0 },
          ];
        }
      }
      return null;
    },
  ),
};
