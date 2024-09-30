import { Node } from './Node';
import { Text } from './Text';

export class CDATASection extends Text {
  get nodeType(): number {
    return Node.CDATA_SECTION_NODE;
  }

  get nodeName(): string {
    return '#cdata-section';
  }

  _cloneNodeSelf(): Node {
    return this.ownerDocument!.createCDATASection(this.data);
  }
}
