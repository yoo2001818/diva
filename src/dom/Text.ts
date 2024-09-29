import { CharacterData } from './CharacterData';
import { Node } from './Node';

export class Text extends CharacterData {
  constructor(data: string = '') {
    super();
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

  get nodeValue(): string | null {
    return this.data;
  }
}
