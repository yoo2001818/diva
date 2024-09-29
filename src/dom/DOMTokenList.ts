export class DOMTokenList {
  private tokens: string[] = [];

  get length(): number {
    return this.tokens.length;
  }

  item(index: number): string | null {
    return this.tokens[index] || null;
  }

  contains(token: string): boolean {
    throw new Error('Method not implemented.');
  }

  add(...tokens: string[]): void {
    throw new Error('Method not implemented.');
  }

  remove(...tokens: string[]): void {
    throw new Error('Method not implemented.');
  }

  toggle(token: string, force?: boolean): boolean {
    throw new Error('Method not implemented.');
  }

  replace(token: string, newToken: string): boolean {
    throw new Error('Method not implemented.');
  }

  supports(token: string): boolean {
    throw new Error('Method not implemented.');
  }

  get value(): string {
    return this.tokens.join(' ');
  }

  set value(value: string) {
    this.tokens = value.split(' ').filter(Boolean);
  }

  [Symbol.iterator](): IterableIterator<string> {
    return this.tokens[Symbol.iterator]();
  }
}
