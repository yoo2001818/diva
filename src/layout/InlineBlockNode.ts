import { BlockNode } from './BlockNode';

export class InlineBlockNode extends BlockNode {
  isBlock(): boolean {
    return false;
  }
}
