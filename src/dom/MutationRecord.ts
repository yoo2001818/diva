export class MutationRecord {
  addedNodes: NodeList = new NodeList();
  attributeName: string | null = null;
  attributeNamespace: string | null = null;
  nextSibling: Node | null = null;
  oldValue: string | null = null;
  previousSibling: Node | null = null;
  removedNodes: NodeList = new NodeList();
  target: Node;
  type: 'attributes' | 'characterData' | 'childList';

  constructor(
    target: Node,
    type: 'attributes' | 'characterData' | 'childList',
  ) {
    this.target = target;
    this.type = type;
  }
}
