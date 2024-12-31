import { CSSStyleDict, INITIAL_VALUES } from './dict';
import { schema } from './schema';
import { kebabize } from './utils';

export type CSSStyleDeclaration = {
  [K in keyof typeof schema]: string;
} & {
  _getRaw<K extends keyof CSSStyleDict>(key: K): CSSStyleDict[K];
  _setRaw<K extends keyof CSSStyleDict>(key: K, value: CSSStyleDict[K]): void;
  cssText: string;
};

class CSSStyleDeclarationImpl {
  _dict: Partial<CSSStyleDict>;
  constructor() {
    this._dict = {};
  }
  _getRaw<K extends keyof CSSStyleDict>(key: K): CSSStyleDict[K] {
    return this._dict[key] ?? INITIAL_VALUES[key];
  }
  _setRaw<K extends keyof CSSStyleDict>(key: K, value: CSSStyleDict[K]): void {
    this._dict[key] = value;
  }
  get cssText(): string {
    const result: string[] = [];
    for (const key in this._dict) {
      const value = (schema as any)[key].get(this._dict);
      result.push(kebabize(key) + ':' + value + ';');
    }
    return result.join(' ');
  }
}

Object.entries(schema).forEach(([key, { get, set }]) => {
  Object.defineProperty(CSSStyleDeclarationImpl.prototype, key, {
    get() {
      return get(this._dict);
    },
    set(v) {
      set(this._dict, v);
    },
  });
});

interface CSSStyleDeclarationConstructor {
  new (): CSSStyleDeclaration;
}

export const CSSStyleDeclaration =
  CSSStyleDeclarationImpl as unknown as CSSStyleDeclarationConstructor;
