import { expect, test } from 'vitest';
import { CSSStyleDeclaration } from './CSSStyleDeclaration';

test('handles style declaration', () => {
  const decl = new CSSStyleDeclaration();
  decl.backgroundColor = '#ff0000';
  expect(decl.backgroundColor).toBe('#ff0000');
  decl.border = '1px solid black';
  expect(decl.border).toBe('1px solid black');
  decl.padding = '10px 20px';
  decl.paddingBottom = '30px';
  expect(decl.padding).toBe('10px 20px 30px');
});
