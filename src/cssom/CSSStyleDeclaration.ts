import { CSSRule } from './CSSRule';
import { CSSStyleDict } from './dict';
import {
  CSSSchemaKeys,
  CSSSchemaKeysKebab,
  schema,
  schemaKebab,
} from './schema';
import { kebabize } from './utils';

export type CSSStyleDeclaration = {
  [K in CSSSchemaKeys | CSSSchemaKeysKebab]: string;
} & {
  _getRaw<K extends keyof CSSStyleDict>(key: K): CSSStyleDict[K] | null;
  _setRaw<K extends keyof CSSStyleDict>(key: K, value: CSSStyleDict[K]): void;
  _onUpdate: (() => void) | null;
  cssText: string;
  // length: number;
  // item(index: number): string; This is an array?
  getPropertyValue(property: string): string;
  getPropertyPriority(property: string): string;
  setProperty(property: string, value: string, priority?: string): void;
  removeProperty(property: string): string;
  parentRule: CSSRule | null;
};

class CSSStyleDeclarationImpl {
  _dict: Partial<CSSStyleDict>;
  _onUpdate: (() => void) | null = null;
  constructor() {
    this._dict = {};
  }
  _getRaw<K extends keyof CSSStyleDict>(key: K): CSSStyleDict[K] | null {
    return (this._dict[key] as any) ?? null;
  }
  _setRaw<K extends keyof CSSStyleDict>(key: K, value: CSSStyleDict[K]): void {
    this._dict[key] = value;
    this._onUpdate?.();
  }
  get cssText(): string {
    const result: string[] = [];
    for (const key in this._dict) {
      const value = (schema as any)[key].get(this._dict);
      result.push(kebabize(key) + ':' + value + ';');
    }
    return result.join(' ');
  }
  set cssText(value: string) {
    // TODO
  }
  getPropertyValue(property: string): string {
    const item = schemaKebab[property];
    if (item != null) {
      return item.get(this._dict as CSSStyleDict);
    }
    return '';
  }
  getPropertyPriority(_property: string): string {
    return '';
  }
  setProperty(property: string, value: string, _priority?: string): void {
    const item = schemaKebab[property];
    if (item != null) {
      item.set(this._dict as CSSStyleDict, value);
    }
  }
  removeProperty(property: string): string {
    const value = this.getPropertyValue(property);
    const item = schemaKebab[property];
    if (item != null) {
      item.set(this._dict as CSSStyleDict, '');
    }
    return value;
  }
}

Object.entries(schema).forEach(([key, { get, set }]) => {
  const kebabKey = kebabize(key);
  Object.defineProperty(CSSStyleDeclarationImpl.prototype, key, {
    get() {
      return get(this._dict);
    },
    set(v) {
      set(this._dict, v);
      this._onUpdate?.();
    },
  });
  if (key !== kebabKey) {
    Object.defineProperty(CSSStyleDeclarationImpl.prototype, kebabKey, {
      get() {
        return get(this._dict);
      },
      set(v) {
        set(this._dict, v);
        this._onUpdate?.();
      },
    });
  }
});

interface CSSStyleDeclarationConstructor {
  new (): CSSStyleDeclaration;
}

export const CSSStyleDeclaration =
  CSSStyleDeclarationImpl as unknown as CSSStyleDeclarationConstructor;
