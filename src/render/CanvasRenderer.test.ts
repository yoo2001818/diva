import { expect, test } from 'vitest';
import { Document } from '../dom/Document';
import { LayoutNode } from '../layout/nodes/LayoutNode';
import { TextRunLayoutNode } from '../layout/nodes/TextRunLayoutNode';
import { CanvasRenderer } from './CanvasRenderer';

interface FillRectOperation {
  fillStyle: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function createCanvasSpy(
  width: number,
  height: number,
): { canvas: HTMLCanvasElement; operations: FillRectOperation[] } {
  const operations: FillRectOperation[] = [];
  const context = {
    fillStyle: '#000000',
    font: '',
    textBaseline: 'alphabetic',
    clearRect(_x: number, _y: number, _w: number, _h: number): void {
      // noop
    },
    fillRect(this: { fillStyle: string }, x: number, y: number, w: number, h: number): void {
      operations.push({
        fillStyle: this.fillStyle,
        x,
        y,
        width: w,
        height: h,
      });
    },
    fillText(_text: string, _x: number, _y: number): void {
      // noop
    },
  };

  const canvas = {
    width,
    height,
    getContext: () => context,
  } as unknown as HTMLCanvasElement;
  return { canvas, operations };
}

function findFirstTextRun(node: LayoutNode | null): TextRunLayoutNode | null {
  if (node == null) {
    return null;
  }
  if (node instanceof TextRunLayoutNode) {
    return node;
  }
  const children = node.getChildren();
  for (let i = 0; i < children.length; i += 1) {
    const found = findFirstTextRun(children[i]);
    if (found != null) {
      return found;
    }
  }
  return null;
}

test('renders inline text-run and marker background/border decoration', () => {
  const documentNode = new Document();
  const root = documentNode.createElement('div');
  root.style.width = '320px';

  const span = documentNode.createElement('span');
  span.style.display = 'inline';
  span.style.backgroundColor = '#ff0000';
  span.style.border = '1px solid #000000';
  span.style.padding = '0 4px';
  span.append('X');
  root.append(span);
  documentNode.documentElement!.append(root);

  const { canvas, operations } = createCanvasSpy(400, 200);
  const renderer = new CanvasRenderer(documentNode, canvas);
  renderer.layout();
  renderer.render();

  const hasRedBackground = operations.some((op) => op.fillStyle === '#ff0000');
  const hasBlackBorder = operations.some(
    (op) => op.fillStyle === '#000' || op.fillStyle === '#000000' || op.fillStyle === 'black',
  );

  expect(hasRedBackground).toBe(true);
  expect(hasBlackBorder).toBe(true);
});

test('does not paint inline decoration from block styles for direct block text', () => {
  const documentNode = new Document();
  const root = documentNode.createElement('div');
  root.style.width = '320px';

  const block = documentNode.createElement('div');
  block.style.display = 'block';
  block.style.width = '200px';
  block.style.border = '2px solid #12ab34';
  block.style.backgroundColor = '#ff00ff';
  block.append('plain text in block');
  root.append(block);
  documentNode.documentElement!.append(root);

  const { canvas, operations } = createCanvasSpy(400, 220);
  const renderer = new CanvasRenderer(documentNode, canvas);
  renderer.layout();
  renderer.render();

  const borderOps = operations.filter((op) => op.fillStyle === '#12ab34');
  const backgroundOps = operations.filter((op) => op.fillStyle === '#ff00ff');

  expect(borderOps.length).toBe(4);
  expect(backgroundOps.length).toBe(1);
});

test('text runs inside nested inline stack include ancestor inline decorations', () => {
  const documentNode = new Document();
  const root = documentNode.createElement('div');
  root.style.width = '320px';

  const strong = documentNode.createElement('strong');
  strong.style.display = 'inline';
  strong.style.backgroundColor = '#00ff00';
  strong.style.borderTop = '1px solid #006600';
  strong.style.borderBottom = '1px solid #006600';

  const em = documentNode.createElement('em');
  em.style.display = 'inline';
  em.append('inner');
  strong.append('prefix ', em, ' suffix');
  root.append(strong);
  documentNode.documentElement!.append(root);

  const { canvas, operations } = createCanvasSpy(480, 220);
  const renderer = new CanvasRenderer(documentNode, canvas);
  renderer.layout();
  renderer.render();

  const hasStrongBackground = operations.some((op) => op.fillStyle === '#00ff00');
  const hasStrongBorderColor = operations.some((op) => op.fillStyle === '#006600');
  expect(hasStrongBackground).toBe(true);
  expect(hasStrongBorderColor).toBe(true);
});

test('inline top/bottom borders paint outside text content box', () => {
  const documentNode = new Document();
  const root = documentNode.createElement('div');
  root.style.width = '320px';

  const span = documentNode.createElement('span');
  span.style.display = 'inline';
  span.style.borderTop = '2px solid #123456';
  span.style.borderBottom = '3px solid #123456';
  span.style.backgroundColor = '#abcdef';
  span.append('X');
  root.append(span);
  documentNode.documentElement!.append(root);

  const { canvas, operations } = createCanvasSpy(400, 220);
  const renderer = new CanvasRenderer(documentNode, canvas);
  renderer.layout();
  const run = findFirstTextRun(renderer.layoutDocument?.root ?? null);
  expect(run).not.toBeNull();

  renderer.render();

  const borderOps = operations.filter((op) => op.fillStyle === '#123456');
  const hasTopOutside = borderOps.some(
    (op) =>
      Math.abs(op.y - (run!.box.outerBox.top - 2)) < 0.01 &&
      Math.abs(op.height - 2) < 0.01,
  );
  const hasBottomOutside = borderOps.some(
    (op) =>
      Math.abs(op.y - (run!.box.outerBox.top + run!.box.outerBox.height)) <
        0.01 &&
      Math.abs(op.height - 3) < 0.01,
  );

  expect(hasTopOutside).toBe(true);
  expect(hasBottomOutside).toBe(true);
});
