import {
  buildDefaultFontDeclaration,
  DEFAULT_FONT_DECLARATION,
} from './Font';

export interface TextMetricsInput {
  text: string;
  fontSize: number;
  lineHeight: number;
  font?: string;
}

export interface TextMetricsResult {
  width: number;
  height: number;
  ascent: number;
  descent: number;
}

export interface TextMetricsProvider {
  measure(input: TextMetricsInput): TextMetricsResult;
}

export class DeterministicTextMetrics implements TextMetricsProvider {
  measure(input: TextMetricsInput): TextMetricsResult {
    const width = input.text.length * input.fontSize * 0.6;
    const ascent = input.fontSize * 0.8;
    const descent = input.fontSize * 0.2;
    const height = Math.max(input.lineHeight, ascent + descent);
    return {
      width,
      height,
      ascent,
      descent,
    };
  }
}

type CanvasMeasureContext = Pick<CanvasRenderingContext2D, 'font' | 'measureText'>;

function createCanvasMeasureContext(): CanvasMeasureContext | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    const offscreen = new OffscreenCanvas(1, 1);
    const context = offscreen.getContext('2d');
    if (context != null) {
      return context;
    }
  }

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context != null) {
      return context;
    }
  }

  return null;
}

export class CanvasTextMetrics implements TextMetricsProvider {
  private context: CanvasMeasureContext | null;
  private fallback: TextMetricsProvider;

  constructor(
    context: CanvasMeasureContext | null = createCanvasMeasureContext(),
    fallback: TextMetricsProvider = new DeterministicTextMetrics(),
  ) {
    this.context = context;
    this.fallback = fallback;
  }

  measure(input: TextMetricsInput): TextMetricsResult {
    if (this.context == null) {
      return this.fallback.measure(input);
    }

    const font = input.font ?? buildDefaultFontDeclaration(input.fontSize);
    this.context.font = font || DEFAULT_FONT_DECLARATION;
    const measured = this.context.measureText(input.text);
    const width = measured.width;
    if (!Number.isFinite(width)) {
      return this.fallback.measure(input);
    }

    const ascent = measured.actualBoundingBoxAscent;
    const descent = measured.actualBoundingBoxDescent;
    const measuredHeight = ascent + descent;
    const height =
      Number.isFinite(measuredHeight) && measuredHeight > 0
        ? Math.max(input.lineHeight, measuredHeight)
        : input.lineHeight;

    const fallback = this.fallback.measure(input);
    const safeAscent =
      Number.isFinite(ascent) && ascent > 0 ? ascent : fallback.ascent;
    const safeDescent =
      Number.isFinite(descent) && descent >= 0 ? descent : fallback.descent;

    return {
      width,
      height,
      ascent: safeAscent,
      descent: safeDescent,
    };
  }
}

export function defaultLineHeight(fontSize: number): number {
  return fontSize * 1.2;
}
