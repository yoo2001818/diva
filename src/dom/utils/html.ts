export function htmlEscapeString(value: string, attrMode?: boolean): string {
  // https://html.spec.whatwg.org/multipage/parsing.html#escapingString
  let s = value.replace(/&/g, '&amp;').replace(/\u00A0/g, '&nbsp;');
  if (attrMode) {
    s = s.replace(/"/g, '&quot;');
  } else {
    s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  return s;
}

const VOID_ELEMENTS = [
  'AREA',
  'BASE',
  'BR',
  'COL',
  'EMBED',
  'HR',
  'IMG',
  'INPUT',
  'LINK',
  'META',
  'SOURCE',
  'TRACK',
  'WBR',
];

export function htmlIsVoid(tagName: string): boolean {
  return VOID_ELEMENTS.includes(tagName);
}
