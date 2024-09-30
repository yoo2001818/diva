import { Element } from './Element';
import { HTMLCollection, HTMLCollectionImpl } from './HTMLCollection';
import { Node } from './Node';
import { NodeList } from './NodeList';
import { NonElementParentNode } from './NonElementParentNode';
import { ParentNode } from './ParentNode';
import {
  elementAppend,
  elementGetElementById,
  elementPrepend,
  elementQuerySelector,
  elementQuerySelectorAll,
  elementReplaceChildren,
} from './utils/element';

export class DocumentFragment
  extends Node
  implements ParentNode, NonElementParentNode
{
  get nodeType(): number {
    return Node.DOCUMENT_FRAGMENT_NODE;
  }

  get nodeName(): string {
    return '#document-fragment';
  }

  _cloneNodeSelf(): Node {
    return this.ownerDocument!.createDocumentFragment();
  }

  _isEqualNodeSelf(_otherNode: Node | null): boolean {
    return true;
  }

  get children(): HTMLCollection {
    return new HTMLCollectionImpl(
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

  getElementById(elementId: string): Element | null {
    return elementGetElementById(elementId);
  }
}
