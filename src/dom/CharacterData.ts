import { ChildNode } from './ChildNode';
import { Element } from './Element';
import { Node } from './Node';
import { NonDocumentTypeChildNode } from './NonDocumentTypeChildNode';

export class CharacterData
  extends Node
  implements ChildNode, NonDocumentTypeChildNode
{
  _data: string = '';

  get data(): string {
    // LegacyNullToEmptyString behavior can be handled by TypeScript null-checking mechanisms.
    return this._data || '';
  }

  set data(value: string) {
    this._data = value;
  }

  get length(): number {
    return this.data.length;
  }

  substringData(offset: number, count: number): string {
    throw new Error('Method not implemented.');
  }

  appendData(data: string): void {
    throw new Error('Method not implemented.');
  }

  insertData(offset: number, data: string): void {
    throw new Error('Method not implemented.');
  }

  deleteData(offset: number, count: number): void {
    throw new Error('Method not implemented.');
  }

  replaceData(offset: number, count: number, data: string): void {
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
