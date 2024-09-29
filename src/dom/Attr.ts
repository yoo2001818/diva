import { Element } from './Element';
import { Node } from './Node';

export class Attr extends Node {
  get namespaceURI(): string | null {
    throw new Error('Method not implemented.');
  }

  get prefix(): string | null {
    throw new Error('Method not implemented.');
  }

  get localName(): string {
    throw new Error('Method not implemented.');
  }

  get name(): string {
    throw new Error('Method not implemented.');
  }

  get value(): string {
    throw new Error('Method not implemented.');
  }

  set value(value: string) {
    throw new Error('Method not implemented.');
  }

  get ownerElement(): Element | null {
    throw new Error('Method not implemented.');
  }

  get specified(): boolean {
    return true;
  }
}
