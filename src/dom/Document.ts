import { Node } from "./Node";

export class Document extends Node {
  constructor() {
    super();
  }

  get nodeType(): number {
    return Node.DOCUMENT_NODE;
  }

  get nodeName(): string {
    return "#document";
  }

  get nodeValue(): string | null {
    return null;
  }
}
