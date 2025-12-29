import { expect, test } from 'vitest';
import { CSSStyleDeclaration } from './CSSStyleDeclaration';

test('handles CSSStyleDeclaration basics', () => {
  const decl = new CSSStyleDeclaration();

  decl.backgroundColor = '#ff0000';
  expect(decl.getPropertyValue('background-color')).toBe('#ff0000');
  expect(decl.getPropertyValue('backgroundColor')).toBe('#ff0000');

  decl.setProperty('border', '1px solid black', 'important');
  expect(decl.border).toBe('1px solid black');
  expect(decl.getPropertyPriority('border')).toBe('important');

  decl.padding = '10px 20px';
  decl.paddingBottom = '30px';
  expect(decl.padding).toBe('10px 20px 30px');

  expect(decl.length).toBeGreaterThan(0);
  expect(decl.item(0)).toBeTruthy();

  decl.cssText = 'margin: 1px 2px; color: #00ff00 !important;';
  expect(decl.margin).toBe('1px 2px');
  expect(decl.getPropertyPriority('color')).toBe('important');
  expect(decl.cssText).toContain('margin: 1px 2px;');

  const removed = decl.removeProperty('margin');
  expect(removed).toBe('1px 2px');
  expect(decl.getPropertyValue('margin')).toBe('');
});

test('handles style coalescing spreading', () => {
  const decl = new CSSStyleDeclaration();

  decl.padding = '10px 20px';
  expect(decl.paddingBottom).toBe('10px');
  expect(decl.cssText).toBe('padding: 10px 20px;');
  expect(decl.length).toBe(4);
  expect(decl.item(0)).toBe('padding-top');
  expect(decl.item(1)).toBe('padding-right');
  expect(decl.item(2)).toBe('padding-bottom');
  expect(decl.item(3)).toBe('padding-left');
  decl.paddingBottom = '';
  expect(decl.padding).toBe('');
  expect(decl.cssText).toBe(
    'padding-top: 10px; padding-right: 20px; padding-left: 20px;',
  );
  expect(decl.length).toBe(3);
});

test('handles style coalescing collecting', () => {
  const decl = new CSSStyleDeclaration();

  decl.marginTop = '10px';
  decl.marginBottom = '10px';
  decl.marginLeft = '10px';
  decl.marginRight = '10px';
  expect(decl.margin).toBe('10px');
  expect(decl.length).toBe(4);
  expect(decl.cssText).toBe('margin: 10px;');
  decl.margin = '5px';
  expect(decl.margin).toBe('5px');
  expect(decl.length).toBe(4);
});
