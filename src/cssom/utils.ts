import { HTMLElement } from '../html/HTMLElement';
import { parseSelectors } from '../parser/selector';

export const kebabize = (str: string) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase(),
  );

export function getSpecificity(
  element: HTMLElement,
  selectorText: string,
): number {
  const selector = parseSelectors(selectorText);
}
