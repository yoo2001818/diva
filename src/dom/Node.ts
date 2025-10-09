import { Document } from './Document';
import { Element } from './Element';
import {
  mutationRecordChildListChanged,
  MutationRecord,
} from './MutationRecord';
import { NodeList, NodeListImpl } from './NodeList';
import { RecursiveSignal, Signal } from './Signal';
import { ensurePreInsertionValidity } from './utils/node';
import { nodeRecursiveSignalRegisterFn } from './utils/signal';

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
  _childListChangedSignal = new Signal<[MutationRecord]>();
  _parentSetSignal = new Signal<[]>();
  _parentUnsetSignal = new Signal<[]>();
  _childListChangedRecursiveSignal: Signal<[MutationRecord]> =
    new RecursiveSignal<[MutationRecord]>(
      nodeRecursiveSignalRegisterFn(
        this,
        this._childListChangedSignal,
        (node) => node._childListChangedRecursiveSignal,
      ),
    );
  _attributesChangedRecursiveSignal: Signal<[MutationRecord]> =
    new RecursiveSignal<[MutationRecord]>(
      nodeRecursiveSignalRegisterFn(
        this,
        null,
        (node) => node._attributesChangedRecursiveSignal,
      ),
    );
  _characterDataChangedRecursiveSignal: Signal<[MutationRecord]> =
    new RecursiveSignal<[MutationRecord]>(
      nodeRecursiveSignalRegisterFn(
        this,
        null,
        (node) => node._characterDataChangedRecursiveSignal,
      ),
    );

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

  set textContent(_value: string | null) {}

  normalize(): void {
    throw new Error('Method not implemented.');
  }

  cloneNode(deep: boolean = false): Node {
    const node = this._cloneNodeSelf();
    if (deep) {
      for (const child of this._childNodes) {
        const childNew = child.cloneNode(deep);
        node.appendChild(childNew);
      }
    }
    return node;
  }

  _cloneNodeSelf(): Node {
    throw new Error('Method not implemented.');
  }

  isEqualNode(otherNode: Node | null): boolean {
    if (otherNode == null) {
      return false;
    }
    if (this.nodeType !== otherNode.nodeType) {
      return false;
    }
    if (!this._isEqualNodeSelf(otherNode)) {
      return false;
    }
    if (this._childNodes.length !== otherNode._childNodes.length) {
      return false;
    }
    for (let i = 0; i < this._childNodes.length; i += 1) {
      if (!this._childNodes[i].isEqualNode(otherNode._childNodes[i])) {
        return false;
      }
    }
    return true;
  }

  _isEqualNodeSelf(_otherNode: Node | null): boolean {
    throw new Error('Method not implemented.');
  }

  isSameNode(otherNode: Node | null): boolean {
    return this === otherNode;
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
    if (other == null) {
      return false;
    }
    let parent = other._parent;
    while (parent != null) {
      if (parent === this) {
        return true;
      }
      parent = parent._parent;
    }
    return false;
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
    ensurePreInsertionValidity(this, node);
    let nodes = [node];
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      nodes = [...node._childNodes];
    }
    for (let i = 0; i < nodes.length; i += 1) {
      const item = nodes[i];
      if (item._parent != null) {
        item._parent.removeChild(item);
      }
      item._parent = this;
      item._parentIndex = index + i;
      this._childNodes.splice(index + i, 0, item);
      item._parentSetSignal.emit();
    }
    for (let i = index + nodes.length; i < this._childNodes.length; i += 1) {
      const node = this._childNodes[i];
      node._parentIndex = i;
    }
    this._childListChangedSignal.emit(
      mutationRecordChildListChanged(
        this,
        nodes,
        [],
        this._childNodes[index + nodes.length] ?? null,
        this._childNodes[index - 1] ?? null,
      ),
    );
    return node;
  }

  appendChild(node: Node): Node {
    return this.insertBefore(node, null);
  }

  replaceChild(node: Node, child: Node): Node {
    if (child.parentNode !== this) {
      throw new DOMException('', 'NotFoundError');
    }
    ensurePreInsertionValidity(this, node);
    const index = child._parentIndex!;
    child._parent = null;
    child._parentIndex = null;
    child._parentUnsetSignal.emit();
    let nodes = [node];
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      nodes = node._childNodes;
    }
    if (nodes.length === 0) {
      this._childNodes.splice(index, 1);
    }
    for (let i = 0; i < nodes.length; i += 1) {
      const item = nodes[i];
      if (item._parent != null) {
        item._parent.removeChild(node);
      }
      item._parent = this;
      item._parentIndex = index + i;
      if (i === 0) {
        this._childNodes[index] = item;
      } else {
        this._childNodes.splice(index + i, 0, item);
      }
      item._parentSetSignal.emit();
    }
    if (nodes.length !== 1) {
      for (
        let i = index + nodes.length - 1;
        i < this._childNodes.length;
        i += 1
      ) {
        const node = this._childNodes[i];
        node._parentIndex = i;
      }
    }
    this._childListChangedSignal.emit(
      mutationRecordChildListChanged(
        this,
        nodes,
        [child],
        this._childNodes[index + nodes.length] ?? null,
        this._childNodes[index - 1] ?? null,
      ),
    );
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
    child._parentUnsetSignal.emit();
    this._childListChangedSignal.emit(
      mutationRecordChildListChanged(
        this,
        [],
        [child],
        this._childNodes[index] ?? null,
        this._childNodes[index - 1] ?? null,
      ),
    );
    return child;
  }
}
