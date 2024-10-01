import { Parser } from 'htmlparser2';
import { Document } from '../dom/Document';
import { Element } from '../dom/Element';
import { DocumentFragment } from '../dom/DocumentFragment';

export function parseHtml(
  input: string,
  document: Document,
  root: Element | DocumentFragment,
): void {
  const stack: (Element | DocumentFragment)[] = [root];
  const parser = new Parser({
    onopentagname(name) {
      const el = document.createElement(name);
      stack[stack.length - 1].appendChild(el);
      stack.push(el);
    },
    onattribute(name, value) {
      (stack[stack.length - 1] as Element).setAttribute(name, value);
    },
    onclosetag() {
      stack.pop();
    },
    ontext(data) {
      const text = document.createTextNode(data);
      stack[stack.length - 1].appendChild(text);
    },
    oncomment(data) {
      const comment = document.createComment(data);
      stack[stack.length - 1].appendChild(comment);
    },
  });
  parser.write(input);
  parser.end();
}
