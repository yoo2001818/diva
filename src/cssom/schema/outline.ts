import { entry, shorthandEntry } from './base';
import { stringifyColor, stringifyKeyword, stringifySize } from './stringify';
import { BORDER_STYLES } from './border';

export const OUTLINE_SCHEMA = {
  outlineColor: entry(
    'outlineColor',
    stringifyColor,
    (v) =>
      v.oneOf(
        () => v.keyword('invert', 'inherit'),
        () => v.color(),
      ),
    ['outline'],
  ),
  outlineStyle: entry(
    'outlineStyle',
    stringifyKeyword,
    (v) => v.keyword(...BORDER_STYLES, 'inherit'),
    ['outline'],
  ),
  outlineWidth: entry(
    'outlineWidth',
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.keyword('thin', 'medium', 'thick', 'inherit'),
      ),
    ['outline'],
  ),
  outline: shorthandEntry(
    ['outlineColor', 'outlineStyle', 'outlineWidth'],
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
