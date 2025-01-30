import { Node } from '../dom/Node';
import { LayoutNode } from './LayoutNode';

export class TextRunNode extends LayoutNode {
  text: string;

  constructor(node: Node | null, text: string) {
    super(node);
    this.text = text;
  }
}
