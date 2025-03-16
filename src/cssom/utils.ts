import {
  getComplexSelectorSpecificity,
  matchComplexSelector,
} from '../dom/utils/selector';
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
  const selectors = parseSelectors(selectorText);
  // We just need to know WHICH rule is selected
  let specificity = 0;
  for (const selector of selectors) {
    if (matchComplexSelector(element, selector)) {
      const current = getComplexSelectorSpecificity(selector);
      if (current > specificity) {
        specificity = current;
      }
    }
  }
  return specificity;
}
