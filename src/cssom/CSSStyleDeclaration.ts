import { CSSStyleDict, INITIAL_VALUES } from './dict';
import { schema } from './schema';

type CSSStyleDeclaration = {
  [K in keyof typeof schema]: string;
};

class CSSStyleDeclarationImpl {
  _dict: CSSStyleDict;
  constructor() {
    this._dict = { ...INITIAL_VALUES };
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
