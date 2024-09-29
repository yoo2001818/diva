import type { Element } from './Element';

export interface HTMLCollection {
  [index: number]: Element;
  get length(): number;
  item(index: number): Element | null;
  namedItem(name: string): Element | null;
}
