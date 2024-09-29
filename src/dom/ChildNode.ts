import { Node } from './Node';

export interface ChildNode {
  before(...nodes: (Node | string)[]): void;
  after(...nodes: (Node | string)[]): void;
  replaceWith(...nodes: (Node | string)[]): void;
  remove(): void;
}
