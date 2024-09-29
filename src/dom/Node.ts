import { Document } from './Document';
import { Element } from './Element';
import { NodeList, NodeListImpl } from './NodeList';

export class Node {
  static readonly ELEMENT_NODE: number = 1;
  static readonly ATTRIBUTE_NODE: number = 2;
  static readonly TEXT_NODE: number = 3;
  static readonly CDATA_SECTION_NODE: number = 4;
  static readonly ENTITY_REFERENCE_NODE: number = 5; // legacy
  static readonly ENTITY_NODE: number = 6; // legacy
  static readonly PROCESSING_INSTRUCTION_NODE: number = 7;
  static readonly COMMENT_NODE: number = 8;
  static readonly DOCUMENT_NODE: number = 9;
  static readonly DOCUMENT_TYPE_NODE: number = 10;
  static readonly DOCUMENT_FRAGMENT_NODE: number = 11;
  static readonly NOTATION_NODE: number = 12; // legacy

  _document: Document | null;
  _parent: Node | null = null;
  _parentIndex: number | null = null;
  _childNodes: NodeListImpl = new NodeListImpl();

  constructor(document: Document | null) {
    this._document = document;
  }

  get nodeType(): number {
    throw new Error('Method not implemented.');
  }

  get nodeName(): string {
    throw new Error('Method not implemented.');
  }

  get baseURI(): string {
    return '';
  }

  get isConnected(): boolean {
    const root = this.getRootNode();
    return root.nodeType === Node.DOCUMENT_NODE;
  }

  get ownerDocument(): Document | null {
    return this._document;
  }

  getRootNode(_options: GetRootNodeOptions = {}): Node {
    let parent = this._parent;
    while (parent != null && parent.parentNode != null) {
      parent = parent.parentNode;
    }
    return parent!;
  }

  get parentNode(): Node | null {
    return this._parent;
  }

  get parentElement(): Element | null {
    let parent = this._parent;
    while (parent != null) {
      if (parent.nodeType === Node.ELEMENT_NODE) {
        return parent as Element;
      }
      parent = parent.parentNode;
    }
    return null;
  }

  hasChildNodes(): boolean {
    return this._childNodes.length > 0;
  }

  get childNodes(): NodeList {
    return this._childNodes;
  }

  get firstChild(): Node | null {
    return this._childNodes[0] ?? null;
  }

  get lastChild(): Node | null {
    return this._childNodes[this._childNodes.length - 1] ?? null;
  }

  get previousSibling(): Node | null {
    if (this._parent == null) {
      return null;
    }
    if (this._parentIndex == null || this._parentIndex <= 0) {
      return null;
    }
    return this._parent._childNodes[this._parentIndex - 1];
  }

  get nextSibling(): Node | null {
    if (this._parent == null) {
      return null;
    }
    if (
      this._parentIndex == null ||
      this._parentIndex >= this._parent._childNodes.length - 1
    ) {
      return null;
    }
    return this._parent._childNodes[this._parentIndex + 1];
  }

  get nodeValue(): string | null {
    return null;
  }

  set nodeValue(_value: string | null) {}

  get textContent(): string | null {
    return null;
  }

  set textContent(value: string | null) {}

  normalize(): void {
    throw new Error('Method not implemented.');
  }

  cloneNode(deep: boolean = false): Node {
    throw new Error('Method not implemented.');
  }

  isEqualNode(otherNode: Node | null): boolean {
    throw new Error('Method not implemented.');
  }

  isSameNode(otherNode: Node | null): boolean {
    throw new Error('Method not implemented.');
  }

  static readonly DOCUMENT_POSITION_DISCONNECTED: number = 0x01;
  static readonly DOCUMENT_POSITION_PRECEDING: number = 0x02;
  static readonly DOCUMENT_POSITION_FOLLOWING: number = 0x04;
  static readonly DOCUMENT_POSITION_CONTAINS: number = 0x08;
  static readonly DOCUMENT_POSITION_CONTAINED_BY: number = 0x10;
  static readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number = 0x20;

  compareDocumentPosition(other: Node): number {
    throw new Error('Method not implemented.');
  }

  contains(other: Node | null): boolean {
    throw new Error('Method not implemented.');
  }

  lookupPrefix(namespace: string | null): string | null {
    throw new Error('Method not implemented.');
  }

  lookupNamespaceURI(prefix: string | null): string | null {
    throw new Error('Method not implemented.');
  }

  isDefaultNamespace(namespace: string): boolean {
    throw new Error('Method not implemented.');
  }

  insertBefore(node: Node, child: Node | null): Node {
    let index = this._childNodes.length;
    if (child != null) {
      if (child.parentNode !== this) {
        throw new DOMException('', 'NotFoundError');
      }
      index = child._parentIndex!;
    }
    // FIXME: Ensure pre-insertion validity
    if (node._parent != null) {
      node._parent.removeChild(node);
    }
    node._parent = this;
    node._parentIndex = index;
    this._childNodes.splice(index, 0, node);
    for (let i = index + 1; i < this._childNodes.length; i += 1) {
      const node = this._childNodes[i];
      node._parentIndex = i;
    }
    return node;
  }

  appendChild(node: Node): Node {
    return this.insertBefore(node, null);
  }

  replaceChild(node: Node, child: Node): Node {
    // FIXME: Ensure node is not a inclusive ancestor of parent
    if (child.parentNode !== this) {
      throw new DOMException('', 'NotFoundError');
    }
    // FIXME: Ensure pre-insertion validity
    const index = child._parentIndex!;
    this.removeChild(child);
    if (node._parent != null) {
      node._parent.removeChild(node);
    }
    node._parent = this;
    node._parentIndex = index;
    this._childNodes[index] = node;
    return child;
  }

  removeChild(child: Node): Node {
    if (child.parentNode !== this) {
      throw new DOMException('', 'NotFoundError');
    }
    const index = child._parentIndex!;
    child._parent = null;
    child._parentIndex = null;
    this._childNodes.splice(index, 1);
    for (let i = index; i < this._childNodes.length; i += 1) {
      const node = this._childNodes[i];
      node._parentIndex = i;
    }
    return child;
  }
}
