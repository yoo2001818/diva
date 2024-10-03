import { CSSKeyword, CSSLength, CSSPercentage } from './dict';

export class Parser {
  _input: string = '';
  _offset: number = 0;

  reset(input: string): void {
    this._input = input;
    this._offset = 0;
  }

  undo(offset: number): void {
    this._offset = offset;
  }

  match(re: RegExp): RegExpExecArray | null {
    re.lastIndex = this._offset;
    const result = re.exec(this._input);
    if (result) {
      this._offset = re.lastIndex;
    }
    return result;
  }

  integer(): number | null {
    const result = this.match(/[+\-]?[0-9]+/y);
    if (result == null) return null;
    return parseInt(result[0], 10);
  }

  number(): number | null {
    const result = this.match(/[+\-]?[0-9]*(\.[0-9]+)?|[+\-]?[0-9]+/y);
    if (result == null) return null;
    return parseFloat(result[0]);
  }

  length(): CSSLength | null {
    const prev = this._offset;
    const value = this.number();
    if (value == null) {
      this.undo(prev);
      return null;
    }
    const unit = this.match(/em|ex|in|cm|mm|pt|pc|px/y);
    if (unit == null && value !== 0) {
      this.undo(prev);
      return null;
    }
    return {
      type: 'length',
      unit: unit?.[0] as CSSLength['unit'],
      value,
    };
  }

  percentage(): CSSPercentage | null {
    const prev = this._offset;
    const value = this.number();
    if (value == null) {
      this.undo(prev);
      return null;
    }
    const unit = this.match(/%/y);
    if (unit == null) {
      this.undo(prev);
      return null;
    }
    return {
      type: 'percentage',
      value,
    };
  }

  keyword<T extends string>(value: T): CSSKeyword<T> | null {
    const result = this.match(new RegExp(value, 'y'));
    if (result == null) {
      return null;
    }
    return { type: value };
  }

  ws(): true | null {
    const result = this.match(/\s+/y);
    if (result == null) {
      return null;
    }
    return true;
  }

  oneOf<U extends (() => any)[]>(...items: U): ReturnType<U[number]> | null {
    const prev = this._offset;
    for (let i = 0; i < items.length; i += 1) {
      const result = items[i]();
      if (result != null) {
        return result;
      }
      this.undo(prev);
    }
    return null;
  }

  series<U extends (() => any)[]>(
    ...items: U
  ): { [K in keyof U]: ReturnType<U[K]> } | null {
    const prev = this._offset;
    const output: any[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const result = items[i]();
      if (result == null) {
        this.undo(prev);
        return null;
      }
      output.push(result);
    }
    return output as { [K in keyof U]: ReturnType<U[K]> };
  }

  array<U extends () => any>(item: U, max: number): ReturnType<U>[] {
    let prev = this._offset;
    const output: ReturnType<U>[] = [];
    for (let i = 0; i < max; i += 1) {
      const result = item();
      if (result == null) {
        this.undo(this._offset);
        return output;
      }
      prev = this._offset;
      this.ws();
      output.push(result);
    }
    return output;
  }

  sideShorthand<U extends () => any>(
    item: U,
  ): [ReturnType<U>, ReturnType<U>, ReturnType<U>, ReturnType<U>] | null {
    const items = this.array(item, 4);
    // top right bottom left
    switch (items.length) {
      case 0:
        return null;
      case 1:
        return [items[0], items[0], items[0], items[0]];
      case 2:
        return [items[0], items[1], items[0], items[1]];
      case 3:
        return [items[0], items[1], items[2], items[1]];
      case 4:
        return [items[0], items[1], items[2], items[3]];
      default:
        return null;
    }
  }

  paddingEntry() {
    return this.oneOf(
      () => this.length(),
      () => this.percentage(),
      () => this.keyword('inherit'),
    );
  }

  padding() {
    return this.sideShorthand(() => this.paddingEntry());
  }

  marginEntry() {
    return this.oneOf(
      () => this.length(),
      () => this.percentage(),
      () => this.keyword('auto'),
      () => this.keyword('inherit'),
    );
  }

  margin() {
    return this.sideShorthand(() => this.marginEntry());
  }
}
