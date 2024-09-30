import { Document } from '../Document';
import { Element } from '../Element';
import { Node } from '../Node';
import { NodeList } from '../NodeList';
import { ensurePreInsertionValidity } from './node';

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

export function elementConvertNodes(
  document: Document,
  nodes: (Node | string)[],
): Node {
  const nodes2 = nodes.map((v): Node => {
    if (typeof v === 'string') {
      return document.createTextNode(v);
    }
    return v;
  });
  if (nodes2.length === 1) {
    return nodes2[0];
  }
  const frag = document.createDocumentFragment();
  for (let i = 0; i < nodes2.length; i += 1) {
    frag.appendChild(nodes2[i]);
  }
  return frag;
}

export function elementPrepend(node: Node, nodes: (Node | string)[]): void {
  const child = elementConvertNodes(node.ownerDocument!, nodes);
  node.insertBefore(child, node.firstChild);
}

export function elementAppend(node: Node, nodes: (Node | string)[]): void {
  const child = elementConvertNodes(node.ownerDocument!, nodes);
  node.appendChild(child);
}

export function elementReplaceChildren(
  node: Node,
  nodes: (Node | string)[],
): void {
  const child = elementConvertNodes(node.ownerDocument!, nodes);
  ensurePreInsertionValidity(node, child);
  while (node.lastChild != null) {
    node.removeChild(node.lastChild);
  }
  node.appendChild(child);
}

export function elementBefore(self: Node, nodes: (Node | string)[]): void {
  const parent = self.parentElement;
  if (parent == null) {
    return;
  }
  let viablePreviousSibling = self.previousSibling;
  while (
    viablePreviousSibling != null &&
    nodes.includes(viablePreviousSibling)
  ) {
    viablePreviousSibling = viablePreviousSibling.previousSibling;
  }
  const node = elementConvertNodes(self.ownerDocument!, nodes);
  if (viablePreviousSibling != null) {
    parent.insertBefore(node, viablePreviousSibling.nextSibling);
  } else {
    parent.insertBefore(node, parent.firstChild);
  }
}

export function elementAfter(self: Node, nodes: (Node | string)[]): void {
  const parent = self.parentElement;
  if (parent == null) {
    return;
  }
  let viableNextSibling = self.nextSibling;
  while (viableNextSibling != null && nodes.includes(viableNextSibling)) {
    viableNextSibling = viableNextSibling.nextSibling;
  }
  const node = elementConvertNodes(self.ownerDocument!, nodes);
  parent.insertBefore(node, viableNextSibling);
}

export function elementReplaceWith(self: Node, nodes: (Node | string)[]): void {
  const parent = self.parentElement;
  if (parent == null) {
    return;
  }
  let viableNextSibling = self.nextSibling;
  while (viableNextSibling != null && nodes.includes(viableNextSibling)) {
    viableNextSibling = viableNextSibling.nextSibling;
  }
  const node = elementConvertNodes(self.ownerDocument!, nodes);
  if (self.parentElement === parent) {
    parent.replaceChild(node, self);
  } else {
    parent.insertBefore(node, viableNextSibling);
  }
}

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
