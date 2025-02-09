import { Attr } from './Attr';
import { Element } from './Element';

export interface NamedNodeMapHook {
  set(value: string | null): void;
}

export class NamedNodeMap {
  _ownerElement: Element;
  _attributes: Attr[] = [];
  _hooks: Record<string, NamedNodeMapHook> = {};

  constructor(ownerElement: Element) {
    this._ownerElement = ownerElement;
  }

  _setHook(name: string, hook: NamedNodeMapHook): void {
    this._hooks[name] = hook;
  }

  get length(): number {
    return this._attributes.length;
  }

  item(index: number): Attr | null {
    return this._attributes[index] || null;
  }

  getNamedItem(qualifiedName: string): Attr | null {
    const item = this._attributes.find((v) => v.name === qualifiedName);
    return item || null;
  }

  getNamedItemNS(_namespace: string | null, localName: string): Attr | null {
    // Namespace support is dropped
    return this.getNamedItem(localName);
  }

  _setNamedItem(attr: Attr, ignoreHook = false): Attr | null {
    if (
      attr._ownerElement != null &&
      attr._ownerElement !== this._ownerElement
    ) {
      throw new DOMException('Attr is in use', 'InUseAttributeError');
    }
    if (!ignoreHook) {
      this._hooks[attr.name]?.set(attr.value);
    }
    const oldAttr = this.getNamedItem(attr.name);
    if (oldAttr === attr) {
      return attr;
    }
    if (oldAttr != null) {
      const index = oldAttr._parentIndex!;
      oldAttr._ownerElement = null;
      oldAttr._parentIndex = null;
      attr._ownerElement = this._ownerElement;
      attr._parentIndex = index;
      this._attributes[index] = attr;
    } else {
      const index = this._attributes.length;
      attr._ownerElement = this._ownerElement;
      attr._parentIndex = index;
      this._attributes[index] = attr;
    }
    return oldAttr;
  }

  setNamedItem(attr: Attr): Attr | null {
    return this._setNamedItem(attr);
  }

  setNamedItemNS(attr: Attr): Attr | null {
    return this._setNamedItem(attr);
  }

  removeNamedItem(qualifiedName: string): Attr {
    const attr = this._attributes.find((v) => v.name === qualifiedName);
    if (attr == null) {
      throw new DOMException('Cannot find attribute', 'DOMException');
    }
    this._hooks[qualifiedName]?.set(null);
    const index = attr._parentIndex!;
    attr._ownerElement = null;
    attr._parentIndex = null;
    this._attributes.splice(index, 1);
    for (let i = index; i < this._attributes.length; i += 1) {
      const node = this._attributes[i];
      node._parentIndex = i;
    }
    return attr;
  }

  removeNamedItemNS(_namespace: string | null, localName: string): Attr {
    return this.removeNamedItem(localName);
  }
}
