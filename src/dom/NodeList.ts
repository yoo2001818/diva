import type { Node } from './Node';

export interface NodeList {
  [index: number]: Node;
  get length(): number;
  item(index: number): Node | null;
}

export class NodeListImpl extends Array<Node> implements NodeList {
  item(index: number): Node | null {
    return this[index] ?? null;
  }
}
