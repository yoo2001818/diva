import { SCHEMA_CASED } from './schema';
import { StyleDictMap } from './StyleDictMap';

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

export class CSSStyleDeclarationImpl implements CSSStyleDeclaration {
  [index: number]: string;
  _dictMap: StyleDictMap = new StyleDictMap();
  get cssText(): string {
    return '';
  }
  set cssText(value: string) {}
  get length(): number {
    return this._dictMap.records.size;
  }
  item(index: number): string {
    const names = Array.from(this._dictMap.records.keys());
    return names[index] ?? '';
  }
  getPropertyValue(property: string): string {
    if (property in SCHEMA_CASED) {
      const schema = SCHEMA_CASED[property as keyof typeof SCHEMA_CASED];
      return schema.get(this._dictMap) ?? '';
    }
    return '';
  }
  getPropertyPriority(property: string): string {
    if (property in SCHEMA_CASED) {
      const schema = SCHEMA_CASED[property as keyof typeof SCHEMA_CASED];
      return schema.getPriority(this._dictMap) ?? '';
    }
    return '';
  }
  setProperty(property: string, value: string, priority?: string): void {
    if (property in SCHEMA_CASED) {
      const schema = SCHEMA_CASED[property as keyof typeof SCHEMA_CASED];
      schema.set(
        this._dictMap,
        value,
        priority === 'important' ? 'important' : null,
      );
    }
  }
  removeProperty(property: string): string {
    if (property in SCHEMA_CASED) {
      const schema = SCHEMA_CASED[property as keyof typeof SCHEMA_CASED];
      const before = schema.get(this._dictMap) ?? '';
      schema.remove(this._dictMap);
      return before;
    }
    return '';
  }
  get parentRule(): CSSRule | null {
    return null;
  }
}
