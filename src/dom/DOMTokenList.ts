export class DOMTokenList {
  private _tokens: string[] = [];
  _onUpdate: (() => void) | null = null;

  get length(): number {
    return this._tokens.length;
  }

  item(index: number): string | null {
    return this._tokens[index] || null;
  }

  contains(token: string): boolean {
    return this._tokens.includes(token);
  }

  _handleUpdate(): void {
    this._onUpdate?.();
  }

  _validateToken(token: string): void {
    if (token === '') {
      throw new DOMException('Token cannot be empty', 'SyntaxError');
    }
    if (/\s/.test(token)) {
      throw new DOMException(
        'Token cannot contain whitespace',
        'InvalidCharacterError',
      );
    }
  }

  add(...tokens: string[]): void {
    tokens.forEach((token) => this._validateToken(token));
    tokens.forEach((token) => {
      if (!this._tokens.includes(token)) {
        this._tokens.push(token);
      }
    });
    this._handleUpdate();
  }

  remove(...tokens: string[]): void {
    tokens.forEach((token) => this._validateToken(token));
    this._tokens = this._tokens.filter((v) => !tokens.includes(v));
    this._handleUpdate();
  }

  toggle(token: string, force?: boolean): boolean {
    this._validateToken(token);
    if (this._tokens.includes(token)) {
      if (force !== true) {
        this.remove(token);
        return false;
      }
      return true;
    } else if (force !== false) {
      this.add(token);
      return true;
    }
    return false;
  }

  replace(token: string, newToken: string): boolean {
    this._validateToken(token);
    this._validateToken(newToken);
    if (!this._tokens.includes(token)) {
      return false;
    }
    this._tokens = this._tokens.map((v) => (v === token ? newToken : v));
    this._handleUpdate();
    return true;
  }

  supports(_token: string): boolean {
    return true;
  }

  get value(): string {
    return this._tokens.join(' ');
  }

  set value(value: string) {
    this._tokens = value.split(/\s+/).filter(Boolean);
    this._handleUpdate();
  }

  [Symbol.iterator](): IterableIterator<string> {
    return this._tokens[Symbol.iterator]();
  }
}
