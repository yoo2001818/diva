import { Document } from '../dom/Document';
import { HTMLElement } from './HTMLElement';
import { HTMLStyleElement } from './HTMLStyleElement';

export function createHTMLElement(
  document: Document,
  localName: string,
  _options?: string | ElementCreationOptions,
): HTMLElement {
  switch (localName.toLowerCase()) {
    case 'style':
      return new HTMLStyleElement(document, localName);
    default:
      return new HTMLElement(document, localName);
  }
}
