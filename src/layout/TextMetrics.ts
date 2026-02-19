export interface TextMetricsInput {
  text: string;
  fontSize: number;
  lineHeight: number;
}

export interface TextMetricsResult {
  width: number;
  height: number;
}

export interface TextMetricsProvider {
  measure(input: TextMetricsInput): TextMetricsResult;
}

export class DeterministicTextMetrics implements TextMetricsProvider {
  measure(input: TextMetricsInput): TextMetricsResult {
    const width = input.text.length * input.fontSize * 0.6;
    return {
      width,
      height: input.lineHeight,
    };
  }
}

export function defaultLineHeight(fontSize: number): number {
  return fontSize * 1.2;
}
