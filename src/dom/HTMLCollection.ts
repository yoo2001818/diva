import type { Element } from './Element';
import { Signal } from './Signal';

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
  _updater: () => Array<Element>;
  _updateSignals: Signal<any[]>[];
  _updateSignal: Signal<[]> = new Signal();
  constructor(
    updater: () => Array<Element>,
    updateSignals: Signal<any[]>[] = [],
  ) {
    super();
    this._update = this._update.bind(this);
    this._updater = updater;
    this._updateSignals = updateSignals;
    updateSignals.forEach((signal) => signal.add(this._update));
    this._update();
  }
  dispose(): void {
    this._updateSignals.forEach((signal) => signal.delete(this._update));
  }
  _update(): void {
    const result = this._updater();
    this.length = 0;
    this.push(...result);
    this._updateSignal.emit();
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
