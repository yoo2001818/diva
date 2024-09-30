import { Element } from './Element';

export interface NonElementParentNode {
  getElementById(elementId: string): Element | null;
}
