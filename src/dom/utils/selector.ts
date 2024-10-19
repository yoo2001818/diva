import {
  Combinator,
  ComplexSelector,
  CompoundSelector,
  SimpleSelector,
} from '../../parser/selector';
import { Element } from '../Element';

function matchSimpleSelector(
  element: Element,
  selector: SimpleSelector,
): boolean {
  switch (selector.type) {
    case 'attributeSelector': {
      let attr = element.getAttribute(selector.name);
      if (attr == null) return false;
      if (selector.value != null) {
        let value = selector.value;
        switch (selector.modifier) {
          case 'i':
            attr = attr.toLowerCase();
            value = value.toLowerCase();
            break;
          case 's':
            break;
        }
        switch (selector.matcher) {
          case '=':
            return attr === value;
          case '$=':
            return attr.endsWith(value);
          case '^=':
            return attr.startsWith(value);
          case '*=':
            return attr.includes(value);
          case '|=':
            return attr === value || attr.startsWith(value + '-');
          case '~=': {
            const list = attr.split(/\s+/);
            return list.includes(value);
          }
        }
      }
      return true;
    }
    case 'classSelector': {
      return element.classList.contains(selector.name);
    }
    case 'idSelector': {
      return element.id === selector.name;
    }
    case 'pseudoSelector': {
      // TODO: Implement pseudo selectors
      return false;
    }
    case 'typeSelector': {
      return element.tagName === selector.name.toUpperCase();
    }
  }
}

function matchCompoundSelector(
  element: Element,
  selector: CompoundSelector,
): boolean {
  // TODO: Pseudo elements need to be taken account of as well, however it's
  // impossible to match real elements with selectors specifying pseudo elements.
  return selector.children.every((v) => matchSimpleSelector(element, v));
}

function getCombinatorCandidates(
  element: Element,
  combinator: Combinator,
): Element[] {
  switch (combinator.name) {
    case ' ': {
      const parents: Element[] = [];
      let current = element.parentElement;
      while (current != null) {
        parents.push(current);
        current = current.parentElement;
      }
      return parents;
    }
    case '>': {
      const parent = element.parentElement;
      return parent ? [parent] : [];
    }
    case '+': {
      const prev = element.previousElementSibling;
      return prev ? [prev] : [];
    }
    case '~': {
      const siblings: Element[] = [];
      let current = element.previousElementSibling;
      while (current != null) {
        siblings.push(current);
        current = current.previousElementSibling;
      }
      return siblings;
    }
    case '||':
    default:
      return [];
  }
}

function matchComplexSelector(
  element: Element,
  selector: ComplexSelector,
): boolean {
  // Starting from the last selector, navigate the hierarchy of selectors.
  // If there's an adequate node that matches further condition, that node
  // will be used for matching further selectors and combinators.
  // - ' ' selector would start traversing up.
  // - '>' selector would use the parent node solely.
  // - '~' selector would start traversing left.
  // - '+' selector would use the previous sibling node solely.
  // - '||' selector is unfortunately dependent on grid implementation,
  //   which we don't have.
  const children = selector.children;
  const lastSelector = children[children.length - 1] as CompoundSelector;
  let currentNode = element;
  if (!matchCompoundSelector(currentNode, lastSelector)) {
    return false;
  }
  for (let i = children.length - 2; i >= 0; i -= 2) {
    const combinator = children[i] as Combinator;
    const selector = children[i - 1] as CompoundSelector;
    const candidates = getCombinatorCandidates(currentNode, combinator);
    const candidate = candidates.find((v) =>
      matchCompoundSelector(v, selector),
    );
    if (candidate != null) {
      currentNode = candidate;
    } else {
      return false;
    }
  }
  return true;
}

export function matchSelector(
  element: Element,
  selector: ComplexSelector[],
): boolean {
  return selector.some((v) => matchComplexSelector(element, v));
}
