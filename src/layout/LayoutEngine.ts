import { Element } from '../dom/Element';
import { Box } from './Box';
import { LayoutDocument } from './LayoutDocument';
import {
  CanvasTextMetrics,
  TextMetricsProvider,
} from './TextMetrics';
import { LayoutNodeFactory } from './nodes/LayoutNodeFactory';

export class LayoutEngine {
  private metrics: TextMetricsProvider;

  constructor(metrics: TextMetricsProvider = new CanvasTextMetrics()) {
    this.metrics = metrics;
  }

  layout(
    root: Element,
    viewport: { width: number; height: number },
  ): LayoutDocument {
    const viewportBox = new Box();
    viewportBox.left = 0;
    viewportBox.top = 0;
    viewportBox.width = viewport.width;
    viewportBox.height = viewport.height;

    const layoutDocument = new LayoutDocument(viewportBox);
    const factory = new LayoutNodeFactory(layoutDocument);
    const rootNode = factory.createBlock(root, null);
    rootNode.layout(viewportBox, viewportBox.top, this.metrics, factory);
    layoutDocument.root = rootNode;
    return layoutDocument;
  }
}
