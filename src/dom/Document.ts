import { ChildNode } from './ChildNode';
import { Element } from './Element';
import { HTMLCollection } from './HTMLCollection';
import { Node } from './Node';
import { NodeList } from './NodeList';
import { ParentNode } from './ParentNode';
import { Text } from './Text';

export class Document extends Node implements ParentNode, ChildNode {
  constructor() {
    super(null);
    this._document = this;
  }

  get nodeType(): number {
    return Node.DOCUMENT_NODE;
  }

  get nodeName(): string {
    return '#document';
  }

  get nodeValue(): string | null {
    return null;
  }

  get implementation(): DOMImplementation {
    throw new Error('Method not implemented.');
  }

  get URL(): string {
    throw new Error('Method not implemented.');
  }

  get documentURI(): string {
    throw new Error('Method not implemented.');
  }

  get compatMode(): string {
    throw new Error('Method not implemented.');
  }

  get characterSet(): string {
    throw new Error('Method not implemented.');
  }

  get charset(): string {
    return this.characterSet;
  }

  get inputEncoding(): string {
    return this.characterSet;
  }

  get contentType(): string {
    throw new Error('Method not implemented.');
  }

  get doctype(): DocumentType | null {
    throw new Error('Method not implemented.');
  }

  get documentElement(): Element | null {
    throw new Error('Method not implemented.');
  }

  getElementsByTagName(qualifiedName: string): HTMLCollection {
    throw new Error('Method not implemented.');
  }

  getElementsByTagNameNS(
    namespace: string | null,
    localName: string,
  ): HTMLCollection {
    throw new Error('Method not implemented.');
  }

  getElementsByClassName(classNames: string): HTMLCollection {
    throw new Error('Method not implemented.');
  }

  createElement(
    localName: string,
    options?: string | ElementCreationOptions,
  ): Element {
    throw new Error('Method not implemented.');
  }

  createElementNS(
    namespace: string | null,
    qualifiedName: string,
    options?: string | ElementCreationOptions,
  ): Element {
    throw new Error('Method not implemented.');
  }

  createDocumentFragment(): DocumentFragment {
    throw new Error('Method not implemented.');
  }

  createTextNode(data: string): Text {
    throw new Error('Method not implemented.');
  }

  createCDATASection(data: string): CDATASection {
    throw new Error('Method not implemented.');
  }

  createComment(data: string): Comment {
    throw new Error('Method not implemented.');
  }

  createProcessingInstruction(
    target: string,
    data: string,
  ): ProcessingInstruction {
    throw new Error('Method not implemented.');
  }

  importNode(node: Node, deep: boolean = false): Node {
    throw new Error('Method not implemented.');
  }

  adoptNode(node: Node): Node {
    throw new Error('Method not implemented.');
  }

  createAttribute(localName: string): Attr {
    throw new Error('Method not implemented.');
  }

  createAttributeNS(namespace: string | null, qualifiedName: string): Attr {
    throw new Error('Method not implemented.');
  }

  createEvent(interfaceName: string): Event {
    throw new Error('Method not implemented.');
  }

  createRange(): Range {
    throw new Error('Method not implemented.');
  }

  createNodeIterator(
    root: Node,
    whatToShow: number = 0xffffffff,
    filter: NodeFilter | null = null,
  ): NodeIterator {
    throw new Error('Method not implemented.');
  }

  createTreeWalker(
    root: Node,
    whatToShow: number = 0xffffffff,
    filter: NodeFilter | null = null,
  ): TreeWalker {
    throw new Error('Method not implemented.');
  }

  get children(): HTMLCollection {
    throw new Error('Method not implemented.');
  }

  get firstElementChild(): Element | null {
    throw new Error('Method not implemented.');
  }

  get lastElementChild(): Element | null {
    throw new Error('Method not implemented.');
  }

  get childElementCount(): number {
    throw new Error('Method not implemented.');
  }

  prepend(...nodes: (Node | string)[]): void {
    throw new Error('Method not implemented.');
  }

  append(...nodes: (Node | string)[]): void {
    throw new Error('Method not implemented.');
  }

  replaceChildren(...nodes: (Node | string)[]): void {
    throw new Error('Method not implemented.');
  }

  querySelector(selectors: string): Element | null {
    throw new Error('Method not implemented.');
  }

  querySelectorAll(selectors: string): NodeList {
    throw new Error('Method not implemented.');
  }

  before(...nodes: (Node | string)[]): void {
    throw new Error('Method not implemented.');
  }

  after(...nodes: (Node | string)[]): void {
    throw new Error('Method not implemented.');
  }

  replaceWith(...nodes: (Node | string)[]): void {
    throw new Error('Method not implemented.');
  }

  remove(): void {
    throw new Error('Method not implemented.');
  }
}
