import { CSSStyleSheet } from './CSSStyleSheet';

const VENDOR_STYLES = `
head, script, style, meta, link, title {
  display: none;
}

html, body, address, article, aside, blockquote, dd, div, dl, dt, fieldset,
figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, li,
main, nav, ol, p, pre, section, table, tbody, thead, tfoot, tr, ul {
  display: block;
}

img, canvas, video {
  display: inline-block;
}

b, strong {
  font-weight: bold;
}

i, em {
  font-style: italic;
}

sub {
  vertical-align: sub;
}

sup {
  vertical-align: super;
}

code, kbd, samp, tt {
  font-family: monospace;
}

pre {
  white-space: pre;
  font-family: monospace;
}
`;

export function createVendorStyleSheet(): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(VENDOR_STYLES);
  return sheet;
}
