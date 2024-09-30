import { Document } from './Document';
import { Element } from './Element';
import { Node } from './Node';

export class Attr extends Node {
  _name: string;
  _value: string = '';
  _ownerElement: Element | null = null;

  constructor(document: Document | null, name: string) {
    super(document);
    this._name = name;
  }

  get namespaceURI(): string | null {
    return null;
  }

  get prefix(): string | null {
    return null;
  }

  get localName(): string {
    return this._name;
  }

  get name(): string {
    return this._name;
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
  }

  get ownerElement(): Element | null {
    return this._ownerElement;
  }

  get specified(): boolean {
    return true;
  }
}
