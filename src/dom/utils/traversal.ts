import { Element } from '../Element';
import { Node } from '../Node';

export function* traverseNode(node: Node): Generator<Node, void> {
  yield node;
  const nodes = node.childNodes;
  for (let i = 0; i < nodes.length; i += 1) {
    yield* traverseNode(nodes[i]);
  }
}

export function* traverseElements(node: Node): Generator<Element, void> {
  if (node.nodeType === Node.ELEMENT_NODE) {
    yield node as Element;
  }
  const nodes = node.childNodes;
  for (let i = 0; i < nodes.length; i += 1) {
    yield* traverseElements(nodes[i]);
  }
}
