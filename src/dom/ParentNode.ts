import type { Element } from './Element';
import { HTMLCollection } from './HTMLCollection';
import { Node } from './Node';
import { NodeList } from './NodeList';

export interface ParentNode {
  get children(): HTMLCollection;
  get firstElementChild(): Element | null;
  get lastElementChild(): Element | null;
  get childElementCount(): number;

  prepend(...nodes: (Node | string)[]): void;
  append(...nodes: (Node | string)[]): void;
  replaceChildren(...nodes: (Node | string)[]): void;

  querySelector(selectors: string): Element | null;
  querySelectorAll(selectors: string): NodeList;
}
