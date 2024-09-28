import { Node } from "./Node";

export class TextNode extends Node {
  data: string;
  constructor(data: string) {
    super();
    this.data = data;
  }

  get nodeType(): number {
    return Node.TEXT_NODE;
  }

  get nodeName(): string {
    return "#text";
  }

  get nodeValue(): string | null {
    return this.data;
  }
}
