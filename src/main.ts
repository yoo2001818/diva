import { Document } from './dom/Document';
import { CanvasRenderer } from './render/CanvasRenderer';

const doc = new Document();
const canvasEl = document.createElement('canvas');
canvasEl.width = 1024;
canvasEl.height = 768;
document.body.appendChild(canvasEl);
const renderer = new CanvasRenderer(doc, canvasEl);

const container = doc.createElement('div');
container.className = 'container';
container.style.margin = '10px';
container.style.padding = '10px';
container.style.border = '10px solid #ff0000';
container.style.background = '#00ff00';

const child = doc.createElement('div');
child.className = 'child';
child.style.height = '20px';
child.style.background = '#ffff00';

container.append(child);
doc.documentElement!.append(container);

renderer.layout();
renderer.render();
