import { entry, sizeEntry } from './base';
import {
  stringifyColor,
  stringifySize,
  stringifyKeyword,
  stringifyNumber,
} from './stringify';

export const TEXT_SCHEMA = {
  color: entry('color', stringifyColor, (v) =>
    v.oneOf(
      () => v.keyword('inherit'),
      () => v.color(),
    ),
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
  whiteSpace: entry('whiteSpace', stringifyKeyword, (v) =>
    v.keyword('normal', 'pre', 'nowrap', 'pre-wrap', 'pre-line', 'inherit'),
  ),
  wordSpacing: entry('wordSpacing', stringifySize, (v) =>
    v.oneOf(
      () => v.keyword('normal', 'inherit'),
      () => v.length(),
    ),
  ),
};
