import { Element } from './Element';

export interface NonDocumentTypeChildNode {
  get previousElementSibling(): Element | null;
  get nextElementSibling(): Element | null;
}
