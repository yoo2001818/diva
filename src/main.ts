import { Document } from './dom/Document';
import { CanvasRenderer } from './render/CanvasRenderer';

const doc = new Document();
const canvasEl = document.createElement('canvas');
canvasEl.width = 1024;
canvasEl.height = 768;
document.body.appendChild(canvasEl);
const renderer = new CanvasRenderer(doc, canvasEl);
renderer.layout();
renderer.render();
