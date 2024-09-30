import { Element } from '../Element';
import { Node } from '../Node';
import { NodeList } from '../NodeList';

export function elementPreviousElementSibling(node: Node): Element | null {
  const parent = node.parentElement;
  if (parent == null) {
    return null;
  }
  for (let i = node._parentIndex! + 1; i < parent._childNodes.length; i += 1) {
    const item = parent._childNodes[i];
    if (item.nodeType === Node.ELEMENT_NODE) {
      return item as Element;
    }
  }
  return null;
}

export function elementNextElementSibling(node: Node): Element | null {
  const parent = node.parentElement;
  if (parent == null) {
    return null;
  }
  for (let i = node._parentIndex! - 1; i >= 0; i -= 1) {
    const item = parent._childNodes[i];
    if (item.nodeType === Node.ELEMENT_NODE) {
      return item as Element;
    }
  }
  return null;
}

export function elementPrepend(node: Node, nodes: (Node | string)[]): void {}

export function elementAppend(node: Node, nodes: (Node | string)[]): void {}

export function elementReplaceChildren(
  node: Node,
  nodes: (Node | string)[],
): void {}

export function elementBefore(node: Node, nodes: (Node | string)[]): void {}

export function elementAfter(node: Node, nodes: (Node | string)[]): void {}

export function elementReplaceWith(
  node: Node,
  nodes: (Node | string)[],
): void {}

export function elementRemove(node: Node): void {
  node._parent?.removeChild(node);
}

export function elementQuerySelector(
  node: Node,
  selectors: string,
): Element | null {}

export function elementQuerySelectorAll(
  node: Node,
  selectors: string,
): NodeList {}

export function elementGetElementById(elementId: string): Element | null {}
