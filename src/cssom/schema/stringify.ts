import equal from 'deep-equal';
import {
  CSSColor,
  CSSHash,
  CSSIndentifier,
  CSSKeyword,
  CSSLength,
  CSSNumber,
  CSSPercentage,
  CSSRgb,
  CSSString,
  CSSUrl,
} from '../dict';

export function stringifyLength(value: CSSLength): string {
  return String(value.value) + (value.unit ?? '');
}

export function stringifyPercentage(value: CSSPercentage): string {
  return String(value.value) + '%';
}

export function stringifyKeyword<T extends string>(
  value: CSSKeyword<T>,
): string {
  return String(value.type);
}

export function stringifySize(
  value: CSSLength | CSSPercentage | CSSNumber | CSSKeyword<any>,
): string {
  switch (value.type) {
    case 'number':
      return stringifyNumber(value as CSSNumber);
    case 'percentage':
      return stringifyPercentage(value as CSSPercentage);
    case 'length':
      return stringifyLength(value as CSSLength);
    default:
      return stringifyKeyword(value);
  }
}

export function stringifySideShorthand<T>(
  value: [T, T, T, T],
  stringify: (value: T) => string,
): string {
  // top right bottom left
  const tbEquals = equal(value[0], value[2]);
  const rlEquals = equal(value[1], value[3]);
  const trEquals = equal(value[0], value[1]);
  if (tbEquals && rlEquals && trEquals) {
    return stringify(value[0]);
  } else if (tbEquals && rlEquals) {
    return [value[0], value[1]].map((v) => stringify(v)).join(' ');
  } else if (rlEquals) {
    return [value[0], value[1], value[2]].map((v) => stringify(v)).join(' ');
  } else {
    return value.map((v) => stringify(v)).join(' ');
  }
}

export function stringifyIdentifier(value: CSSIndentifier): string {
  return value.value;
}

export function stringifyFontFamily(
  value: (CSSString | CSSIndentifier)[],
): string {
  return value
    .map((item) =>
      item.type === 'string' ? `"${item.value}"` : stringifyIdentifier(item),
    )
    .join(', ');
}

export function stringifyColor<T extends string>(
  value: CSSColor | CSSKeyword<T>,
): string {
  switch (value.type) {
    case 'hash':
      return `#${(value as CSSHash).value}`;
    case 'identifier':
      return stringifyIdentifier(value as CSSIndentifier);
    case 'rgb': {
      const rgb = value as CSSRgb;
      return `rgb(${rgb.args[0]}, ${rgb.args[1]}, ${rgb.args[2]})`;
    }
    default:
      return stringifyKeyword(value as CSSKeyword<any>);
  }
}

export function stringifyUrl<T extends string>(
  value: CSSUrl | CSSKeyword<T>,
): string {
  switch (value.type) {
    case 'url':
      return `url(${(value as CSSUrl).value})`;
    default:
      return stringifyKeyword(value as CSSKeyword<any>);
  }
}

export function stringifyNumber<T extends string>(
  value: CSSNumber | CSSKeyword<T>,
): string {
  switch (value.type) {
    case 'number':
      return String((value as CSSNumber).value);
    default:
      return stringifyKeyword(value as CSSKeyword<any>);
  }
}
