import { expect, test } from 'vitest';
import { buildDefaultFontDeclaration } from './Font';
import { CanvasTextMetrics, DeterministicTextMetrics } from './TextMetrics';

test('canvas text metrics uses context measurement and provided font', () => {
  const context = {
    font: '',
    measureText(text: string) {
      return {
        width: text.length * 7,
        actualBoundingBoxAscent: 6,
        actualBoundingBoxDescent: 2,
      } as TextMetrics;
    },
  };

  const metrics = new CanvasTextMetrics(context);
  const result = metrics.measure({
    text: 'abcd',
    fontSize: 16,
    lineHeight: 5,
    font: 'italic normal bold 16px serif',
  });

  expect(context.font).toBe('italic normal bold 16px serif');
  expect(result.width).toBe(28);
  expect(result.height).toBe(8);
  expect(result.ascent).toBe(6);
  expect(result.descent).toBe(2);
});

test('canvas text metrics uses default font declaration when no font is provided', () => {
  const context = {
    font: '',
    measureText(_text: string) {
      return {
        width: 10,
        actualBoundingBoxAscent: 0,
        actualBoundingBoxDescent: 0,
      } as TextMetrics;
    },
  };

  const metrics = new CanvasTextMetrics(context);
  const result = metrics.measure({
    text: 'x',
    fontSize: 18,
    lineHeight: 12,
  });

  expect(context.font).toBe(buildDefaultFontDeclaration(18));
  expect(result.width).toBe(10);
  expect(result.height).toBe(12);
  expect(result.ascent).toBeCloseTo(14.4);
  expect(result.descent).toBe(0);
});

test('canvas text metrics falls back when no canvas context is available', () => {
  const metrics = new CanvasTextMetrics(null, new DeterministicTextMetrics());
  const result = metrics.measure({
    text: 'abcd',
    fontSize: 10,
    lineHeight: 12,
  });

  expect(result.width).toBeCloseTo(24);
  expect(result.height).toBe(12);
  expect(result.ascent).toBe(8);
  expect(result.descent).toBe(2);
});
