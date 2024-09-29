import type { Node } from './Node';

export interface NodeList {
  [index: number]: Node;
  get length(): number;
  item(index: number): Node | null;
}
