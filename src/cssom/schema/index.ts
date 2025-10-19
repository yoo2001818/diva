import { BACKGROND_SCHEMA } from './background';
import { BORDER_SCHEMA } from './border';
import { OUTLINE_SCHEMA } from './outline';
import { POSITION_SCHEMA } from './position';
import { TEXT_SCHEMA } from './text';

export const SCHEMA = {
  ...BACKGROND_SCHEMA,
  ...BORDER_SCHEMA,
  ...OUTLINE_SCHEMA,
  ...POSITION_SCHEMA,
  ...TEXT_SCHEMA,
};
