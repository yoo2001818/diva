import { expect, test } from 'vitest';
import { Document } from '../dom/Document';

test('vendor stylesheet provides default block display for div', () => {
  const document = new Document();
  const element = document.createElement('div');
  document.documentElement!.append(element);

  const display = element._computedStyle.get('display');
  expect(display.type).toBe('block');
});

test('vendor stylesheet provides semantic inline defaults', () => {
  const document = new Document();

  const strong = document.createElement('strong');
  strong.append('bold text');
  const em = document.createElement('em');
  em.append('italic text');
  const code = document.createElement('code');
  code.append('const x = 1');
  const sub = document.createElement('sub');
  sub.append('sub');
  const sup = document.createElement('sup');
  sup.append('sup');

  document.documentElement!.append(strong, em, code, sub, sup);

  const strongWeight = strong._computedStyle.get('fontWeight');
  const emStyle = em._computedStyle.get('fontStyle');
  const codeFamily = code._computedStyle.get('fontFamily');
  const subAlign = sub._computedStyle.get('verticalAlign');
  const supAlign = sup._computedStyle.get('verticalAlign');

  expect(strongWeight.type).toBe('bold');
  expect(emStyle.type).toBe('italic');
  expect(codeFamily.length).toBeGreaterThan(0);
  expect(codeFamily[0].type).toBe('identifier');
  if (codeFamily[0].type === 'identifier') {
    expect(codeFamily[0].value).toBe('monospace');
  }
  expect(subAlign.type).toBe('sub');
  expect(supAlign.type).toBe('super');
});
