import type { Element } from './Element';

export interface HTMLCollection {
  [index: number]: Element;
  get length(): number;
  item(index: number): Element | null;
  namedItem(name: string): Element | null;
}

export class HTMLCollectionImpl
  extends Array<Element>
  implements HTMLCollection
{
  // TODO: This is not "live"
  constructor(value: Array<Element>) {
    super(...value);
  }
  item(index: number): Element | null {
    return this[index] ?? null;
  }
  namedItem(name: string): Element | null {
    if (name === '') {
      return null;
    }
    for (let i = 0; i < this.length; i += 1) {
      if (this[i].id === name) {
        return this[i];
      }
    }
    return null;
  }
}
