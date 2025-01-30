import { Element } from '../dom/Element';
import { Node } from '../dom/Node';
import { Text } from '../dom/Text';
import { BlockNode } from './BlockNode';
import { InlineBlockNode } from './InlineBlockNode';
import { InlineNode } from './InlineNode';
import { LayoutNode } from './LayoutNode';
import { TextRunNode } from './TextRunNode';

export function createLayoutNode(node: Node): LayoutNode | null {
  if (node instanceof Element) {
    const display = node._computedStyle.get('display');
    switch (display.type) {
      case 'block':
      default:
        return new BlockNode(node);
      case 'inline-block':
        return new InlineBlockNode(node);
      case 'inline':
        return new InlineNode(node);
      case 'none':
        return null;
    }
  } else if (node instanceof Text) {
    return new TextRunNode(node, node.data);
  }
  return null;
}
