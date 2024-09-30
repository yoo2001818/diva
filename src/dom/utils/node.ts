import { Node } from '../Node';

export function ensurePreInsertionValidity(parent: Node, node: Node): void {
  if (
    parent.nodeType !== Node.DOCUMENT_NODE &&
    parent.nodeType !== Node.DOCUMENT_FRAGMENT_NODE &&
    parent.nodeType !== Node.ELEMENT_NODE
  ) {
    throw new DOMException(
      'Parent cannot contain nodes',
      'HierarchyRequestError',
    );
  }
  if (node.contains(parent)) {
    throw new DOMException('Node contains parents', 'HierarchyRequestError');
  }
  if (
    node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE &&
    node.nodeType !== Node.DOCUMENT_TYPE_NODE &&
    node.nodeType !== Node.ELEMENT_NODE &&
    node.nodeType !== Node.TEXT_NODE &&
    node.nodeType !== Node.COMMENT_NODE &&
    node.nodeType !== Node.CDATA_SECTION_NODE
  ) {
    throw new DOMException(
      'Node cannot have a parent',
      'HierarchyRequestError',
    );
  }
  if (
    parent.nodeType === Node.DOCUMENT_NODE &&
    node.nodeType === Node.TEXT_NODE
  ) {
    throw new DOMException(
      'Document cannot directly contain text',
      'HierarchyRequestError',
    );
  }
  // https://dom.spec.whatwg.org/#mutation-algorithms
  // clause 6 is not implemented
}
