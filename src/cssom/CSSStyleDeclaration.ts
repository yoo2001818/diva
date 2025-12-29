import { Signal } from '../dom/Signal';
import { CSSRule } from './CSSRule';
import { CSSStyleDict } from './dict';
import { SCHEMA, SCHEMA_CASED } from './schema';
import { StyleDictMap, StylePriority } from './StyleDictMap';
import { kebabize } from './utils';

type SchemaKey = keyof typeof SCHEMA_CASED;
type BaseSchemaKey = keyof typeof SCHEMA;

type CoalesceTargets = Map<string, string[]>;

function resolveSchemaKey(name: string): BaseSchemaKey | null {
  if (name in SCHEMA) {
    return name as BaseSchemaKey;
  }
  return null;
}

const COALESCE_TARGETS: CoalesceTargets = new Map();
Object.entries(SCHEMA).forEach(([key, entry]) => {
  const targets = entry.coalesceProperties;
  if (!targets) return;
  for (let i = 0; i < targets.length; i += 1) {
    const target = targets[i];
    const list = COALESCE_TARGETS.get(target);
    if (list) {
      if (!list.includes(key)) {
        list.push(key);
      }
    } else {
      COALESCE_TARGETS.set(target, [key]);
    }
  }
});
const COALESCE_KEYS = Array.from(COALESCE_TARGETS.keys());

interface CSSStyleDeclarationInterface {
  [index: number]: string;
  cssText: string;
  readonly length: number;
  item(index: number): string;
  getPropertyValue(property: string): string;
  getPropertyPriority(property: string): string;
  setProperty(property: string, value: string, priority?: string): void;
  removeProperty(property: string): string;
  readonly parentRule: CSSRule | null;
}

export type CSSStyleDeclaration = CSSStyleDeclarationInterface & {
  [key in keyof typeof SCHEMA_CASED]: string;
};

export interface CSSStyleDeclarationInternalInterface {
  _dictMap: StyleDictMap;
  _changedSignal: Signal<[]>;
}

class CSSStyleDeclarationImpl
  implements CSSStyleDeclarationInterface, CSSStyleDeclarationInternalInterface
{
  [index: number]: string;
  _dictMap: StyleDictMap = new StyleDictMap();
  _changedSignal = new Signal<[]>();
  private _namesCache: string[] = [];
  private _namesDirty = true;
  private _indexCount = 0;
  private _parentRule: CSSRule | null;

  constructor(parentRule: CSSRule | null = null) {
    this._parentRule = parentRule;
  }

  private _markNamesDirty(): void {
    this._namesDirty = true;
  }

  private _ensureIndexProperties(): void {
    const size = this._dictMap.records.size;
    for (let i = this._indexCount; i < size; i += 1) {
      const index = i;
      Object.defineProperty(this, index, {
        configurable: true,
        enumerable: false,
        get: () => this._getEnumeratedProperties()[index] ?? '',
      });
    }
    for (let i = size; i < this._indexCount; i += 1) {
      delete (this as any)[i];
    }
    this._indexCount = size;
  }

  private _getEnumeratedProperties(): string[] {
    if (!this._namesDirty) {
      return this._namesCache;
    }
    const names: string[] = [];
    for (const name of this._dictMap.records.keys()) {
      const key = String(name);
      const schemaKey = resolveSchemaKey(key);
      names.push(kebabize(schemaKey ?? key));
    }
    this._namesCache = names;
    this._namesDirty = false;
    this._ensureIndexProperties();
    return names;
  }

  get cssText(): string {
    if (this._dictMap.records.size === 0) return '';
    const order = Array.from(this._dictMap.records.keys());
    if (order.length === 0) return '';
    const orderIndex = new Map<string, number>();
    for (let i = 0; i < order.length; i += 1) {
      orderIndex.set(String(order[i]), i);
    }

    type Candidate = {
      name: string;
      value: string;
      priority: StylePriority;
      coverage: string[];
      coverageSize: number;
      firstIndex: number;
    };

    const candidatesByIndex = new Map<number, Candidate[]>();
    for (let i = 0; i < COALESCE_KEYS.length; i += 1) {
      const name = COALESCE_KEYS[i];
      const schema = SCHEMA[name as BaseSchemaKey];
      if (schema == null) continue;
      const value = schema.get(this._dictMap);
      if (value == null) continue;
      const props = COALESCE_TARGETS.get(name);
      if (props == null) continue;
      let firstIndex = Number.POSITIVE_INFINITY;
      const coverage: string[] = [];
      for (let j = 0; j < props.length; j += 1) {
        const prop = props[j];
        if (!this._dictMap.records.has(prop as keyof CSSStyleDict)) continue;
        coverage.push(prop);
        const idx = orderIndex.get(prop);
        if (idx != null && idx < firstIndex) {
          firstIndex = idx;
        }
      }
      if (coverage.length === 0 || firstIndex === Number.POSITIVE_INFINITY) {
        continue;
      }
      const candidate: Candidate = {
        name,
        value,
        priority: schema.getPriority(this._dictMap),
        coverage,
        coverageSize: coverage.length,
        firstIndex,
      };
      const list = candidatesByIndex.get(firstIndex);
      if (list) {
        list.push(candidate);
      } else {
        candidatesByIndex.set(firstIndex, [candidate]);
      }
    }

    const consumed = new Set<string>();
    const parts: string[] = [];
    for (let i = 0; i < order.length; i += 1) {
      const prop = String(order[i]);
      if (consumed.has(prop)) continue;
      const candidates = candidatesByIndex.get(i);
      if (candidates && candidates.length > 0) {
        let chosen: Candidate | null = null;
        for (let j = 0; j < candidates.length; j += 1) {
          const candidate = candidates[j];
          if (!candidate.coverage.includes(prop)) continue;
          let conflict = false;
          for (let k = 0; k < candidate.coverage.length; k += 1) {
            if (consumed.has(candidate.coverage[k])) {
              conflict = true;
              break;
            }
          }
          if (conflict) continue;
          if (chosen == null || candidate.coverageSize > chosen.coverageSize) {
            chosen = candidate;
          }
        }
        if (chosen) {
          parts.push(
            `${kebabize(chosen.name)}: ${chosen.value}${
              chosen.priority === 'important' ? ' !important' : ''
            };`,
          );
          for (let j = 0; j < chosen.coverage.length; j += 1) {
            consumed.add(chosen.coverage[j]);
          }
          continue;
        }
      }

      const schemaKey = resolveSchemaKey(prop);
      if (schemaKey == null) continue;
      const schema = SCHEMA[schemaKey];
      const value = schema.get(this._dictMap);
      if (value == null) continue;
      const priority = schema.getPriority(this._dictMap);
      parts.push(
        `${kebabize(schemaKey)}: ${value}${
          priority === 'important' ? ' !important' : ''
        };`,
      );
      consumed.add(prop);
    }
    return parts.join(' ');
  }

  set cssText(value: string) {
    this._dictMap.records.clear();
    this._markNamesDirty();
    this._ensureIndexProperties();
    const input = value.trim();
    if (input === '') return;
    const decls = input.split(';');
    for (let i = 0; i < decls.length; i += 1) {
      const decl = decls[i].trim();
      if (decl === '') continue;
      const colon = decl.indexOf(':');
      if (colon === -1) continue;
      const property = decl.slice(0, colon).trim();
      let val = decl.slice(colon + 1).trim();
      if (property === '' || val === '') continue;
      let priority: StylePriority = null;
      const importantMatch = /!\s*important\s*$/i.exec(val);
      if (importantMatch != null) {
        val = val.slice(0, importantMatch.index).trim();
        priority = 'important';
      }
      this.setProperty(property, val, priority ?? undefined);
    }
  }

  get length(): number {
    return this._dictMap.records.size;
  }

  item(index: number): string {
    const names = this._getEnumeratedProperties();
    return names[index] ?? '';
  }

  getPropertyValue(property: string): string {
    const schema = SCHEMA_CASED[property as SchemaKey];
    if (schema == null) return '';
    return schema.get(this._dictMap) ?? '';
  }

  getPropertyPriority(property: string): string {
    const schema = SCHEMA_CASED[property as SchemaKey];
    if (schema == null) return '';
    return schema.getPriority(this._dictMap) === 'important' ? 'important' : '';
  }

  setProperty(property: string, value: string, priority?: string): void {
    const schema = SCHEMA_CASED[property as SchemaKey];
    if (schema == null) return;
    if (value === '') {
      this.removeProperty(property);
      return;
    }
    schema.set(
      this._dictMap,
      value,
      priority === 'important' ? 'important' : null,
    );
    this._markNamesDirty();
    this._ensureIndexProperties();
    this._changedSignal.emit();
  }

  removeProperty(property: string): string {
    const schema = SCHEMA_CASED[property as SchemaKey];
    if (schema == null) return '';
    const before = schema.get(this._dictMap) ?? '';
    schema.remove(this._dictMap);
    this._markNamesDirty();
    this._ensureIndexProperties();
    this._changedSignal.emit();
    return before;
  }

  get parentRule(): CSSRule | null {
    return this._parentRule;
  }
}

Object.keys(SCHEMA_CASED).forEach((key) => {
  const schema = SCHEMA_CASED[key as SchemaKey];
  Object.defineProperty(CSSStyleDeclarationImpl.prototype, key, {
    get(this: CSSStyleDeclarationImpl) {
      return schema.get(this._dictMap) ?? '';
    },
    set(this: CSSStyleDeclarationImpl, value: string) {
      this.setProperty(key, value);
    },
  });
});

interface CSSStyleDeclarationConstructor {
  new (): CSSStyleDeclaration & CSSStyleDeclarationInternalInterface;
}

export const CSSStyleDeclaration =
  CSSStyleDeclarationImpl as unknown as CSSStyleDeclarationConstructor;
