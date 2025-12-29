import { kebabize } from '../utils';
import { BACKGROUND_SCHEMA } from './background';
import { StyleSchemaEntry } from './base';
import { BORDER_SCHEMA } from './border';
import { OUTLINE_SCHEMA } from './outline';
import { POSITION_SCHEMA } from './position';
import { TEXT_SCHEMA } from './text';

export const SCHEMA = {
  ...BACKGROUND_SCHEMA,
  ...BORDER_SCHEMA,
  ...OUTLINE_SCHEMA,
  ...POSITION_SCHEMA,
  ...TEXT_SCHEMA,
};

type Kebab<
  T extends string,
  A extends string = '',
> = T extends `${infer F}${infer R}`
  ? Kebab<R, `${A}${F extends Lowercase<F> ? '' : '-'}${Lowercase<F>}`>
  : A;

export const SCHEMA_CASED = {
  ...SCHEMA,
  ...(Object.fromEntries(
    Object.entries(SCHEMA).map(([key, value]) => [kebabize(key), value]),
  ) as Record<Kebab<keyof typeof SCHEMA>, StyleSchemaEntry>),
};
