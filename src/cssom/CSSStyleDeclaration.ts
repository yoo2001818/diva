import { CSSStyleDict, INITIAL_VALUES } from './dict';
import { CSSSchemaKeys, CSSSchemaKeysKebab, schema } from './schema';
import { kebabize } from './utils';

export type CSSStyleDeclaration = {
  [K in CSSSchemaKeys | CSSSchemaKeysKebab]: string;
} & {
  _getRaw<K extends keyof CSSStyleDict>(key: K): CSSStyleDict[K];
  _setRaw<K extends keyof CSSStyleDict>(key: K, value: CSSStyleDict[K]): void;
  _onUpdate: (() => void) | null;
  cssText: string;
};

class CSSStyleDeclarationImpl {
  _dict: Partial<CSSStyleDict>;
  _onUpdate: (() => void) | null = null;
  constructor() {
    this._dict = {};
  }
  _getRaw<K extends keyof CSSStyleDict>(key: K): CSSStyleDict[K] {
    return this._dict[key] ?? INITIAL_VALUES[key];
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
}

Object.entries(schema).forEach(([key, { get, set }]) => {
  Object.defineProperty(CSSStyleDeclarationImpl.prototype, key, {
    get() {
      return get(this._dict);
    },
    set(v) {
      set(this._dict, v);
      this._onUpdate?.();
    },
  });
  Object.defineProperty(CSSStyleDeclarationImpl.prototype, kebabize(key), {
    get() {
      return get(this._dict);
    },
    set(v) {
      set(this._dict, v);
      this._onUpdate?.();
    },
  });
});

interface CSSStyleDeclarationConstructor {
  new (): CSSStyleDeclaration;
}

export const CSSStyleDeclaration =
  CSSStyleDeclarationImpl as unknown as CSSStyleDeclarationConstructor;
