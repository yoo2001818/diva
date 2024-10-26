import { CSSStyleDict, INITIAL_VALUES } from './dict';
import { schema } from './schema';

export type CSSStyleDeclaration = {
  [K in keyof typeof schema]: string;
} & {
  _getRaw<K extends keyof CSSStyleDict>(key: K): CSSStyleDict[K];
  _setRaw<K extends keyof CSSStyleDict>(key: K, value: CSSStyleDict[K]): void;
};

class CSSStyleDeclarationImpl {
  _dict: CSSStyleDict;
  constructor() {
    this._dict = { ...INITIAL_VALUES };
  }
  _getRaw<K extends keyof CSSStyleDict>(key: K): CSSStyleDict[K] {
    return this._dict[key];
  }
  _setRaw<K extends keyof CSSStyleDict>(key: K, value: CSSStyleDict[K]): void {
    this._dict[key] = value;
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
