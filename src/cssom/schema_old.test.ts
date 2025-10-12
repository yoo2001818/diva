import { expect, test } from 'vitest';
import { CSSStyleDict, INITIAL_VALUES } from './dict';
import { schema } from './schema_old';

test('Schema converts padding', () => {
  const dict: CSSStyleDict = { ...INITIAL_VALUES };
  schema.padding.set(dict, '10px 20% 0');
  expect(schema.padding.get(dict)).toBe('10px 20% 0');
  expect(schema.paddingTop.get(dict)).toBe('10px');
});
