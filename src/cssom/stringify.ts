import equal from 'deep-equal';
import {
  CSSColor,
  CSSKeyword,
  CSSLength,
  CSSNumber,
  CSSPercentage,
  CSSUrl,
} from './dict';

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
  value: CSSLength | CSSPercentage | CSSKeyword<any>,
): string {
  switch (value.type) {
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

export function stringifyColor<T extends string>(
  value: CSSColor | CSSKeyword<T>,
): string {
  return String(value.type);
}

export function stringifyUrl<T extends string>(
  value: CSSUrl | CSSKeyword<T>,
): string {
  return String(value.type);
}

export function stringifyNumber<T extends string>(
  value: CSSNumber | CSSKeyword<T>,
): string {
  return String(value.type);
}
