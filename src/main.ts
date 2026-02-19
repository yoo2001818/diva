import { Document } from './dom/Document';
import { CanvasRenderer } from './render/CanvasRenderer';

const doc = new Document();

doc.documentElement!.innerHTML = `
<style>
.demo-root {
  margin: 12px;
  padding: 12px;
  border: 2px solid #333333;
  background: #f8fafc;
  font-size: 16px;
  line-height: 1.2;
  color: #111111;
}
.panel {
  margin: 8px 0;
  padding: 8px;
  border: 1px solid #888888;
  background: #ffffff;
}
.float-left {
  float: left;
  width: 70px;
  height: 40px;
  margin: 0 10px 8px 0;
  border: 1px solid #333333;
  background: #ffd166;
}
.float-right {
  float: right;
  width: 90px;
  height: 25px;
  margin: 0 0 8px 10px;
  border: 1px solid #333333;
  background: #8ecae6;
}
.copy {
  color: #1f2937;
}
.clear-both {
  clear: both;
  margin-top: 6px;
  padding: 4px;
  border: 1px dashed #333333;
  background: #d9f99d;
}
.nowrap-row {
  white-space: nowrap;
  background: #fee2e2;
}
.pre-block {
  white-space: pre;
  background: #e0e7ff;
}
.inline-panel {
  background: #eef2ff;
}
.inline-rich {
  color: #111827;
}
.inline-rich strong {
  color: #1d4ed8;
}
.inline-rich em {
  color: #be123c;
}
.inline-rich code {
  background: #e5e7eb;
  border: 1px solid #d1d5db;
  padding: 0 2px;
}
.inline-highlight {
  background: #fde68a;
}
.inline-outline {
  border: 1px solid #d97706;
  padding: 0 4px;
  background: #fef3c7;
}
.block-direct-text-case {
  margin-top: 8px;
  border: 2px solid #12ab34;
  background: #eaffef;
  color: #1f2937;
  padding: 4px;
}
.inline-block-panel {
  background: #f5f3ff;
}
.inline-block-flow {
  color: #374151;
}
.inline-chip {
  display: inline-block;
  width: 110px;
  margin: 0 8px 8px 0;
  padding: 4px;
  border: 1px solid #6b7280;
  background: #ddd6fe;
}
.inline-chip.wide {
  width: 150px;
  background: #c4b5fd;
}
.inline-chip.tall {
  height: 42px;
  background: #a78bfa;
}
.va-panel {
  background: #ecfeff;
}
.va-row {
  margin: 6px 0;
  padding: 6px;
  border: 1px solid #99f6e4;
  background: #ffffff;
}
.va-chip {
  display: inline-block;
  width: 56px;
  height: 20px;
  margin: 0 6px 0 0;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  text-align: center;
}
.va-top { vertical-align: top; }
.va-bottom { vertical-align: bottom; }
.va-middle { vertical-align: middle; }
.va-text-top { vertical-align: text-top; }
.va-text-bottom { vertical-align: text-bottom; }
.va-sub { vertical-align: sub; }
.va-super { vertical-align: super; }
.va-len { vertical-align: 6px; }
.va-pct { vertical-align: 50%; }
.va-inline-block {
  display: inline-block;
  width: 140px;
  border: 1px solid #0f766e;
  padding: 4px;
  background: #a7f3d0;
}
.collapse-panel {
  background: #fef9c3;
}
.collapse-title {
  font-weight: 700;
  margin-bottom: 6px;
}
.collapse-case {
  margin: 8px 0;
  padding: 6px;
  border: 1px dashed #444444;
  background: #ffffff;
}
.collapse-parent-top {
  margin-top: 8px;
  background: #dcfce7;
}
.collapse-first-child {
  margin-top: 24px;
  background: #bbf7d0;
}
.collapse-parent-bottom {
  margin-bottom: 8px;
  background: #ffedd5;
}
.collapse-last-child {
  margin-bottom: 24px;
  background: #fed7aa;
}
.collapse-sibling {
  margin-top: 12px;
  background: #fee2e2;
}
.inline-rich strong {
  background-color: #ffff00;
  border: 3px solid #000;
}
</style>
<div class="demo-root">
  <div class="panel">
    <div class="float-left">LEFT</div>
    <div class="float-right">RIGHT</div>
    <div class="copy">This paragraph demonstrates line wrapping around a left float. The text should start to the right of the yellow box and then expand back to full width when the float ends.</div>
    <div class="copy">This paragraph demonstrates wrapping around a right float. The text should avoid the blue box on the right while the float is active.</div>
    <div class="clear-both">This block has clear: both, so it starts below both floats.</div>
  </div>

  <div class="panel nowrap-row">nowrap example: this line should remain in a single line even if the panel is not wide enough to fit all text naturally which should happen with some additional words.</div>

  <div class="panel pre-block">pre example:
  indentation is preserved
multiple    spaces stay intact
line breaks are explicit</div>

  <div class="panel inline-panel">
    <div class="collapse-title">Inline formatting examples</div>
    <div class="inline-rich">
      Plain text,
      <strong>nested <em>inline emphasis</em> inside bold</strong>,
      and inline <code>code</code> should share one IFC with markers.
      <strong>It should handle<br />line wraps correctly.</strong>
      <strong><strong>nested span</strong></strong>
      <span class="inline-highlight">background-only span</span>
      and
      <span class="inline-outline">border+padding span</span>
      <div class="block-direct-text-case">Block direct text should not get inline decoration borders.</div>
    </div>
  </div>

  <div class="panel inline-block-panel">
    <div class="collapse-title">Inline-block examples</div>
    <div class="inline-block-flow">
      Text before chips
      <span class="inline-chip">chip A</span>
      <span class="inline-chip wide">chip B wide</span>
      <span class="inline-chip tall">chip C tall</span>
      and trailing text to confirm wrapping/atomic placement.
    </div>
  </div>

  <div class="panel va-panel">
    <div class="collapse-title">Vertical-align examples</div>
    <div class="va-row">
      baseline
      <span class="va-chip">base</span>
      <span class="va-chip va-top">top</span>
      <span class="va-chip va-bottom">bottom</span>
      <span class="va-chip va-middle">middle</span>
      marker text
    </div>
    <div class="va-row">
      text metrics
      <span class="va-chip va-text-top">text-top</span>
      <span class="va-chip va-text-bottom">text-bottom</span>
      <sub>sub</sub>
      <sup>super</sup>
      <span class="va-chip va-sub">sub box</span>
      <span class="va-chip va-super">super box</span>
    </div>
    <div class="va-row">
      offsets
      <span class="va-chip">base</span>
      <span class="va-chip va-len">6px</span>
      <span class="va-chip va-pct">50%</span>
    </div>
    <div class="va-row">
      inline-block baseline source
      <span class="va-inline-block">inner text baseline line</span>
      trailing text
    </div>
  </div>

  <div class="panel collapse-panel">
    <div class="collapse-title">Margin collapse examples</div>
    <div class="collapse-case">
      <div class="collapse-parent-top">
        <div class="collapse-first-child">Parent and first child top margins collapse.</div>
      </div>
    </div>
    <div class="collapse-case">
      <div class="collapse-parent-bottom">
        <div class="collapse-last-child">Parent and last child bottom margins collapse.</div>
      </div>
      <div class="collapse-sibling">Following sibling after collapsed bottom margin.</div>
    </div>
  </div>
</div>
`;

const canvasEl = document.createElement('canvas');
canvasEl.id = 'engine-canvas';
canvasEl.width = 1024;
canvasEl.height = 1280;
canvasEl.style.float = 'left';
document.body.appendChild(canvasEl);

const renderer = new CanvasRenderer(doc, canvasEl);
renderer.layout();
renderer.render();

(window as any).__divaDoc = doc;
(window as any).__divaRenderer = renderer;

const compareContainer = document.createElement('div');
compareContainer.id = 'browser-compare';
compareContainer.style.width = '1024px';
compareContainer.style.float = 'left';
compareContainer.innerHTML = doc.documentElement!.innerHTML;
document.body.appendChild(compareContainer);
