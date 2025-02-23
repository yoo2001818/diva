import { CSSStyleDeclaration } from '../cssom/CSSStyleDeclaration';
import { ComputedStyle } from '../layout/ComputedStyle';
import { StyleData } from '../layout/StyleData';
import { parseHtml } from '../parser/html';
import { ComplexSelector, parseSelectors } from '../parser/selector';
import { Attr } from './Attr';
import { ChildNode } from './ChildNode';
import { Comment } from './Comment';
import { Document } from './Document';
import { DOMTokenList } from './DOMTokenList';
import { HTMLCollection, HTMLCollectionImpl } from './HTMLCollection';
import { NamedNodeMap } from './NamedNodeMap';
import { Node } from './Node';
import { NodeList } from './NodeList';
import { NonDocumentTypeChildNode } from './NonDocumentTypeChildNode';
import { ParentNode } from './ParentNode';
import { Text } from './Text';
import {
  elementAfter,
  elementAppend,
  elementBefore,
  elementGetElementsByClassName,
  elementGetElementsByTagName,
  elementGetElementsByTagNameNS,
  elementNextElementSibling,
  elementPrepend,
  elementPreviousElementSibling,
  elementQuerySelector,
  elementQuerySelectorAll,
  elementRemove,
  elementReplaceChildren,
  elementReplaceWith,
} from './utils/element';
import { htmlEscapeString, htmlIsVoid } from './utils/html';
import { matchSelector } from './utils/selector';

export class Element
  extends Node
  implements ParentNode, ChildNode, NonDocumentTypeChildNode
{
  _tagName: string;
  _id: string = '';
  _classList: DOMTokenList = new DOMTokenList();
  _slot: string = '';
  _attributes: NamedNodeMap = new NamedNodeMap(this);
  _styleData: unknown;
  _computedStyle: ComputedStyle;

  constructor(document: Document, tagName: string) {
    super(document);
    this._tagName = tagName.toUpperCase();
    this._computedStyle = new ComputedStyle(this);
    this._computedStyle.style._onUpdate = () => {
      this._setAttributeInternal('style', this._computedStyle.style.cssText);
    };
    this._classList._onUpdate = () => {
      this._setAttributeInternal('class', this._classList.value);
    };
    this._attributes._setHook('id', {
      set: (value) => {
        this._id = value ?? '';
      },
    });
    this._attributes._setHook('class', {
      set: (value) => {
        this._classList.value = value ?? '';
      },
    });
    this._attributes._setHook('style', {
      set: (value) => {
        this._computedStyle.style.cssText = value ?? '';
      },
    });
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
    this.setAttribute('id', this._id);
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

  _setAttributeInternal(qualifiedName: string, value: string): void {
    const item = this._document!.createAttribute(qualifiedName);
    item.value = value;
    this._attributes._setNamedItem(item, true);
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
    return null;
  }

  closest(selectors: string): Element | null {
    const selector = parseSelectors(selectors);
    let parent = this.parentElement;
    while (parent != null) {
      if (parent._matches(selector)) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  _matches(selector: ComplexSelector[]): boolean {
    return matchSelector(this, selector);
  }

  matches(selectors: string): boolean {
    const selector = parseSelectors(selectors);
    return matchSelector(this, selector);
  }

  webkitMatchesSelector(selectors: string): boolean {
    return this.matches(selectors);
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

  insertAdjacentElement(where: string, element: Element): Element | null {
    throw new Error('Method not implemented.');
  }

  insertAdjacentText(where: string, data: string): void {
    throw new Error('Method not implemented.');
  }

  get innerHTML(): string {
    if (htmlIsVoid(this.tagName)) {
      return '';
    }
    let s = '';
    for (let i = 0; i < this._childNodes.length; i += 1) {
      const node = this._childNodes[i];
      switch (node.nodeType) {
        case Node.ELEMENT_NODE: {
          const elem = node as Element;
          s += elem.outerHTML;
          break;
        }
        case Node.TEXT_NODE: {
          const text = node as Text;
          s += htmlEscapeString(text.data);
          break;
        }
        case Node.COMMENT_NODE: {
          const comment = node as Comment;
          s += '<!--';
          s += comment.data;
          s += '-->';
          break;
        }
      }
    }
    return s;
  }

  set innerHTML(value: string) {
    while (this.lastChild != null) {
      this.removeChild(this.lastChild);
    }
    parseHtml(value, this.ownerDocument!, this);
  }

  get outerHTML(): string {
    let s = '';
    s += '<';
    s += this.tagName.toLowerCase();
    this._attributes._attributes.forEach((attr) => {
      s += ' ';
      s += attr.name;
      s += '="';
      s += htmlEscapeString(attr.value, true);
      s += '"';
    });
    s += '>';
    if (!htmlIsVoid(this.tagName)) {
      s += this.innerHTML;
      s += '</';
      s += this.tagName.toLowerCase();
      s += '>';
    }
    return s;
  }

  set outerHTML(value: string) {
    const frag = this.ownerDocument!.createDocumentFragment();
    parseHtml(value, this.ownerDocument!, frag);
    this.replaceWith(frag);
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
    return elementRemove(this);
  }

  get previousElementSibling(): Element | null {
    return elementPreviousElementSibling(this);
  }

  get nextElementSibling(): Element | null {
    return elementNextElementSibling(this);
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
    const elem = this._document!.createElement(this._tagName);
    elem.id = this.id;
    elem.slot = this.slot;
    elem.className = this.className;
    for (let i = 0; i < this._attributes.length; i += 1) {
      const attr = this._attributes.item(i)!;
      elem.setAttribute(attr.name, attr.value);
    }
    return elem;
  }

  _isEqualNodeSelf(otherNode: Node | null): boolean {
    const other = otherNode as Element;
    if (
      other.id !== this.id ||
      other.slot !== this.slot ||
      other.className !== this.className
    ) {
      return false;
    }
    for (let i = 0; i < this._attributes.length; i += 1) {
      const attr = this._attributes.item(i)!;
      if (other.getAttribute(attr.name) !== attr.value) {
        return false;
      }
    }
    return true;
  }

  get styleData(): StyleData {
    if (this._styleData == null) {
      this._styleData = new StyleData(this);
    }
    return this._styleData as StyleData;
  }

  get style(): CSSStyleDeclaration {
    return this._computedStyle.style;
  }
}
