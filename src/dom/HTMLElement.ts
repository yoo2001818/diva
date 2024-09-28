import { Node } from "./Node";

export class HTMLElement extends Node {
  tagName: string;
  constructor(tagName: string) {
    super();
    this.tagName = tagName.toUpperCase();
  }

  get nodeType(): number {
    return Node.ELEMENT_NODE;
  }

  get nodeName(): string {
    return this.tagName;
  }

  get nodeValue(): string | null {
    return null;
  }
}
