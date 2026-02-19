import {
  CSSColor,
  CSSHash,
  CSSIndentifier,
  CSSKeyword,
  CSSLength,
  CSSNumber,
  CSSPercentage,
  CSSRgb,
  CSSString,
  CSSUrl,
} from '../dict';

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

  isEnd(): boolean {
    return this._offset === this._input.length;
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

  cssNumber(): CSSNumber | null {
    const prev = this._offset;
    const value = this.number();
    if (value == null) {
      this.undo(prev);
      return null;
    }
    return { type: 'number', value };
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

  keyword<T extends string>(...values: T[]): CSSKeyword<T> | null {
    const escaped = [...values]
      .sort((a, b) => b.length - a.length)
      .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const result = this.match(new RegExp(`(?:${escaped.join('|')})`, 'y'));
    if (result == null) {
      return null;
    }
    return { type: result[0] as T };
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
        this.undo(prev);
        return output;
      }
      prev = this._offset;
      this.ws();
      output.push(result);
    }
    return output;
  }

  any<T extends Record<string, () => any>>(
    items: T,
  ): { [K in keyof T]?: NonNullable<ReturnType<T[K]>> } {
    const output: Record<string, any> = {};
    while (true) {
      const remaining = Object.keys(items).filter((key) => output[key] == null);
      if (remaining.length === 0) break;
      let caught = false;
      for (let i = 0; i < remaining.length; i += 1) {
        const key = remaining[i];
        const result = items[key]();
        if (result != null) {
          this.ws();
          caught = true;
          output[key] = result;
        }
      }
      if (!caught) break;
    }
    return output as any;
  }

  sideShorthand<U extends () => any, T = NonNullable<ReturnType<U>>>(
    item: U,
  ): [T, T, T, T] | null {
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

  marginEntry() {
    return this.oneOf(
      () => this.length(),
      () => this.percentage(),
      () => this.keyword('auto'),
      () => this.keyword('inherit'),
    );
  }

  url(): CSSUrl | null {
    const result = this.match(/url\(([^\)]+)\)/y);
    if (result == null) {
      return null;
    }
    return { type: 'url', value: result[1] };
  }

  hash(): CSSHash | null {
    const result = this.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/y);
    if (result == null) {
      return null;
    }
    return { type: 'hash', value: result[1] };
  }

  identifier(): CSSIndentifier | null {
    const result = this.match(/[a-zA-Z][a-zA-Z0-9-]*/y);
    if (result == null) {
      return null;
    }
    return { type: 'identifier', value: result[0] };
  }

  string(): CSSString | null {
    const prev = this._offset;
    const doubleQuoted = this.match(/"([^"\\]|\\.)*"/y);
    if (doubleQuoted != null) {
      return { type: 'string', value: doubleQuoted[0].slice(1, -1) };
    }
    this.undo(prev);
    const singleQuoted = this.match(/'([^'\\]|\\.)*'/y);
    if (singleQuoted != null) {
      return { type: 'string', value: singleQuoted[0].slice(1, -1) };
    }
    this.undo(prev);
    return null;
  }

  fontFamily(): (CSSString | CSSIndentifier)[] | null {
    const first = this.oneOf(
      () => this.string(),
      () => this.identifier(),
    );
    if (first == null) {
      return null;
    }
    const output: (CSSString | CSSIndentifier)[] = [first];
    while (true) {
      const prev = this._offset;
      this.ws();
      const comma = this.match(/,/y);
      if (comma == null) {
        this.undo(prev);
        break;
      }
      this.ws();
      const next = this.oneOf(
        () => this.string(),
        () => this.identifier(),
      );
      if (next == null) {
        this.undo(prev);
        break;
      }
      output.push(next);
    }
    return output;
  }

  rgb(): CSSRgb | null {
    const result = this.match(
      /rgb\(([0-9]+)(?:,|\s+)([0-9]+)(?:,|\s+)([0-9]+)\)/y,
    );
    if (result == null) {
      return null;
    }
    return {
      type: 'rgb',
      args: [
        parseFloat(result[1]),
        parseFloat(result[2]),
        parseFloat(result[3]),
      ],
    };
  }

  color(): CSSColor | null {
    return this.oneOf(
      () => this.hash(),
      () => this.rgb(),
      () => this.identifier(),
    );
  }

  backgroundPosition():
    | [
        CSSLength | CSSPercentage | CSSKeyword<'left' | 'center' | 'right'>,
        CSSLength | CSSPercentage | CSSKeyword<'top' | 'center' | 'bottom'>,
      ]
    | null {
    const prev = this._offset;
    const items = this.oneOf(
      () =>
        this.series(
          () =>
            this.oneOf(
              () => this.length(),
              () => this.percentage(),
              () => this.keyword('left', 'center', 'right'),
            ),
          () =>
            this.oneOf(
              () => this.length(),
              () => this.percentage(),
              () => this.keyword('top', 'center', 'bottom'),
            ),
        ),
      () => this.length(),
      () => this.percentage(),
      () => this.keyword('left', 'center', 'right'),
      () => this.keyword('top', 'center', 'bottom'),
    );
    if (items == null) {
      this.undo(prev);
      return null;
    }
    if (Array.isArray(items)) {
      return [items[0]!, items[1]!];
    } else if (items.type === 'top' || items.type === 'bottom') {
      return [{ type: 'center' }, items];
    } else {
      return [items as any, { type: 'center' }];
    }
  }
}

export function parse<T>(input: string, func: (v: Parser) => T): T | null {
  const parser = new Parser();
  parser.reset(input);
  const result = func(parser);
  parser.ws();
  if (!parser.isEnd()) {
    // If it isn't finished, it has failed
    return null;
  }
  return result;
}
