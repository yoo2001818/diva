import { Attr } from './Attr';
import { ChildNode } from './ChildNode';
import { Document } from './Document';
import { DOMTokenList } from './DOMTokenList';
import { HTMLCollection } from './HTMLCollection';
import { Node } from './Node';
import { NodeList } from './NodeList';
import { NonDocumentTypeChildNode } from './NonDocumentTypeChildNode';
import { ParentNode } from './ParentNode';

export class Element
  extends Node
  implements ParentNode, ChildNode, NonDocumentTypeChildNode
{
  tagName: string;
  constructor(document: Document, tagName: string) {
    super(document);
    this.tagName = tagName.toUpperCase();
  }

  get nodeType(): number {
    return Node.ELEMENT_NODE;
  }

  get nodeName(): string {
    return this.tagName;
  }

  get nodeValue(): string | null {
    return null;
  }

  get namespaceURI(): string | null {
    throw new Error('Method not implemented.');
  }

  get prefix(): string | null {
    throw new Error('Method not implemented.');
  }

  get localName(): string {
    throw new Error('Method not implemented.');
  }

  get id(): string {
    throw new Error('Method not implemented.');
  }

  set id(value: string) {
    throw new Error('Method not implemented.');
  }

  get className(): string {
    throw new Error('Method not implemented.');
  }

  set className(value: string) {
    throw new Error('Method not implemented.');
  }

  get classList(): DOMTokenList {
    throw new Error('Method not implemented.');
  }

  get slot(): string {
    throw new Error('Method not implemented.');
  }

  set slot(value: string) {
    throw new Error('Method not implemented.');
  }

  hasAttributes(): boolean {
    throw new Error('Method not implemented.');
  }

  get attributes(): NamedNodeMap {
    throw new Error('Method not implemented.');
  }

  getAttributeNames(): string[] {
    throw new Error('Method not implemented.');
  }

  getAttribute(qualifiedName: string): string | null {
    throw new Error('Method not implemented.');
  }

  getAttributeNS(namespace: string | null, localName: string): string | null {
    throw new Error('Method not implemented.');
  }

  setAttribute(qualifiedName: string, value: string): void {
    throw new Error('Method not implemented.');
  }

  setAttributeNS(
    namespace: string | null,
    qualifiedName: string,
    value: string,
  ): void {
    throw new Error('Method not implemented.');
  }

  removeAttribute(qualifiedName: string): void {
    throw new Error('Method not implemented.');
  }

  removeAttributeNS(namespace: string | null, localName: string): void {
    throw new Error('Method not implemented.');
  }

  toggleAttribute(qualifiedName: string, force?: boolean): boolean {
    throw new Error('Method not implemented.');
  }

  hasAttribute(qualifiedName: string): boolean {
    throw new Error('Method not implemented.');
  }

  hasAttributeNS(namespace: string | null, localName: string): boolean {
    throw new Error('Method not implemented.');
  }

  getAttributeNode(qualifiedName: string): Attr | null {
    throw new Error('Method not implemented.');
  }

  getAttributeNodeNS(namespace: string | null, localName: string): Attr | null {
    throw new Error('Method not implemented.');
  }

  setAttributeNode(attr: Attr): Attr | null {
    throw new Error('Method not implemented.');
  }

  setAttributeNodeNS(attr: Attr): Attr | null {
    throw new Error('Method not implemented.');
  }

  removeAttributeNode(attr: Attr): Attr {
    throw new Error('Method not implemented.');
  }

  attachShadow(init: ShadowRootInit): ShadowRoot {
    throw new Error('Method not implemented.');
  }

  get shadowRoot(): ShadowRoot | null {
    throw new Error('Method not implemented.');
  }

  closest(selectors: string): Element | null {
    throw new Error('Method not implemented.');
  }

  matches(selectors: string): boolean {
    throw new Error('Method not implemented.');
  }

  webkitMatchesSelector(selectors: string): boolean {
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

  insertAdjacentElement(where: string, element: Element): Element | null {
    throw new Error('Method not implemented.');
  }

  insertAdjacentText(where: string, data: string): void {
    throw new Error('Method not implemented.');
  }

  get innerHTML(): string {
    throw new Error('Method not implemented.');
  }

  set innerHTML(value: string) {
    throw new Error('Method not implemented.');
  }

  get outerHTML(): string {
    throw new Error('Method not implemented.');
  }

  set outerHTML(value: string) {
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

  get previousElementSibling(): Element | null {
    throw new Error('Method not implemented.');
  }

  get nextElementSibling(): Element | null {
    throw new Error('Method not implemented.');
  }

  get textContent(): string | null {
    return this._childNodes.map((v) => v.textContent).join('');
  }

  set textContent(value: string) {
    const childNodes = [...this._childNodes];
    for (const node of childNodes) {
      this.removeChild(node);
    }
    if (value !== '') {
      const text = this._document!.createTextNode(value);
      this.appendChild(text);
    }
  }

  _cloneNodeSelf(): Node {
    throw new Error('Method not implemented.');
  }

  _isEqualNodeSelf(otherNode: Node | null): boolean {
    throw new Error('Method not implemented.');
  }
}
