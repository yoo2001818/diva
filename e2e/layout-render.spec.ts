import { expect, test } from '@playwright/test';

test('renders engine canvas and browser comparison content', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const canvas = page.locator('#engine-canvas');
  const compare = page.locator('#browser-compare');
  const demoRoot = compare.locator('.demo-root');

  await expect(canvas).toBeVisible();
  await expect(compare).toBeVisible();
  await expect(demoRoot).toBeVisible();

  const pageShot = await page.screenshot({ fullPage: true });
  await testInfo.attach('layout-page', {
    body: pageShot,
    contentType: 'image/png',
  });
});

test('canvas output is not blank', async ({ page }, testInfo) => {
  await page.goto('/');

  const canvas = page.locator('#engine-canvas');
  await expect(canvas).toBeVisible();

  const stats = await page.evaluate(() => {
    const target = document.querySelector('#engine-canvas');
    if (!(target instanceof HTMLCanvasElement)) {
      return null;
    }
    const context = target.getContext('2d');
    if (context == null) {
      return null;
    }

    const { width, height } = target;
    const image = context.getImageData(0, 0, width, height);
    const step = 8;
    let sampled = 0;
    let nonTransparent = 0;
    let nonWhite = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        sampled += 1;
        const index = (y * width + x) * 4;
        const r = image.data[index];
        const g = image.data[index + 1];
        const b = image.data[index + 2];
        const a = image.data[index + 3];

        if (a > 0) {
          nonTransparent += 1;
          if (r < 245 || g < 245 || b < 245) {
            nonWhite += 1;
          }
        }
      }
    }

    return {
      sampled,
      nonTransparent,
      nonWhite,
    };
  });

  expect(stats).not.toBeNull();
  expect(stats!.nonTransparent).toBeGreaterThan(400);
  expect(stats!.nonWhite).toBeGreaterThan(200);

  const canvasShot = await canvas.screenshot();
  await testInfo.attach('engine-canvas', {
    body: canvasShot,
    contentType: 'image/png',
  });
});

test('inline-block chip vertical placement tracks browser reference', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const renderer = (window as any).__divaRenderer;
    if (renderer?.layoutDocument?.root == null) {
      return null;
    }

    const engineTops: number[] = [];
    const visit = (node: any) => {
      if (node == null) {
        return;
      }
      if (node.kind === 'inline-block') {
        const domNode = node.domNode;
        const className =
          domNode?.getAttribute?.('class') ??
          domNode?.className ??
          '';
        if (typeof className === 'string' && className.includes('inline-chip')) {
          const y = node.box.outerBox.top - node.box.margin.top;
          engineTops.push(y);
        }
      }
      const children = node.children ?? node.getChildren?.() ?? [];
      for (let i = 0; i < children.length; i += 1) {
        visit(children[i]);
      }
    };
    visit(renderer.layoutDocument.root);

    const compareContainer = document.querySelector('#browser-compare');
    if (compareContainer == null) {
      return null;
    }
    const baseRect = compareContainer.getBoundingClientRect();
    const browserTops = Array.from(
      document.querySelectorAll('#browser-compare .inline-chip'),
    ).map((el) => el.getBoundingClientRect().top - baseRect.top);

    if (engineTops.length === 0 || browserTops.length === 0) {
      return null;
    }
    const normalize = (values: number[]) => {
      const first = values[0];
      return values.map((v) => v - first);
    };

    return {
      engineTops,
      browserTops,
      normalizedEngine: normalize(engineTops),
      normalizedBrowser: normalize(browserTops),
    };
  });

  expect(result).not.toBeNull();
  expect(result!.engineTops.length).toBe(result!.browserTops.length);
  for (let i = 0; i < result!.normalizedEngine.length; i += 1) {
    const diff = Math.abs(
      result!.normalizedEngine[i] - result!.normalizedBrowser[i],
    );
    expect(diff).toBeLessThan(4);
  }
});

test('inline-block text remains inside chip border box on canvas layout tree', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const renderer = (window as any).__divaRenderer;
    if (renderer?.layoutDocument?.root == null) {
      return null;
    }

    const violations: Array<{ chipTop: number; chipBottom: number; textTop: number; textBottom: number }> = [];

    const collectTextRuns = (node: any, out: any[]) => {
      if (node == null) {
        return;
      }
      if (node.kind === 'text-run') {
        out.push(node);
      }
      const children = node.children ?? node.getChildren?.() ?? [];
      for (let i = 0; i < children.length; i += 1) {
        collectTextRuns(children[i], out);
      }
    };

    const visit = (node: any) => {
      if (node == null) {
        return;
      }
      if (node.kind === 'inline-block') {
        const domNode = node.domNode;
        const className =
          domNode?.getAttribute?.('class') ??
          domNode?.className ??
          '';
        if (typeof className === 'string' && className.includes('inline-chip')) {
          const chipTop = node.box.outerBox.top;
          const chipBottom = node.box.outerBox.top + node.box.outerBox.height;
          const runs: any[] = [];
          const block = node.block ?? (node.children?.[0] ?? null);
          collectTextRuns(block, runs);
          for (let i = 0; i < runs.length; i += 1) {
            const textTop = runs[i].box.outerBox.top;
            const textBottom = runs[i].box.outerBox.top + runs[i].box.outerBox.height;
            if (textTop < chipTop - 0.5 || textBottom > chipBottom + 0.5) {
              violations.push({ chipTop, chipBottom, textTop, textBottom });
            }
          }
        }
      }
      const children = node.children ?? node.getChildren?.() ?? [];
      for (let i = 0; i < children.length; i += 1) {
        visit(children[i]);
      }
    };
    visit(renderer.layoutDocument.root);
    return { violations };
  });

  expect(result).not.toBeNull();
  expect(result!.violations).toEqual([]);
});

test('block direct text does not produce inline-decoration border strokes', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const renderer = (window as any).__divaRenderer;
    if (renderer?.layoutDocument?.root == null) {
      return null;
    }

    let blockNode: any = null;
    const visit = (node: any) => {
      if (node == null || blockNode != null) {
        return;
      }
      if (node.kind === 'block') {
        const className =
          node.domNode?.getAttribute?.('class') ??
          node.domNode?.className ??
          '';
        if (
          typeof className === 'string' &&
          className.includes('block-direct-text-case')
        ) {
          blockNode = node;
          return;
        }
      }
      const children = node.children ?? node.getChildren?.() ?? [];
      for (let i = 0; i < children.length; i += 1) {
        visit(children[i]);
      }
    };
    visit(renderer.layoutDocument.root);
    if (blockNode == null) {
      return null;
    }

    const ctx = renderer.ctx as CanvasRenderingContext2D;
    const originalFillRect = ctx.fillRect.bind(ctx);
    const operations: Array<{
      fillStyle: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];
    ctx.fillRect = (x: number, y: number, width: number, height: number) => {
      operations.push({
        fillStyle: String(ctx.fillStyle),
        x,
        y,
        width,
        height,
      });
      originalFillRect(x, y, width, height);
    };

    renderer.render();
    ctx.fillRect = originalFillRect;

    const left = blockNode.box.outerBox.left;
    const top = blockNode.box.outerBox.top;
    const width = blockNode.box.outerBox.width;
    const height = blockNode.box.outerBox.height;
    const right = left + width;
    const bottom = top + height;
    const borderWidth = 2;

    const interiorHorizontalThinLines = operations.filter((op) => {
      const insideHoriz = op.x >= left && op.x + op.width <= right;
      const insideVert = op.y > top + borderWidth && op.y < bottom - borderWidth;
      const thinHorizontal = op.height <= borderWidth && op.width > 10;
      return insideHoriz && insideVert && thinHorizontal;
    });

    return {
      operationCount: operations.length,
      interiorHorizontalThinLines,
    };
  });

  expect(result).not.toBeNull();
  expect(result!.interiorHorizontalThinLines).toEqual([]);
});

test('inline formatting section keeps marker heights compact relative to text runs', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const renderer = (window as any).__divaRenderer;
    if (renderer?.layoutDocument?.root == null) {
      return null;
    }

    let inlineRichBlock: any = null;
    const visit = (node: any) => {
      if (node == null || inlineRichBlock != null) {
        return;
      }
      if (node.kind === 'block') {
        const className =
          node.domNode?.getAttribute?.('class') ??
          node.domNode?.className ??
          '';
        if (typeof className === 'string' && className.includes('inline-rich')) {
          inlineRichBlock = node;
          return;
        }
      }
      const children = node.children ?? node.getChildren?.() ?? [];
      for (let i = 0; i < children.length; i += 1) {
        visit(children[i]);
      }
    };
    visit(renderer.layoutDocument.root);
    if (inlineRichBlock == null) {
      return null;
    }

    const inlineBox = (inlineRichBlock.children ?? []).find(
      (child: any) => child.kind === 'inline-box',
    );
    if (inlineBox == null) {
      return null;
    }

    const markerVsTextMismatches: Array<{
      textHeight: number;
      markerHeight: number;
      kind: string;
    }> = [];
    const lines = inlineBox.children ?? [];
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const lineHeight = line.box.outerBox.height;
      const children = line.children ?? [];
      const textHeights = children
        .filter((child: any) => child.kind === 'text-run')
        .map((child: any) => child.box.outerBox.height);
      const referenceTextHeight =
        textHeights.length > 0
          ? Math.max(...textHeights)
          : lineHeight;
      for (let j = 0; j < children.length; j += 1) {
        const child = children[j];
        if (child.kind !== 'inline-start' && child.kind !== 'inline-end') {
          continue;
        }
        const markerHeight = child.box.outerBox.height;
        if (Math.abs(markerHeight - referenceTextHeight) > 8) {
          markerVsTextMismatches.push({
            textHeight: referenceTextHeight,
            markerHeight,
            kind: child.kind,
          });
        }
      }
    }

    const browserInline = document.querySelector('#browser-compare .inline-rich');
    if (browserInline == null) {
      return null;
    }
    const browserHeight = browserInline.getBoundingClientRect().height;
    const engineHeight = inlineRichBlock.box.outerBox.height;

    return {
      browserHeight,
      engineHeight,
      heightDiff: Math.abs(browserHeight - engineHeight),
      markerVsTextMismatches,
    };
  });

  expect(result).not.toBeNull();
  expect(result!.markerVsTextMismatches).toEqual([]);
  expect(result!.heightDiff).toBeLessThan(10);
});
