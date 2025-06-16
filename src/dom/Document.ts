import { StyleSheetList } from '../cssom/StyleSheetList';
import { createHTMLElement } from '../html/createHTMLElement';
import { Attr } from './Attr';
import { CDATASection } from './CDATASection';
import { ChildNode } from './ChildNode';
import { Comment } from './Comment';
import { DocumentFragment } from './DocumentFragment';
import { Element } from './Element';
import { HTMLCollection, HTMLCollectionImpl } from './HTMLCollection';
import { Node } from './Node';
import { NodeList } from './NodeList';
import { NonElementParentNode } from './NonElementParentNode';
import { ParentNode } from './ParentNode';
import { Text } from './Text';
import {
  elementAfter,
  elementAppend,
  elementBefore,
  elementGetElementById,
  elementGetElementsByClassName,
  elementGetElementsByTagName,
  elementGetElementsByTagNameNS,
  elementPrepend,
  elementQuerySelector,
  elementQuerySelectorAll,
  elementReplaceChildren,
  elementReplaceWith,
} from './utils/element';

export class Document
  extends Node
  implements ParentNode, ChildNode, NonElementParentNode
{
  _styleSheets: StyleSheetList;

  constructor() {
    super(null);
    this._document = this;
    this._styleSheets = new StyleSheetList();
    this.appendChild(this.createElement('html'));
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
    return (this._childNodes[0] as Element) ?? null;
  }

  getElementsByTagName(qualifiedName: string): HTMLCollection {
    return elementGetElementsByTagName(this, qualifiedName);
  }

  getElementsByTagNameNS(
    namespace: string | null,
    localName: string,
  ): HTMLCollection {
    return elementGetElementsByTagNameNS(this, namespace, localName);
  }

  getElementsByClassName(classNames: string): HTMLCollection {
    return elementGetElementsByClassName(this, classNames);
  }

  createElement(
    localName: string,
    _options?: string | ElementCreationOptions,
  ): Element {
    return createHTMLElement(this, localName, _options);
  }

  createElementNS(
    _namespace: string | null,
    qualifiedName: string,
    _options?: string | ElementCreationOptions,
  ): Element {
    return new Element(this, qualifiedName);
  }

  createDocumentFragment(): DocumentFragment {
    return new DocumentFragment(this);
  }

  createTextNode(data: string): Text {
    return new Text(this, data);
  }

  createCDATASection(data: string): CDATASection {
    return new CDATASection(this, data);
  }

  createComment(data: string): Comment {
    return new Comment(this, data);
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
    return new Attr(this, localName);
  }

  createAttributeNS(_namespace: string | null, qualifiedName: string): Attr {
    return new Attr(this, qualifiedName);
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
    return new HTMLCollectionImpl(() =>
      this._childNodes.filter(
        (v): v is Element => v.nodeType === Node.ELEMENT_NODE,
      ),
    );
  }

  get firstElementChild(): Element | null {
    const children = this.children;
    return children[0] ?? null;
  }

  get lastElementChild(): Element | null {
    const children = this.children;
    return children[children.length - 1] ?? null;
  }

  get childElementCount(): number {
    return this.children.length;
  }

  prepend(...nodes: (Node | string)[]): void {
    return elementPrepend(this, nodes);
  }

  append(...nodes: (Node | string)[]): void {
    return elementAppend(this, nodes);
  }

  replaceChildren(...nodes: (Node | string)[]): void {
    return elementReplaceChildren(this, nodes);
  }

  querySelector(selectors: string): Element | null {
    return elementQuerySelector(this, selectors);
  }

  querySelectorAll(selectors: string): NodeList {
    return elementQuerySelectorAll(this, selectors);
  }

  before(...nodes: (Node | string)[]): void {
    return elementBefore(this, nodes);
  }

  after(...nodes: (Node | string)[]): void {
    return elementAfter(this, nodes);
  }

  replaceWith(...nodes: (Node | string)[]): void {
    return elementReplaceWith(this, nodes);
  }

  remove(): void {
    // Noop
  }

  getElementById(elementId: string): Element | null {
    return elementGetElementById(this, elementId);
  }

  get styleSheets(): StyleSheetList {
    return this._styleSheets;
  }

  static parseHTMLUnsafe(html: string): Document {
    throw new Error('Not implemented');
  }

  get location(): Location {
    throw new Error('Not implemented');
  }

  get domain(): string {
    throw new Error('Not implemented');
  }

  set domain(value: string) {
    throw new Error('Not implemented');
  }

  get referrer(): string {
    throw new Error('Not implemented');
  }

  get cookie(): string {
    throw new Error('Not implemented');
  }

  set cookie(value: string) {
    throw new Error('Not implemented');
  }

  get lastModified(): string {
    throw new Error('Not implemented');
  }

  get readyState(): string {
    throw new Error('Not implemented');
  }

  get title(): string {
    throw new Error('Not implemented');
  }

  set title(value: string) {
    throw new Error('Not implemented');
  }

  get dir(): string {
    throw new Error('Not implemented');
  }

  set dir(value: string) {
    throw new Error('Not implemented');
  }

  get body(): Element | null {
    throw new Error('Not implemented');
  }

  set body(value: Element | null) {
    throw new Error('Not implemented');
  }

  get head(): Element | null {
    throw new Error('Not implemented');
  }
}
