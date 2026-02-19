export type WhiteSpaceMode = 'normal' | 'nowrap' | 'pre';

export interface TextToken {
  type: 'word' | 'space' | 'newline';
  text: string;
  sourceLength: number;
}

function isWhitespace(ch: string): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f';
}

function tokenizeNormalOrNoWrap(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (isWhitespace(ch)) {
      let j = i + 1;
      while (j < text.length && isWhitespace(text[j])) {
        j += 1;
      }
      tokens.push({
        type: 'space',
        text: ' ',
        sourceLength: j - i,
      });
      i = j;
      continue;
    }

    let j = i + 1;
    while (j < text.length && !isWhitespace(text[j])) {
      j += 1;
    }
    tokens.push({
      type: 'word',
      text: text.slice(i, j),
      sourceLength: j - i,
    });
    i = j;
  }

  return tokens;
}

function tokenizePre(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (ch === '\n') {
      tokens.push({ type: 'newline', text: '\n', sourceLength: 1 });
      i += 1;
      continue;
    }

    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\f') {
      let j = i + 1;
      while (j < text.length) {
        const c = text[j];
        if (c === '\n' || !(c === ' ' || c === '\t' || c === '\r' || c === '\f')) {
          break;
        }
        j += 1;
      }
      tokens.push({
        type: 'space',
        text: text.slice(i, j),
        sourceLength: j - i,
      });
      i = j;
      continue;
    }

    let j = i + 1;
    while (j < text.length) {
      const c = text[j];
      if (c === '\n' || c === ' ' || c === '\t' || c === '\r' || c === '\f') {
        break;
      }
      j += 1;
    }
    tokens.push({
      type: 'word',
      text: text.slice(i, j),
      sourceLength: j - i,
    });
    i = j;
  }

  return tokens;
}

export function tokenizeText(text: string, mode: WhiteSpaceMode): TextToken[] {
  if (text.length === 0) {
    return [];
  }
  if (mode === 'pre') {
    return tokenizePre(text);
  }
  return tokenizeNormalOrNoWrap(text);
}
