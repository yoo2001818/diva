import { expect, test } from 'vitest';
import { Document } from '../dom/Document';
import { LayoutEngine } from './LayoutEngine';
import { BlockLayoutNode } from './nodes/BlockLayoutNode';
import { InlineBoxLayoutNode } from './nodes/InlineBoxLayoutNode';
import { InlineBlockLayoutNode } from './nodes/InlineBlockLayoutNode';
import { InlineStartMarkerLayoutNode } from './nodes/InlineMarkerLayoutNode';
import { LineItemLayoutNode } from './nodes/LineBoxLayoutNode';
import { LayoutNode } from './nodes/LayoutNode';

function createBlock(document: Document, tagName: string = 'div') {
  const element = document.createElement(tagName);
  element.style.display = 'block';
  return element;
}

function getInlineItems(root: BlockLayoutNode): LineItemLayoutNode[] {
  const items: LineItemLayoutNode[] = [];
  const inlineBoxes = root.children.filter(
    (child): child is InlineBoxLayoutNode => child instanceof InlineBoxLayoutNode,
  );
  for (let i = 0; i < inlineBoxes.length; i += 1) {
    const line = inlineBoxes[i].children[0];
    if (line == null) {
      continue;
    }
    items.push(...line.children);
  }
  return items;
}

function collectNodes(root: LayoutNode): LayoutNode[] {
  const nodes: LayoutNode[] = [root];
  const children = root.getChildren();
  for (let i = 0; i < children.length; i += 1) {
    nodes.push(...collectNodes(children[i]));
  }
  return nodes;
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

test('inline boxes default to transparent background', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.append('Hello, world!');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  expect(layout.root).not.toBeNull();

  const inlineBox = layout.root!.children.find(
    (child): child is InlineBoxLayoutNode => child instanceof InlineBoxLayoutNode,
  );
  expect(inlineBox).toBeTruthy();
  expect(inlineBox!.box.background.color).toEqual({
    type: 'identifier',
    value: 'transparent',
  });
});

test('ignores display none in tree and sizing', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '300px';

  const a = createBlock(document, 'div');
  a.style.height = '10px';
  const hidden = createBlock(document, 'div');
  hidden.style.display = 'none';
  hidden.style.height = '200px';
  const b = createBlock(document, 'div');
  b.style.height = '20px';

  root.append(a, hidden, b);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 800, height: 400 });
  expect(layout.root).not.toBeNull();

  const blockChildren = layout.root!.children.filter(
    (child): child is BlockLayoutNode => child instanceof BlockLayoutNode,
  );
  expect(blockChildren.length).toBe(2);
  expect(layout.root!.box.innerBox.height).toBe(30);
});

test('emits inline start/end markers for nested inline nodes', () => {
  const document = new Document();
  const root = createBlock(document, 'div');

  const strong = document.createElement('strong');
  strong.style.display = 'inline';
  const em = document.createElement('em');
  em.style.display = 'inline';

  em.append('A');
  strong.append(em, 'B');
  root.append(strong);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 400, height: 200 });
  expect(layout.root).not.toBeNull();

  const items = getInlineItems(layout.root!);
  const markerSequence = items
    .filter((item) => item.kind === 'inline-start' || item.kind === 'inline-end')
    .map((item) => `${item.kind}:${(item.domNode as any).tagName}`);

  expect(markerSequence).toEqual([
    'inline-start:STRONG',
    'inline-start:EM',
    'inline-end:EM',
    'inline-end:STRONG',
  ]);
});

test('reopens inline stack with synthetic markers after block split', () => {
  const document = new Document();
  const root = createBlock(document, 'div');

  const strong = document.createElement('strong');
  strong.style.display = 'inline';
  const nested = createBlock(document, 'div');
  nested.append('block');
  strong.append('a', nested, 'b');
  root.append(strong);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 300, height: 200 });
  expect(layout.root).not.toBeNull();

  const inlineBoxes = layout.root!.children.filter(
    (child): child is InlineBoxLayoutNode => child instanceof InlineBoxLayoutNode,
  );
  expect(inlineBoxes.length).toBe(2);
  const secondLine = inlineBoxes[1].children[0];
  expect(secondLine).toBeTruthy();
  if (secondLine == null) {
    return;
  }
  const firstItem = secondLine.children[0];
  expect(firstItem).toBeTruthy();
  if (firstItem == null) {
    return;
  }
  expect(firstItem.kind).toBe('inline-start');
  expect((firstItem as InlineStartMarkerLayoutNode).synthetic).toBe(true);
});

test('treats inline-block as atomic inline item', () => {
  const document = new Document();
  const root = createBlock(document, 'div');

  const ib = document.createElement('span');
  ib.style.display = 'inline-block';
  ib.style.width = '40px';
  ib.style.height = '10px';
  ib.append('x');

  root.append('a', ib, 'b');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 400, height: 200 });
  expect(layout.root).not.toBeNull();

  const items = getInlineItems(layout.root!);
  const inlineBlocks = items.filter(
    (item): item is InlineBlockLayoutNode => item instanceof InlineBlockLayoutNode,
  );
  expect(inlineBlocks.length).toBe(1);
  expect(inlineBlocks[0].box.outerBox.width).toBe(40);
  expect(inlineBlocks[0].block?.domNode).toBe(ib);
});

test('resolves percentage widths during layout', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.style.width = '200px';

  const child = createBlock(document, 'div');
  child.style.width = '50%';

  root.append(child);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 1024, height: 300 });
  expect(layout.root).not.toBeNull();

  const childBlock = layout.root!.children.find(
    (item): item is BlockLayoutNode => item instanceof BlockLayoutNode,
  );
  expect(childBlock).toBeTruthy();
  expect(childBlock!.box.outerBox.width).toBe(100);
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
  expect(layout.root).not.toBeNull();

  const childBlock = layout.root!.children.find(
    (item): item is BlockLayoutNode => item instanceof BlockLayoutNode,
  );
  expect(childBlock).toBeTruthy();
  expect(childBlock!.box.outerBox.width).toBe(300);
  expect(childBlock!.box.outerBox.height).toBe(20);
});

test('registers every tree node in nodesByDom mapping', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  const strong = document.createElement('strong');
  strong.style.display = 'inline';
  strong.append('Hello');
  root.append(strong, document.createElement('div'));

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 400, height: 200 });
  expect(layout.root).not.toBeNull();

  const all = collectNodes(layout.root!);
  for (let i = 0; i < all.length; i += 1) {
    const node = all[i];
    const mapped = layout.nodesByDom.get(node.domNode) ?? [];
    expect(mapped.includes(node)).toBe(true);
  }
});

test('inline-box node invariants in no-wrap v1', () => {
  const document = new Document();
  const root = createBlock(document, 'div');
  root.append('Hello, world!');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 400, height: 200 });
  expect(layout.root).not.toBeNull();

  const inlineBoxes = layout.root!.children.filter(
    (child): child is InlineBoxLayoutNode => child instanceof InlineBoxLayoutNode,
  );
  expect(inlineBoxes.length).toBeGreaterThan(0);
  for (let i = 0; i < inlineBoxes.length; i += 1) {
    expect(inlineBoxes[i].children.length).toBe(1);
    const line = inlineBoxes[i].children[0];
    expect(line).toBeTruthy();
    if (line != null) {
      expect(line.kind).toBe('line-box');
    }
  }
});
