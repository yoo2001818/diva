import { Attr } from './Attr';
import { ChildNode } from './ChildNode';
import { Document } from './Document';
import { DOMTokenList } from './DOMTokenList';
import { HTMLCollection } from './HTMLCollection';
import { NamedNodeMap } from './NamedNodeMap';
import { Node } from './Node';
import { NodeList } from './NodeList';
import { NonDocumentTypeChildNode } from './NonDocumentTypeChildNode';
import { ParentNode } from './ParentNode';

export class Element
  extends Node
  implements ParentNode, ChildNode, NonDocumentTypeChildNode
{
  _tagName: string;
  _id: string = '';
  _classList: DOMTokenList = new DOMTokenList();
  _slot: string = '';
  _attributes: NamedNodeMap = new NamedNodeMap(this);

  constructor(document: Document, tagName: string) {
    super(document);
    this._tagName = tagName.toUpperCase();
  }

  get nodeType(): number {
    return Node.ELEMENT_NODE;
  }

  get nodeName(): string {
    return this._tagName;
  }

  get nodeValue(): string | null {
    return null;
  }

  get tagName(): string {
    return this._tagName;
  }

  get namespaceURI(): string | null {
    return null;
  }

  get prefix(): string | null {
    return null;
  }

  get localName(): string {
    return this._tagName;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get className(): string {
    return this._classList.value;
  }

  set className(value: string) {
    this._classList.value = value;
  }

  get classList(): DOMTokenList {
    return this._classList;
  }

  get slot(): string {
    return this._slot;
  }

  set slot(value: string) {
    this._slot = value;
  }

  hasAttributes(): boolean {
    return this._attributes.length > 0;
  }

  get attributes(): NamedNodeMap {
    return this._attributes;
  }

  getAttributeNames(): string[] {
    return this._attributes._attributes.map((v) => v.name);
  }

  getAttribute(qualifiedName: string): string | null {
    const item = this._attributes.getNamedItem(qualifiedName);
    return item != null ? item.value : null;
  }

  getAttributeNS(namespace: string | null, localName: string): string | null {
    const item = this._attributes.getNamedItemNS(namespace, localName);
    return item != null ? item.value : null;
  }

  setAttribute(qualifiedName: string, value: string): void {
    const item = this._document!.createAttribute(qualifiedName);
    item.value = value;
    this._attributes.setNamedItem(item);
  }

  setAttributeNS(
    namespace: string | null,
    qualifiedName: string,
    value: string,
  ): void {
    const item = this._document!.createAttributeNS(namespace, qualifiedName);
    item.value = value;
    this._attributes.setNamedItemNS(item);
  }

  removeAttribute(qualifiedName: string): void {
    this._attributes.removeNamedItem(qualifiedName);
  }

  removeAttributeNS(namespace: string | null, localName: string): void {
    this._attributes.removeNamedItemNS(namespace, localName);
  }

  toggleAttribute(qualifiedName: string, force?: boolean): boolean {
    if (this.hasAttribute(qualifiedName)) {
      if (force !== true) {
        this.removeAttribute(qualifiedName);
        return false;
      }
      return true;
    } else if (force !== false) {
      this.setAttribute(qualifiedName, '');
      return true;
    }
    return false;
  }

  hasAttribute(qualifiedName: string): boolean {
    const item = this.getAttribute(qualifiedName);
    return item != null;
  }

  hasAttributeNS(namespace: string | null, localName: string): boolean {
    const item = this.getAttributeNS(namespace, localName);
    return item != null;
  }

  getAttributeNode(qualifiedName: string): Attr | null {
    return this._attributes.getNamedItem(qualifiedName);
  }

  getAttributeNodeNS(namespace: string | null, localName: string): Attr | null {
    return this._attributes.getNamedItemNS(namespace, localName);
  }

  setAttributeNode(attr: Attr): Attr | null {
    return this._attributes.setNamedItem(attr);
  }

  setAttributeNodeNS(attr: Attr): Attr | null {
    return this._attributes.setNamedItemNS(attr);
  }

  removeAttributeNode(attr: Attr): Attr {
    if (attr._ownerElement !== this) {
      throw new DOMException('', 'NotFoundError');
    }
    return this._attributes.removeNamedItem(attr.name);
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
