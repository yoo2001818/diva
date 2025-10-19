import { sizeEntry, entry, sideShorthandSet } from './base';
import { stringifyKeyword, stringifyNumber, stringifySize } from './stringify';

export const POSITION_SCHEMA = {
  top: sizeEntry('top', ['auto', 'inherit']),
  right: sizeEntry('right', ['auto', 'inherit']),
  bottom: sizeEntry('bottom', ['auto', 'inherit']),
  left: sizeEntry('left', ['auto', 'inherit']),
  clear: entry('clear', stringifyKeyword, (v) =>
    v.keyword('none', 'left', 'right', 'both', 'inherit'),
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
  width: sizeEntry('width', ['auto', 'inherit']),
  height: sizeEntry('height', ['auto', 'inherit']),
  minWidth: sizeEntry('minWidth', ['inherit']),
  minHeight: sizeEntry('minHeight', ['inherit']),
  maxWidth: sizeEntry('maxWidth', ['none', 'inherit']),
  maxHeight: sizeEntry('maxHeight', ['none', 'inherit']),
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
  overflow: entry('overflow', stringifyKeyword, (v) =>
    v.keyword('visible', 'hidden', 'scroll', 'auto', 'inherit'),
  ),
  position: entry('position', stringifyKeyword, (v) =>
    v.keyword('static', 'relative', 'absolute', 'fixed', 'inherit'),
  ),
  visibility: entry('visiblity', stringifyKeyword, (v) =>
    v.keyword('visible', 'hidden', 'collapse', 'inherit'),
  ),
  zIndex: entry('zIndex', stringifyNumber, (v) =>
    v.oneOf(
      () => v.keyword('auto', 'inherit'),
      () => v.cssNumber(),
    ),
  ),
};
