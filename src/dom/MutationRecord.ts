import { Node } from './Node';
import { NodeList, NodeListImpl } from './NodeList';

export class MutationRecord {
  addedNodes: NodeList = new NodeListImpl();
  attributeName: string | null = null;
  attributeNamespace: string | null = null;
  nextSibling: Node | null = null;
  oldValue: string | null = null;
  previousSibling: Node | null = null;
  removedNodes: NodeList = new NodeListImpl();
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

export function mutationRecordCharacterDataChanged(
  node: Node,
  oldValue: string,
): MutationRecord {
  const record = new MutationRecord(node, 'characterData');
  record.oldValue = oldValue;
  return record;
}

export function mutationRecordChildListChanged(
  node: Node,
  addedNodes: Node[],
  removedNodes: Node[],
  nextSibling: Node | null,
  previousSibling: Node | null,
): MutationRecord {
  const record = new MutationRecord(node, 'childList');
  record.addedNodes = new NodeListImpl(...addedNodes);
  record.removedNodes = new NodeListImpl(...removedNodes);
  record.nextSibling = nextSibling;
  record.previousSibling = previousSibling;
  return record;
}

export function mutationRecordAttributesChanged(
  node: Node,
  attributeName: string | null,
  attributeNamespace: string | null,
  oldValue: string | null,
): MutationRecord {
  const record = new MutationRecord(node, 'attributes');
  record.attributeName = attributeName;
  record.attributeNamespace = attributeNamespace;
  record.oldValue = oldValue;
  return record;
}
