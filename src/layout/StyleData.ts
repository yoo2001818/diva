import { LayoutBox } from './Box';
import { FormattingContext } from './FormattingContext';

export class ElementStyleData {
  formattingContext: FormattingContext | null = null;
  boxes: LayoutBox[] = [];
}

export class TextStyleData {
  formattingContext: FormattingContext | null = null;
  boxes: { box: LayoutBox; glyphes: string }[] = [];
}
