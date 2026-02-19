import { expect, test } from 'vitest';
import { Document } from '../dom/Document';
import { LayoutEngine } from '../layout/LayoutEngine';
import { BlockLayoutNode } from '../layout/nodes/BlockLayoutNode';
import { InlineBoxLayoutNode } from '../layout/nodes/InlineBoxLayoutNode';
import { TextRunLayoutNode } from '../layout/nodes/TextRunLayoutNode';
import { resolveTextPaintInstruction } from './text';

function findFirstTextRun(root: BlockLayoutNode | null): TextRunLayoutNode | null {
  if (root == null) {
    return null;
  }
  for (let i = 0; i < root.children.length; i += 1) {
    const child = root.children[i];
    if (child instanceof InlineBoxLayoutNode) {
      const line = child.children[0];
      if (line == null) {
        continue;
      }
      for (let j = 0; j < line.children.length; j += 1) {
        const item = line.children[j];
        if (item.kind === 'text-run') {
          return item as TextRunLayoutNode;
        }
      }
    }
    if (child instanceof BlockLayoutNode) {
      const found = findFirstTextRun(child);
      if (found != null) {
        return found;
      }
    }
  }
  return null;
}

function findAllTextRuns(root: BlockLayoutNode | null): TextRunLayoutNode[] {
  if (root == null) {
    return [];
  }
  const output: TextRunLayoutNode[] = [];
  for (let i = 0; i < root.children.length; i += 1) {
    const child = root.children[i];
    if (child instanceof InlineBoxLayoutNode) {
      for (let l = 0; l < child.children.length; l += 1) {
        const line = child.children[l];
        for (let j = 0; j < line.children.length; j += 1) {
          const item = line.children[j];
          if (item instanceof TextRunLayoutNode) {
            output.push(item);
          }
        }
      }
    }
    if (child instanceof BlockLayoutNode) {
      output.push(...findAllTextRuns(child));
    }
  }
  return output;
}

test('resolves paint instruction from parent element text style', () => {
  const document = new Document();
  const root = document.createElement('div');
  root.style.width = '300px';
  root.style.fontSize = '20px';
  root.style.color = '#ff0000';
  root.append('Hello');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  const run = findFirstTextRun(layout.root);
  expect(run).not.toBeNull();

  const instruction = resolveTextPaintInstruction(run!);
  expect(instruction.text).toBe('Hello');
  expect(instruction.fillStyle).toBe('#ff0000');
  expect(instruction.font).toContain('20px');
  expect(instruction.font).toContain('serif');
});

test('prefers deepest inline style source for text paint', () => {
  const document = new Document();
  const root = document.createElement('div');
  root.style.width = '300px';
  root.style.color = '#ff0000';

  const strong = document.createElement('strong');
  strong.style.display = 'inline';
  strong.style.color = '#0000ff';
  strong.style.fontWeight = 'bold';
  strong.append('World');
  root.append(strong);

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  const run = findFirstTextRun(layout.root);
  expect(run).not.toBeNull();

  const instruction = resolveTextPaintInstruction(run!);
  expect(instruction.fillStyle).toBe('#0000ff');
  expect(instruction.font).toContain('bold');
});

test('keeps inherited text style on wrapped runs', () => {
  const document = new Document();
  const root = document.createElement('div');
  root.style.width = '100px';
  root.style.color = '#228833';
  root.style.fontSize = '18px';
  root.append('wrapping text wrapping text wrapping text');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 200, height: 200 });
  const runs = findAllTextRuns(layout.root);
  expect(runs.length).toBeGreaterThan(1);

  for (let i = 0; i < runs.length; i += 1) {
    const instruction = resolveTextPaintInstruction(runs[i]);
    expect(instruction.fillStyle).toBe('#228833');
    expect(instruction.font).toContain('18px');
  }
});

test('uses measured ascent/descent for text paint y when available', () => {
  const document = new Document();
  const root = document.createElement('div');
  root.style.width = '300px';
  root.style.fontSize = '20px';
  root.append('Hello');

  const engine = new LayoutEngine();
  const layout = engine.layout(root, { width: 500, height: 200 });
  const run = findFirstTextRun(layout.root);
  expect(run).not.toBeNull();

  run!.box.outerBox.top = 10;
  run!.box.outerBox.height = 30;
  run!.ascent = 12;
  run!.descent = 6;

  const instruction = resolveTextPaintInstruction(run!);
  expect(instruction.y).toBe(16);
});
