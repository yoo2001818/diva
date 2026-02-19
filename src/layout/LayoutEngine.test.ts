import { expect, test } from 'vitest';
import { Document } from '../dom/Document';
import { LayoutEngine } from './LayoutEngine';
import { BlockLayoutNode } from './nodes/BlockLayoutNode';
import { InlineBoxLayoutNode } from './nodes/InlineBoxLayoutNode';
import { InlineBlockLayoutNode } from './nodes/InlineBlockLayoutNode';
import {
  InlineEndMarkerLayoutNode,
  InlineStartMarkerLayoutNode,
} from './nodes/InlineMarkerLayoutNode';
import { LayoutNode } from './nodes/LayoutNode';
import { LineBoxLayoutNode } from './nodes/LineBoxLayoutNode';
import { TextRunLayoutNode } from './nodes/TextRunLayoutNode';

function createBlock(document: Document, tagName: string = 'div') {
  const element = document.createElement(tagName);
  element.style.display = 'block';
  return element;
}

function getInlineBoxes(root: BlockLayoutNode): InlineBoxLayoutNode[] {
  return root.children.filter(
    (child): child is InlineBoxLayoutNode =>
      child instanceof InlineBoxLayoutNode,
  );
}

function getBlockChildren(root: BlockLayoutNode): BlockLayoutNode[] {
  return root.children.filter(
    (child): child is BlockLayoutNode => child instanceof BlockLayoutNode,
  );
}

function flattenText(line: LineBoxLayoutNode): string {
  return line.children
    .filter(
      (child): child is TextRunLayoutNode => child instanceof TextRunLayoutNode,
    )
    .map((child) => child.text)
    .join('');
}

function firstTextRun(line: LineBoxLayoutNode): TextRunLayoutNode | null {
  for (let i = 0; i < line.children.length; i += 1) {
    const child = line.children[i];
    if (child instanceof TextRunLayoutNode) {
      return child;
    }
  }
  return null;
}

function firstInlineBlock(
  line: LineBoxLayoutNode,
): InlineBlockLayoutNode | null {
  for (let i = 0; i < line.children.length; i += 1) {
    const child = line.children[i];
    if (child instanceof InlineBlockLayoutNode) {
      return child;
    }
  }
  return null;
}

function inlineBlockMarginTop(node: InlineBlockLayoutNode): number {
  return node.box.outerBox.top - node.box.margin.top;
}

function inlineBlockMarginBottom(node: InlineBlockLayoutNode): number {
  return (
    node.box.outerBox.top + node.box.outerBox.height + node.box.margin.bottom
  );
}

function textRunBaseline(node: TextRunLayoutNode): number {
  const ascent = node.ascent ?? 0;
  const descent = node.descent ?? 0;
  const glyphHeight = ascent + descent;
  const leading = Math.max(0, node.box.outerBox.height - glyphHeight);
  return node.box.outerBox.top + leading / 2 + ascent;
}

function lineContentRight(line: LineBoxLayoutNode): number {
  let right = line.box.outerBox.left;
  for (let i = 0; i < line.children.length; i += 1) {
    const child = line.children[i];
    const childRight = child.box.outerBox.left + child.box.outerBox.width;
    if (childRight > right) {
      right = childRight;
    }
  }
  return right;
}

function collectNodes(root: LayoutNode): LayoutNode[] {
  const out: LayoutNode[] = [root];
  const children = root.getChildren();
  for (let i = 0; i < children.length; i += 1) {
    out.push(...collectNodes(children[i]));
  }
  return out;
}

function collectTextRuns(root: LayoutNode): TextRunLayoutNode[] {
  const out: TextRunLayoutNode[] = [];
  if (root instanceof TextRunLayoutNode) {
    out.push(root);
  }
  const children = root.getChildren();
  for (let i = 0; i < children.length; i += 1) {
    out.push(...collectTextRuns(children[i]));
  }
  return out;
}

function marginTop(node: BlockLayoutNode): number {
  return node.box.outerBox.top - node.box.margin.top;
}

function marginLeft(node: BlockLayoutNode): number {
  return node.box.outerBox.left - node.box.margin.left;
}

function marginBottom(node: BlockLayoutNode): number {
  return marginTop(node) + node.box.outerBox.height + node.box.margin.height;
}

function marginRight(node: BlockLayoutNode): number {
  return marginLeft(node) + node.box.outerBox.width + node.box.margin.width;
}

test('splits inline flow around nested block nodes', () => {
  const document = new Document();
  const root = createBlock(document, 'div');

  const strong = document.createElement('strong');
  strong.style.display = 'inline';

  const nested = createBlock(document, 'div');
  nested.append('And this is a line.');

  strong.append('world!', nested, "You shouldn't do this.");
  root.append('Hello, ', strong, ' Probably.');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 300 });
  expect(layout.root).not.toBeNull();

  const childKinds = layout.root!.children.map((child) => child.kind);
  expect(childKinds).toEqual(['inline-box', 'block', 'inline-box']);
});

test('white-space normal wraps into multiple lines', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '100px';
  root.append('hello world hello world hello world');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 300, height: 200 });
  const inline = getInlineBoxes(layout.root!)[0];
  expect(inline).toBeTruthy();
  expect(inline.children.length).toBeGreaterThan(1);
});

test('white-space nowrap keeps one line', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '100px';
  root.style.whiteSpace = 'nowrap';
  root.append('hello world hello world hello world');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 300, height: 200 });
  const inline = getInlineBoxes(layout.root!)[0];
  expect(inline).toBeTruthy();
  expect(inline.children.length).toBe(1);
});

test('white-space pre preserves newline breaks', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '200px';
  root.style.whiteSpace = 'pre';
  root.append('A\nB\nC');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 300, height: 200 });
  const inline = getInlineBoxes(layout.root!)[0];
  expect(inline).toBeTruthy();
  expect(inline.children.length).toBe(3);
  expect(flattenText(inline.children[0])).toBe('A');
  expect(flattenText(inline.children[1])).toBe('B');
  expect(flattenText(inline.children[2])).toBe('C');
});

test('br forces line break in inline formatting context', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '220px';

  const br = document.createElement('br');
  root.append('line one', br, 'line two');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 300, height: 220 });
  const inline = getInlineBoxes(layout.root!)[0];
  expect(inline.children.length).toBe(2);
  expect(flattenText(inline.children[0])).toContain('line one');
  expect(flattenText(inline.children[1])).toContain('line two');
});

test('inline start/end markers reserve edge width from border and padding', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '300px';

  const span = document.createElement('span');
  span.style.display = 'inline';
  span.style.paddingLeft = '4px';
  span.style.paddingRight = '6px';
  span.style.borderLeft = '2px solid #000';
  span.style.borderRight = '3px solid #000';
  span.append('X');
  root.append(span);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 320, height: 140 });
  const line = getInlineBoxes(layout.root!)[0].children[0];

  const start = line.children.find(
    (child): child is InlineStartMarkerLayoutNode =>
      child instanceof InlineStartMarkerLayoutNode && child.domNode === span,
  );
  const end = line.children.find(
    (child): child is InlineEndMarkerLayoutNode =>
      child instanceof InlineEndMarkerLayoutNode && child.domNode === span,
  );

  expect(start).toBeTruthy();
  expect(end).toBeTruthy();
  expect(start!.box.outerBox.width).toBe(6);
  expect(end!.box.outerBox.width).toBe(9);
});

test('inline markers do not inflate line height', () => {
  const document = new Document();

  const plainRoot = createBlock(document, 'div');
  plainRoot.style.width = '320px';
  plainRoot.append('plain inline text');

  const decoratedRoot = createBlock(document, 'div');
  decoratedRoot.style.width = '320px';
  const span = document.createElement('span');
  span.style.display = 'inline';
  span.style.border = '2px solid #000';
  span.style.padding = '0 6px';
  span.append('plain inline text');
  decoratedRoot.append(span);

  const engine = new LayoutEngine();
  const plainLayout = engine.layout(plainRoot, { width: 340, height: 200 });
  const decoratedLayout = engine.layout(decoratedRoot, { width: 340, height: 200 });

  const plainLine = getInlineBoxes(plainLayout.root!)[0].children[0];
  const decoratedLine = getInlineBoxes(decoratedLayout.root!)[0].children[0];

  expect(Math.abs(plainLine.box.outerBox.height - decoratedLine.box.outerBox.height)).toBeLessThan(0.01);
});

test('line-height zero keeps text-only line boxes at zero height', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '80px';
  root.style.lineHeight = '0px';
  root.append('word word word word');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 200, height: 200 });
  const inline = getInlineBoxes(layout.root!)[0];
  expect(inline.children.length).toBeGreaterThan(1);

  const firstTop = inline.children[0].box.outerBox.top;
  for (let i = 0; i < inline.children.length; i += 1) {
    expect(Math.abs(inline.children[i].box.outerBox.height)).toBeLessThan(0.01);
    expect(Math.abs(inline.children[i].box.outerBox.top - firstTop)).toBeLessThan(0.01);
  }
});

test('line-height zero still expands for inline-block items', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '320px';
  root.style.lineHeight = '0px';

  const chip = document.createElement('span');
  chip.style.display = 'inline-block';
  chip.style.width = '30px';
  chip.style.height = '24px';

  root.append('a ', chip, ' b');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 400, height: 200 });
  const line = getInlineBoxes(layout.root!)[0].children[0];

  expect(line.box.outerBox.height).toBeGreaterThanOrEqual(24);
});

test('text-align right shifts inline content to the right edge', () => {
  const document = new Document();
  const leftRoot = createBlock(document, 'div');
  leftRoot.style.width = '300px';
  leftRoot.style.textAlign = 'left';
  leftRoot.style.whiteSpace = 'nowrap';
  leftRoot.append('align me');

  const rightRoot = createBlock(document, 'div');
  rightRoot.style.width = '300px';
  rightRoot.style.textAlign = 'right';
  rightRoot.style.whiteSpace = 'nowrap';
  rightRoot.append('align me');

  const engine = new LayoutEngine();
  const leftLayout = engine.layout(leftRoot, { width: 400, height: 200 });
  const rightLayout = engine.layout(rightRoot, { width: 400, height: 200 });
  const leftLine = getInlineBoxes(leftLayout.root!)[0].children[0];
  const rightLine = getInlineBoxes(rightLayout.root!)[0].children[0];
  const leftRun = firstTextRun(leftLine)!;
  const rightRun = firstTextRun(rightLine)!;

  expect(rightRun.box.outerBox.left).toBeGreaterThan(leftRun.box.outerBox.left);
  expect(
    Math.abs(
      lineContentRight(rightLine) -
        (rightLine.box.outerBox.left + rightLine.box.outerBox.width),
    ),
  ).toBeLessThan(0.01);
});

test('text-align center positions inline content in the middle', () => {
  const document = new Document();
  const leftRoot = createBlock(document, 'div');
  leftRoot.style.width = '300px';
  leftRoot.style.textAlign = 'left';
  leftRoot.style.whiteSpace = 'nowrap';
  leftRoot.append('center me');

  const centerRoot = createBlock(document, 'div');
  centerRoot.style.width = '300px';
  centerRoot.style.textAlign = 'center';
  centerRoot.style.whiteSpace = 'nowrap';
  centerRoot.append('center me');

  const engine = new LayoutEngine();
  const leftLayout = engine.layout(leftRoot, { width: 400, height: 200 });
  const centerLayout = engine.layout(centerRoot, { width: 400, height: 200 });
  const leftLine = getInlineBoxes(leftLayout.root!)[0].children[0];
  const centerLine = getInlineBoxes(centerLayout.root!)[0].children[0];
  const leftRun = firstTextRun(leftLine)!;
  const centerRun = firstTextRun(centerLine)!;
  const leftContentWidth =
    lineContentRight(leftLine) - leftLine.box.outerBox.left;

  expect(centerRun.box.outerBox.left).toBeGreaterThan(
    leftRun.box.outerBox.left,
  );
  expect(
    Math.abs(
      centerRun.box.outerBox.left -
        (centerLine.box.outerBox.left +
          (centerLine.box.outerBox.width - leftContentWidth) / 2),
    ),
  ).toBeLessThan(0.5);
});

test('text-align justify expands spaces on non-last wrapped lines', () => {
  const document = new Document();
  const leftRoot = createBlock(document, 'div');
  leftRoot.style.width = '180px';
  leftRoot.style.textAlign = 'left';
  leftRoot.append('one two three four five six seven eight nine');

  const justifyRoot = createBlock(document, 'div');
  justifyRoot.style.width = '180px';
  justifyRoot.style.textAlign = 'justify';
  justifyRoot.append('one two three four five six seven eight nine');

  const engine = new LayoutEngine();
  const leftLayout = engine.layout(leftRoot, { width: 250, height: 300 });
  const justifyLayout = engine.layout(justifyRoot, { width: 250, height: 300 });
  const leftLine = getInlineBoxes(leftLayout.root!)[0].children[0];
  const justifyLine = getInlineBoxes(justifyLayout.root!)[0].children[0];

  expect(lineContentRight(justifyLine)).toBeGreaterThan(
    lineContentRight(leftLine),
  );
  expect(
    Math.abs(
      lineContentRight(justifyLine) -
        (justifyLine.box.outerBox.left + justifyLine.box.outerBox.width),
    ),
  ).toBeLessThan(1);
});

test('inline boxes default to transparent background', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.append('Hello, world!');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  const inlineBox = getInlineBoxes(layout.root!)[0];
  expect(inlineBox).toBeTruthy();
  expect(inlineBox.box.background.color).toEqual({
    type: 'identifier',
    value: 'transparent',
  });
});

test('vertical-align top and bottom align to line box edges', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '400px';

  const topSpan = document.createElement('span');
  topSpan.style.display = 'inline-block';
  topSpan.style.width = '30px';
  topSpan.style.height = '26px';
  topSpan.style.verticalAlign = 'top';

  const bottomSpan = document.createElement('span');
  bottomSpan.style.display = 'inline-block';
  bottomSpan.style.width = '30px';
  bottomSpan.style.height = '26px';
  bottomSpan.style.verticalAlign = 'bottom';

  root.append('A ', topSpan, ' B ', bottomSpan, ' C');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  const line = getInlineBoxes(layout.root!)[0].children[0];
  const [first, second] = line.children.filter(
    (child): child is InlineBlockLayoutNode =>
      child instanceof InlineBlockLayoutNode,
  );
  expect(first).toBeTruthy();
  expect(second).toBeTruthy();

  const lineTop = line.box.outerBox.top;
  const lineBottom = line.box.outerBox.top + line.box.outerBox.height;
  expect(Math.abs(inlineBlockMarginTop(first) - lineTop)).toBeLessThan(0.01);
  expect(Math.abs(inlineBlockMarginBottom(second) - lineBottom)).toBeLessThan(
    0.01,
  );
});

test('baseline text runs with same style keep a stable top and baseline', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '600px';
  root.style.fontSize = '20px';
  root.style.lineHeight = '28px';
  root.append('mm oo gg pp HH yy zz');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 700, height: 200 });
  const line = getInlineBoxes(layout.root!)[0].children[0];
  const runs = line.children.filter(
    (child): child is TextRunLayoutNode =>
      child instanceof TextRunLayoutNode && child.text.trim().length > 0,
  );
  expect(runs.length).toBeGreaterThan(2);

  const firstTop = runs[0].box.outerBox.top;
  const firstBaseline = textRunBaseline(runs[0]);
  for (let i = 1; i < runs.length; i += 1) {
    expect(Math.abs(runs[i].box.outerBox.top - firstTop)).toBeLessThan(0.01);
    expect(Math.abs(textRunBaseline(runs[i]) - firstBaseline)).toBeLessThan(
      0.01,
    );
  }
});

test('vertical-align middle/sub/super apply expected vertical direction shifts', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '450px';

  const baselineSpan = document.createElement('span');
  baselineSpan.style.display = 'inline-block';
  baselineSpan.style.width = '28px';
  baselineSpan.style.height = '20px';

  const middleSpan = document.createElement('span');
  middleSpan.style.display = 'inline-block';
  middleSpan.style.width = '28px';
  middleSpan.style.height = '20px';
  middleSpan.style.verticalAlign = 'middle';

  const superSpan = document.createElement('span');
  superSpan.style.display = 'inline-block';
  superSpan.style.width = '28px';
  superSpan.style.height = '20px';
  superSpan.style.verticalAlign = 'super';

  const subSpan = document.createElement('span');
  subSpan.style.display = 'inline-block';
  subSpan.style.width = '28px';
  subSpan.style.height = '20px';
  subSpan.style.verticalAlign = 'sub';

  root.append(
    'x ',
    baselineSpan,
    ' ',
    middleSpan,
    ' ',
    superSpan,
    ' ',
    subSpan,
    ' y',
  );

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  const line = getInlineBoxes(layout.root!)[0].children[0];
  const nodes = line.children.filter(
    (child): child is InlineBlockLayoutNode =>
      child instanceof InlineBlockLayoutNode,
  );
  const baselineTop = inlineBlockMarginTop(nodes[0]);
  const middleTop = inlineBlockMarginTop(nodes[1]);
  const superTop = inlineBlockMarginTop(nodes[2]);
  const subTop = inlineBlockMarginTop(nodes[3]);

  expect(middleTop).toBeGreaterThan(baselineTop);
  expect(superTop).toBeLessThan(baselineTop);
  expect(subTop).toBeGreaterThan(baselineTop);
});

test('vertical-align length and percentage shift baseline upward for positive values', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '420px';

  const baselineSpan = document.createElement('span');
  baselineSpan.style.display = 'inline-block';
  baselineSpan.style.width = '24px';
  baselineSpan.style.height = '20px';

  const lengthSpan = document.createElement('span');
  lengthSpan.style.display = 'inline-block';
  lengthSpan.style.width = '24px';
  lengthSpan.style.height = '20px';
  lengthSpan.style.verticalAlign = '6px';

  const pctSpan = document.createElement('span');
  pctSpan.style.display = 'inline-block';
  pctSpan.style.width = '24px';
  pctSpan.style.height = '20px';
  pctSpan.style.verticalAlign = '50%';

  root.append('a ', baselineSpan, ' ', lengthSpan, ' ', pctSpan, ' b');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  const line = getInlineBoxes(layout.root!)[0].children[0];
  const nodes = line.children.filter(
    (child): child is InlineBlockLayoutNode =>
      child instanceof InlineBlockLayoutNode,
  );
  const baselineTop = inlineBlockMarginTop(nodes[0]);
  const lengthTop = inlineBlockMarginTop(nodes[1]);
  const pctTop = inlineBlockMarginTop(nodes[2]);

  expect(lengthTop).toBeLessThan(baselineTop);
  expect(pctTop).toBeLessThan(lengthTop);
});

test('vertical-align text-top and text-bottom align opposite edges around baseline', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '460px';
  root.style.fontSize = '20px';
  root.style.lineHeight = '28px';

  const topSpan = document.createElement('span');
  topSpan.style.display = 'inline-block';
  topSpan.style.width = '30px';
  topSpan.style.height = '16px';
  topSpan.style.verticalAlign = 'text-top';

  const bottomSpan = document.createElement('span');
  bottomSpan.style.display = 'inline-block';
  bottomSpan.style.width = '30px';
  bottomSpan.style.height = '16px';
  bottomSpan.style.verticalAlign = 'text-bottom';

  root.append('T', topSpan, 'M', bottomSpan, 'B');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  const line = getInlineBoxes(layout.root!)[0].children[0];
  const run = firstTextRun(line)!;
  const [textTopNode, textBottomNode] = line.children.filter(
    (child): child is InlineBlockLayoutNode =>
      child instanceof InlineBlockLayoutNode,
  );
  const baseline = textRunBaseline(run);

  expect(inlineBlockMarginTop(textTopNode)).toBeLessThan(baseline);
  expect(inlineBlockMarginBottom(textBottomNode)).toBeGreaterThan(baseline);
});

test('inline-block baseline uses last internal line baseline when present', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '520px';

  const inlineBlock = document.createElement('span');
  inlineBlock.style.display = 'inline-block';
  inlineBlock.style.width = '130px';
  inlineBlock.style.border = '1px solid black';
  inlineBlock.style.padding = '4px';
  inlineBlock.append('inside baseline');

  root.append('before ', inlineBlock, ' after');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 600, height: 220 });
  const line = getInlineBoxes(layout.root!)[0].children[0];
  const run = firstTextRun(line)!;
  const ib = firstInlineBlock(line)!;

  const nestedInline = getInlineBoxes(ib.block!)[0];
  const nestedLine = nestedInline.children[nestedInline.children.length - 1];
  const nestedBaseline =
    nestedLine.box.outerBox.top + nestedLine.baselineOffset;
  const outerBaseline = textRunBaseline(run);

  expect(Math.abs(nestedBaseline - outerBaseline)).toBeLessThan(1);
});

test('inline-block baseline falls back to border-box bottom when no line exists', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '420px';

  const emptyInlineBlock = document.createElement('span');
  emptyInlineBlock.style.display = 'inline-block';
  emptyInlineBlock.style.width = '60px';
  emptyInlineBlock.style.height = '24px';
  emptyInlineBlock.style.border = '1px solid black';

  root.append('before ', emptyInlineBlock, ' after');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  const line = getInlineBoxes(layout.root!)[0].children[0];
  const run = firstTextRun(line)!;
  const ib = firstInlineBlock(line)!;

  const outerBaseline = textRunBaseline(run);
  const fallbackBaseline = ib.box.outerBox.top + ib.box.outerBox.height;
  expect(Math.abs(fallbackBaseline - outerBaseline)).toBeLessThan(1);
});

test('float left shifts active lines to the right and releases below float', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '180px';

  const floater = createBlock(document, 'div');
  floater.style.float = 'left';
  floater.style.width = '50px';
  floater.style.height = '40px';

  root.append(
    floater,
    'This is a long sentence that should wrap around the floating box and then return to full width below.',
  );

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 180, height: 300 });
  const floatNode = getBlockChildren(layout.root!).find(
    (child) => child.domNode === floater,
  )!;
  const inline = getInlineBoxes(layout.root!)[0];
  expect(inline.children.length).toBeGreaterThan(1);

  const firstLine = inline.children[0];
  const floatRightEdge = marginRight(floatNode);
  expect(firstLine.box.outerBox.left).toBe(floatRightEdge);

  const releasedLine = inline.children.find(
    (line) => line.box.outerBox.top >= marginBottom(floatNode),
  );
  expect(releasedLine).toBeTruthy();
  if (releasedLine != null) {
    expect(releasedLine.box.outerBox.left).toBe(layout.root!.box.innerBox.left);
  }
});

test('float right reduces first line width from the right side', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '180px';

  const floater = createBlock(document, 'div');
  floater.style.float = 'right';
  floater.style.width = '60px';
  floater.style.height = '30px';

  root.append(
    floater,
    'This line should wrap with reduced width because of right float.',
  );

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 180, height: 250 });
  const floatNode = getBlockChildren(layout.root!).find(
    (child) => child.domNode === floater,
  )!;
  const inline = getInlineBoxes(layout.root!)[0];
  const firstLine = inline.children[0];

  expect(firstLine.box.outerBox.left).toBe(layout.root!.box.innerBox.left);
  expect(firstLine.box.outerBox.width).toBeLessThan(
    layout.root!.box.innerBox.width,
  );
  expect(firstLine.box.outerBox.left + firstLine.box.outerBox.width).toBe(
    marginLeft(floatNode),
  );
});

test('block child inline content avoids active left and right floats', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '220px';

  const leftFloat = createBlock(document, 'div');
  leftFloat.style.float = 'left';
  leftFloat.style.width = '50px';
  leftFloat.style.height = '60px';

  const rightFloat = createBlock(document, 'div');
  rightFloat.style.float = 'right';
  rightFloat.style.width = '60px';
  rightFloat.style.height = '60px';

  const paragraph = createBlock(document, 'div');
  paragraph.append(
    'This paragraph should avoid both floats on its first line instead of painting over them.',
  );

  root.append(leftFloat, rightFloat, paragraph);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 220, height: 320 });
  const blocks = getBlockChildren(layout.root!);
  const left = blocks.find((node) => node.domNode === leftFloat)!;
  const right = blocks.find((node) => node.domNode === rightFloat)!;
  const copy = blocks.find((node) => node.domNode === paragraph)!;
  const inline = getInlineBoxes(copy)[0];
  const firstLine = inline.children[0];

  expect(firstLine.box.outerBox.left).toBeGreaterThanOrEqual(marginRight(left));
  expect(
    firstLine.box.outerBox.left + firstLine.box.outerBox.width,
  ).toBeLessThanOrEqual(marginLeft(right));
});

test('clear both block starts below both active floats', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '240px';

  const leftFloat = createBlock(document, 'div');
  leftFloat.style.float = 'left';
  leftFloat.style.width = '40px';
  leftFloat.style.height = '60px';

  const rightFloat = createBlock(document, 'div');
  rightFloat.style.float = 'right';
  rightFloat.style.width = '60px';
  rightFloat.style.height = '45px';

  const clearBlock = createBlock(document, 'div');
  clearBlock.style.clear = 'both';
  clearBlock.style.height = '20px';

  root.append(leftFloat, rightFloat, clearBlock);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 240, height: 300 });
  const blocks = getBlockChildren(layout.root!);
  const left = blocks.find((node) => node.domNode === leftFloat)!;
  const right = blocks.find((node) => node.domNode === rightFloat)!;
  const clear = blocks.find((node) => node.domNode === clearBlock)!;

  const clearTop = marginTop(clear);
  expect(clearTop).toBeGreaterThanOrEqual(
    Math.max(marginBottom(left), marginBottom(right)),
  );
});

test('block text updates float avoidance per line when float heights differ', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '320px';

  const leftFloat = createBlock(document, 'div');
  leftFloat.style.float = 'left';
  leftFloat.style.width = '70px';
  leftFloat.style.height = '12px';
  leftFloat.style.marginRight = '10px';

  const rightFloat = createBlock(document, 'div');
  rightFloat.style.float = 'right';
  rightFloat.style.width = '90px';
  rightFloat.style.height = '70px';
  rightFloat.style.marginLeft = '10px';

  const paragraph = createBlock(document, 'div');
  paragraph.append(
    'This paragraph demonstrates wrapping around a right float while a short left float only affects the first line.',
  );

  root.append(leftFloat, rightFloat, paragraph);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 320, height: 320 });
  const blocks = getBlockChildren(layout.root!);
  const left = blocks.find((node) => node.domNode === leftFloat)!;
  const right = blocks.find((node) => node.domNode === rightFloat)!;
  const copy = blocks.find((node) => node.domNode === paragraph)!;
  const inline = getInlineBoxes(copy)[0];

  expect(inline.children.length).toBeGreaterThan(1);
  const firstLine = inline.children[0];
  const secondLine = inline.children[1];

  expect(firstLine.box.outerBox.left).toBeGreaterThanOrEqual(marginRight(left));
  expect(secondLine.box.outerBox.left).toBe(copy.box.innerBox.left);
  expect(
    secondLine.box.outerBox.left + secondLine.box.outerBox.width,
  ).toBeLessThanOrEqual(marginLeft(right));
});

test('inline-block wraps with floats active', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '200px';

  const leftFloat = createBlock(document, 'div');
  leftFloat.style.float = 'left';
  leftFloat.style.width = '40px';
  leftFloat.style.height = '40px';

  const ib = document.createElement('span');
  ib.style.display = 'inline-block';
  ib.style.width = '120px';
  ib.style.height = '20px';

  root.append(leftFloat, ib, ' tail tail tail');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 200, height: 300 });
  const inline = getInlineBoxes(layout.root!)[0];
  expect(inline.children.length).toBeGreaterThan(1);

  const firstLineHasInlineBlock = inline.children[0].children.some(
    (child) => child instanceof InlineBlockLayoutNode,
  );
  expect(firstLineHasInlineBlock).toBe(true);
});

test('inline-block internal text remains inside inline-block border box', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '360px';

  const chip = document.createElement('span');
  chip.style.display = 'inline-block';
  chip.style.width = '120px';
  chip.style.padding = '4px';
  chip.style.border = '1px solid black';
  chip.append('chip text');

  root.append('before ', chip, ' after');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 400, height: 200 });
  const line = getInlineBoxes(layout.root!)[0].children[0];
  const inlineBlock = firstInlineBlock(line);
  expect(inlineBlock).toBeTruthy();
  expect(inlineBlock!.block).toBeTruthy();

  const runs = collectTextRuns(inlineBlock!.block!);
  expect(runs.length).toBeGreaterThan(0);
  const borderTop = inlineBlock!.box.outerBox.top;
  const borderBottom =
    inlineBlock!.box.outerBox.top + inlineBlock!.box.outerBox.height;

  for (let i = 0; i < runs.length; i += 1) {
    const top = runs[i].box.outerBox.top;
    const bottom = runs[i].box.outerBox.top + runs[i].box.outerBox.height;
    expect(top).toBeGreaterThanOrEqual(borderTop - 0.01);
    expect(bottom).toBeLessThanOrEqual(borderBottom + 0.01);
  }
});

test('long token overflows unsplit when line width is too small', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '50px';
  root.append('Supercalifragilisticexpialidocious');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 200, height: 200 });
  const inline = getInlineBoxes(layout.root!)[0];
  expect(inline.children.length).toBe(1);
  const line = inline.children[0];
  const run = line.children.find((child) => child instanceof TextRunLayoutNode);
  expect(run).toBeTruthy();
  if (run != null) {
    expect(run.box.outerBox.width).toBeGreaterThan(line.box.outerBox.width);
  }
});

test('marker continuity across wrapped lines', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '90px';

  const strong = document.createElement('strong');
  strong.style.display = 'inline';
  strong.append('alpha beta gamma delta epsilon');
  root.append(strong);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 90, height: 250 });
  const inline = getInlineBoxes(layout.root!)[0];
  expect(inline.children.length).toBeGreaterThan(1);

  const firstLineLast =
    inline.children[0].children[inline.children[0].children.length - 1];
  const secondLineFirst = inline.children[1].children[0];
  expect(firstLineLast instanceof InlineEndMarkerLayoutNode).toBe(false);
  expect(secondLineFirst instanceof InlineStartMarkerLayoutNode).toBe(false);
});

test('collapses adjacent vertical margins between normal-flow block siblings', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '240px';

  const first = createBlock(document, 'div');
  first.style.height = '10px';
  first.style.marginBottom = '20px';

  const second = createBlock(document, 'div');
  second.style.height = '10px';
  second.style.marginTop = '35px';

  root.append(first, second);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 240, height: 240 });
  const blocks = getBlockChildren(layout.root!);
  const firstNode = blocks.find((node) => node.domNode === first)!;
  const secondNode = blocks.find((node) => node.domNode === second)!;

  const firstBorderBottom =
    firstNode.box.outerBox.top + firstNode.box.outerBox.height;
  const secondBorderTop = secondNode.box.outerBox.top;
  expect(secondBorderTop - firstBorderBottom).toBe(35);
});

test('collapses parent and first child top margins when parent has no top border or padding', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '240px';
  root.style.paddingTop = '1px';

  const parent = createBlock(document, 'div');
  parent.style.marginTop = '10px';

  const first = createBlock(document, 'div');
  first.style.marginTop = '35px';
  first.style.height = '10px';
  parent.append(first);

  root.append(parent);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 240, height: 240 });
  const parentNode = getBlockChildren(layout.root!).find(
    (node) => node.domNode === parent,
  )!;
  const firstNode = getBlockChildren(parentNode).find(
    (node) => node.domNode === first,
  )!;

  expect(parentNode.box.outerBox.top - layout.root!.box.innerBox.top).toBe(35);
  expect(firstNode.box.outerBox.top).toBe(parentNode.box.outerBox.top);
});

test('collapses parent and last child bottom margins and propagates outward', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '260px';

  const parent = createBlock(document, 'div');
  parent.style.marginBottom = '10px';
  const inner = createBlock(document, 'div');
  inner.style.height = '10px';
  inner.style.marginBottom = '30px';
  parent.append(inner);

  const sibling = createBlock(document, 'div');
  sibling.style.height = '10px';
  sibling.style.marginTop = '20px';

  root.append(parent, sibling);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 260, height: 260 });
  const blocks = getBlockChildren(layout.root!);
  const parentNode = blocks.find((node) => node.domNode === parent)!;
  const siblingNode = blocks.find((node) => node.domNode === sibling)!;

  expect(parentNode.box.outerBox.height).toBe(10);
  const parentBorderBottom =
    parentNode.box.outerBox.top + parentNode.box.outerBox.height;
  const siblingBorderTop = siblingNode.box.outerBox.top;
  expect(siblingBorderTop - parentBorderBottom).toBe(30);
});

test('innerHTML whitespace between block siblings does not consume block boundaries', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '240px';
  root.innerHTML = `
    <div style="height: 10px; background: #ff0000;"></div>
    <div style="height: 12px; background: #00ff00;"></div>
  `;

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 240, height: 200 });
  const blocks = getBlockChildren(layout.root!);

  expect(blocks.length).toBe(2);
  expect(blocks[0].box.outerBox.height).toBe(10);
  expect(blocks[1].box.outerBox.height).toBe(12);
});

test('uses tag default display for div without explicit display style', () => {
  const document = new Document();
  const root = document.createElement('div');
  root.style.width = '300px';

  const child = document.createElement('div');
  child.style.height = '20px';
  child.style.backgroundColor = '#ff0000';
  root.append(child);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 800, height: 400 });
  const childBlock = getBlockChildren(layout.root!)[0];

  expect(childBlock).toBeTruthy();
  expect(childBlock.box.outerBox.width).toBe(300);
  expect(childBlock.box.outerBox.height).toBe(20);
});

test('registers every tree node in nodesByDom mapping', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  const strong = document.createElement('strong');
  strong.style.display = 'inline';
  strong.append('Hello world hello world');
  root.append(strong, document.createElement('div'));

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 140, height: 200 });

  const all = collectNodes(layout.root!);
  for (let i = 0; i < all.length; i += 1) {
    const node = all[i];
    const mapped = layout.nodesByDom.get(node.domNode) ?? [];
    expect(mapped.includes(node)).toBe(true);
  }
});

test('inline-box invariants for wrapped content', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '100px';
  root.append('wrap me wrap me wrap me');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 300, height: 200 });
  const inlineBoxes = getInlineBoxes(layout.root!);

  expect(inlineBoxes.length).toBeGreaterThan(0);
  for (let i = 0; i < inlineBoxes.length; i += 1) {
    expect(inlineBoxes[i].children.length).toBeGreaterThanOrEqual(1);
    for (let j = 0; j < inlineBoxes[i].children.length; j += 1) {
      expect(inlineBoxes[i].children[j].kind).toBe('line-box');
    }
  }
});
