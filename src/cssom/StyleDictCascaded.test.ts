import { expect, test } from 'vitest';
import { Document } from '../dom/Document';

function getBackgroundColorValue(document: Document, className: string): string {
  const element = document.createElement('div');
  element.className = className;
  document.documentElement!.append(element);
  const color = element._computedStyle.get('backgroundColor');
  return color.type === 'hash' ? color.value : color.type;
}

test('later matching class rule overrides earlier class rule with same specificity', () => {
  const document = new Document();

  const style = document.createElement('style');
  style.textContent = `
.panel { background: #ffffff; }
.nowrap-row { background: #fee2e2; }
`;
  document.documentElement!.append(style);

  const color = getBackgroundColorValue(document, 'panel nowrap-row');
  expect(color).toBe('fee2e2');
});

test('class attribute changes invalidate cascaded style cache', () => {
  const document = new Document();

  const style = document.createElement('style');
  style.textContent = `
.panel { background: #ffffff; }
.pre-block { background: #e0e7ff; }
`;
  document.documentElement!.append(style);

  const element = document.createElement('div');
  element.className = 'panel';
  document.documentElement!.append(element);

  const initial = element._computedStyle.get('backgroundColor');
  expect(initial.type).toBe('hash');
  if (initial.type === 'hash') {
    expect(initial.value).toBe('ffffff');
  }

  element.className = 'panel pre-block';
  const updated = element._computedStyle.get('backgroundColor');
  expect(updated.type).toBe('hash');
  if (updated.type === 'hash') {
    expect(updated.value).toBe('e0e7ff');
  }
});
