import { Element } from './Element';
import { NodeList } from './NodeList';

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

  get nodeType(): number {
    throw new Error('Method not implemented.');
  }

  get nodeName(): string {
    throw new Error('Method not implemented.');
  }

  get baseURI(): string {
    throw new Error('Method not implemented.');
  }

  get isConnected(): boolean {
    throw new Error('Method not implemented.');
  }

  get ownerDocument(): Document | null {
    throw new Error('Method not implemented.');
  }

  getRootNode(options: GetRootNodeOptions = {}): Node {
    throw new Error('Method not implemented.');
  }

  get parentNode(): Node | null {
    throw new Error('Method not implemented.');
  }

  get parentElement(): Element | null {
    throw new Error('Method not implemented.');
  }

  hasChildNodes(): boolean {
    throw new Error('Method not implemented.');
  }

  get childNodes(): NodeList {
    throw new Error('Method not implemented.');
  }

  get firstChild(): Node | null {
    throw new Error('Method not implemented.');
  }

  get lastChild(): Node | null {
    throw new Error('Method not implemented.');
  }

  get previousSibling(): Node | null {
    throw new Error('Method not implemented.');
  }

  get nextSibling(): Node | null {
    throw new Error('Method not implemented.');
  }

  get nodeValue(): string | null {
    throw new Error('Method not implemented.');
  }

  set nodeValue(value: string | null) {
    throw new Error('Method not implemented.');
  }

  get textContent(): string | null {
    throw new Error('Method not implemented.');
  }

  set textContent(value: string | null) {
    throw new Error('Method not implemented.');
  }

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
    throw new Error('Method not implemented.');
  }

  appendChild(node: Node): Node {
    throw new Error('Method not implemented.');
  }

  replaceChild(node: Node, child: Node): Node {
    throw new Error('Method not implemented.');
  }

  removeChild(child: Node): Node {
    throw new Error('Method not implemented.');
  }
}
