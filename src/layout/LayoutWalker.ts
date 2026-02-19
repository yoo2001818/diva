import { Element } from '../dom/Element';
import { Node } from '../dom/Node';
import { Text } from '../dom/Text';

interface WalkerTokenStart {
  type: 'start';
  stack: Element[];
  element: Element;
  matchingEndIndex: number;
}

interface WalkerTokenEnd {
  type: 'end';
  stack: Element[];
  element: Element;
}

interface WalkerTokenText {
  type: 'text';
  stack: Element[];
  text: Text;
}

type WalkerToken = WalkerTokenStart | WalkerTokenEnd | WalkerTokenText;

export type WalkerItem =
  | { type: 'start'; stack: Element[]; element: Element }
  | { type: 'end'; stack: Element[]; element: Element }
  | { type: 'text'; stack: Element[]; text: Text; index: number };

function buildTokens(
  node: Node,
  stack: Element[],
  tokens: WalkerToken[],
): void {
  if (node instanceof Element) {
    const startIndex = tokens.length;
    tokens.push({
      type: 'start',
      stack: [...stack],
      element: node,
      matchingEndIndex: -1,
    });
    for (let child = node.firstChild; child != null; child = child.nextSibling) {
      buildTokens(child, [...stack, node], tokens);
    }
    const endIndex = tokens.length;
    tokens.push({ type: 'end', stack: [...stack], element: node });
    (tokens[startIndex] as WalkerTokenStart).matchingEndIndex = endIndex;
    return;
  }
  if (node instanceof Text) {
    tokens.push({ type: 'text', stack: [...stack], text: node });
  }
}

export class LayoutWalker {
  private tokens: WalkerToken[] = [];
  private index = 0;
  private textOffset = 0;

  constructor(root: Element) {
    for (let child = root.firstChild; child != null; child = child.nextSibling) {
      buildTokens(child, [root], this.tokens);
    }
  }

  private advancePastEmptyText(): void {
    while (this.index < this.tokens.length) {
      const token = this.tokens[this.index];
      if (token.type !== 'text') {
        return;
      }
      const text = token.text.data;
      if (this.textOffset < text.length) {
        return;
      }
      this.index += 1;
      this.textOffset = 0;
    }
  }

  peek(): WalkerItem | null {
    this.advancePastEmptyText();
    const token = this.tokens[this.index];
    if (token == null) {
      return null;
    }
    switch (token.type) {
      case 'start':
        return {
          type: 'start',
          stack: token.stack,
          element: token.element,
        };
      case 'end':
        return {
          type: 'end',
          stack: token.stack,
          element: token.element,
        };
      case 'text':
        return {
          type: 'text',
          stack: token.stack,
          text: token.text,
          index: this.textOffset,
        };
      default:
        return null;
    }
  }

  consume(drillDown: boolean = true): void {
    this.advancePastEmptyText();
    const token = this.tokens[this.index];
    if (token == null) {
      return;
    }

    if (token.type === 'text') {
      this.index += 1;
      this.textOffset = 0;
      return;
    }

    if (!drillDown && token.type === 'start') {
      this.index = token.matchingEndIndex + 1;
      this.textOffset = 0;
      return;
    }

    this.index += 1;
    this.textOffset = 0;
  }

  consumeText(length: number): void {
    this.advancePastEmptyText();
    const token = this.tokens[this.index];
    if (token == null || token.type !== 'text') {
      return;
    }
    const remaining = token.text.data.length - this.textOffset;
    if (length >= remaining) {
      this.index += 1;
      this.textOffset = 0;
      return;
    }
    this.textOffset += length;
  }
}
