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
  _updater: () => Array<Element>;
  constructor(updater: () => Array<Element>) {
    super();
    this._updater = updater;
    this._update();
  }
  _update(): void {
    const result = this._updater();
    this.length = 0;
    this.push(...result);
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
