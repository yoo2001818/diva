import { CharacterData } from './CharacterData';
import { Document } from './Document';
import { Node } from './Node';

export class Text extends CharacterData {
  constructor(document: Document, data: string = '') {
    super(document);
    this.data = data;
  }

  splitText(offset: number): Text {
    throw new Error('Method not implemented.');
  }

  get wholeText(): string {
    throw new Error('Method not implemented.');
  }

  get nodeType(): number {
    return Node.TEXT_NODE;
  }

  get nodeName(): string {
    return '#text';
  }
}
