import { test, expect } from 'vitest';
import { Document } from '../Document';

test('Handles basic node insertion', () => {
  const doc = new Document();
  const html = doc.documentElement!;
  const h1 = doc.createElement('h1');
  const strong = doc.createElement('strong');
  strong.append('world!');
  h1.append('Hello, ', strong);
  html.appendChild(h1);
  expect(html.innerHTML).toBe('<h1>Hello, <strong>world!</strong></h1>');
});

test('Handles innerHTML correctly', () => {
  const text = '<h1 title="what">Hello, <strong>world!</strong></h1>';
  const doc = new Document();
  const html = doc.documentElement!;
  html.innerHTML = text;
  expect(html.innerHTML).toBe(text);
});
