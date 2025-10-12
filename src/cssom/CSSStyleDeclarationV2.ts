export interface CSSStyleDeclaration {
  [index: number]: string;
  cssText: string;
  readonly length: number;
  item(index: number): string;
  getPropertyValue(property: string): string;
  getPropertyPriority(property: string): string;
  setProperty(property: string, value: string, priority?: string): void;
  removeProperty(property: string): string;
  readonly parentRule: CSSRule | null;

  // TODO: Figure out a better way to enumerate options
  background: string;
}

interface CSSDeclarationRecord {
  value: string;
  valueAST: any;
  priority: string;
}

export class CSSStyleDeclarationImpl
  extends Array<string>
  implements CSSStyleDeclaration
{
  _records: CSSDeclarationRecord[] = [];
  constructor() {
    super();
  }
  get cssText(): string {
    return '';
  }
  set cssText(value: string) {}
  item(index: number): string {
    return this[index] ?? '';
  }
  getPropertyValue(property: string): string {
    throw new Error('Method not implemented.');
  }
  getPropertyPriority(property: string): string {
    throw new Error('Method not implemented.');
  }
  setProperty(property: string, value: string, priority?: string): void {
    throw new Error('Method not implemented.');
    // NB: shorthand property is never recorded directly into here, it's reconciled when cssText is called?
    // How does this work? Maybe there's a "canonicalizer" that activates once whenever conditions are satisfied.
    // margin, for example... would only work if there are all four values present, and if so, when it encounters
    // the first value of the group, it spits the entire group out and deactivates all other items.
  }
  removeProperty(property: string): string {
    throw new Error('Method not implemented.');
  }
  get parentRule(): CSSRule | null {
    return null;
  }
  get background(): string {
    return '';
  }
  set background(value: string) {}
}
