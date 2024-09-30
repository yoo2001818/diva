import { CharacterData } from './CharacterData';
import { Document } from './Document';
import { Node } from './Node';

export class Comment extends CharacterData {
  constructor(document: Document, data: string = '') {
    super(document);
    this.data = data;
  }

  get nodeType(): number {
    return Node.COMMENT_NODE;
  }

  get nodeName(): string {
    return '#comment';
  }

  _cloneNodeSelf(): Node {
    return this.ownerDocument!.createComment(this.data);
  }
}
