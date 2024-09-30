import { ChildNode } from './ChildNode';
import { Element } from './Element';
import { Node } from './Node';
import { NonDocumentTypeChildNode } from './NonDocumentTypeChildNode';
import {
  elementAfter,
  elementBefore,
  elementNextElementSibling,
  elementPreviousElementSibling,
  elementRemove,
  elementReplaceWith,
} from './utils/element';

export class CharacterData
  extends Node
  implements ChildNode, NonDocumentTypeChildNode
{
  _data: string = '';

  get data(): string {
    return this._data || '';
  }

  set data(value: string) {
    this._data = value;
  }

  get length(): number {
    return this.data.length;
  }

  substringData(offset: number, count: number): string {
    return this.data.slice(offset, offset + count);
  }

  appendData(data: string): void {
    this.data += data;
  }

  insertData(offset: number, data: string): void {
    this.data = this.data.slice(0, offset) + data + this.data.slice(offset);
  }

  deleteData(offset: number, count: number): void {
    this.data = this.data.slice(0, offset) + this.data.slice(offset + count);
  }

  replaceData(offset: number, count: number, data: string): void {
    this.data =
      this.data.slice(0, offset) + data + this.data.slice(offset + count);
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

  get nodeValue(): string | null {
    return this.data;
  }

  set nodeValue(value: string) {
    this.data = value;
  }

  get textContent(): string | null {
    return this.data;
  }

  set textContent(value: string) {
    this.data = value;
  }

  _isEqualNodeSelf(otherNode: Node | null): boolean {
    return this.data === (otherNode as CharacterData).data;
  }
}
