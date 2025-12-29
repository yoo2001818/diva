import {
  stringifyKeyword,
  stringifyColor,
  stringifyUrl,
  stringifySize,
} from './stringify';
import { entry, shorthandEntry } from './base';

export const BACKGROUND_SCHEMA = {
  backgroundAttachment: entry(
    'backgroundAttachment',
    stringifyKeyword,
    (v) => v.keyword('scroll', 'fixed', 'inherit'),
    ['background'],
  ),
  backgroundColor: entry(
    'backgroundColor',
    stringifyColor,
    (v) =>
      v.oneOf(
        () => v.keyword('inherit'),
        () => v.color(),
      ),
    ['background'],
  ),
  backgroundImage: entry(
    'backgroundImage',
    stringifyUrl,
    (v) =>
      v.oneOf(
        () => v.url(),
        () => v.keyword('none', 'inherit'),
      ),
    ['background'],
  ),
  backgroundPositionX: entry(
    'backgroundPositionX',
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.percentage(),
        () => v.keyword('left', 'center', 'right', 'inherit'),
      ),
    ['background', 'backgroundPosition'],
  ),
  backgroundPositionY: entry(
    'backgroundPositionY',
    stringifySize,
    (v) =>
      v.oneOf(
        () => v.length(),
        () => v.percentage(),
        () => v.keyword('top', 'center', 'bottom', 'inherit'),
      ),
    ['background', 'backgroundPosition'],
  ),
  backgroundPosition: shorthandEntry(
    ['backgroundPositionX', 'backgroundPositionY'],
    ([x, y]) => `${stringifySize(x)} ${stringifySize(y)}`,
    (v) => {
      const items = v.oneOf(
        () => v.backgroundPosition(),
        () => v.keyword('inherit'),
      );
      if (items != null) {
        if (Array.isArray(items)) {
          return items;
        } else {
          return [items, items];
        }
      }
      return null;
    },
    ['background'],
  ),
  backgroundRepeat: entry(
    'backgroundRepeat',
    stringifyKeyword,
    (v) => v.keyword('repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'inherit'),
    ['background'],
  ),
  background: shorthandEntry(
    [
      'backgroundColor',
      'backgroundImage',
      'backgroundRepeat',
      'backgroundAttachment',
      'backgroundPositionX',
      'backgroundPositionY',
    ],
    ([color, image, repeat, attachment, positionX, positionY]) =>
      [
        stringifyColor(color),
        stringifyUrl(image),
        stringifyKeyword(repeat),
        stringifyKeyword(attachment),
        stringifySize(positionX),
        stringifySize(positionY),
      ].join(' '),
    (v) => {
      const item = v.oneOf(
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
      );
      if (item != null) {
        if ('type' in item) {
          return [item, item, item, item, item, item];
        } else {
          return [
            item.color ?? { type: 'identifier', value: 'transparent' },
            item.image ?? { type: 'none' },
            item.repeat ?? { type: 'repeat' },
            item.attachment ?? { type: 'scroll' },
            item.position?.[0] ?? { type: 'percentage', value: 0 },
            item.position?.[1] ?? { type: 'percentage', value: 0 },
          ];
        }
      }
      return null;
    },
  ),
};
