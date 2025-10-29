import { WidgetConfig, WidgetInstance, WidgetMetadata, WidgetFactory } from '../types';
import { BaseWidget } from '../widgets/BaseWidget';
import { TextWidget } from '../widgets/TextWidget';
import { ChartWidget } from '../widgets/ChartWidget';
import { ImageWidget } from '../widgets/ImageWidget';

/**
 * Widget Factory following Factory Pattern and Open-Closed Principle
 * Easy to extend with new widget types without modifying existing code
 */
export class ConcreteWidgetFactory implements WidgetFactory {
  private widgetRegistry = new Map<string, new (config: WidgetConfig) => BaseWidget>();
  private widgetMetadata = new Map<string, WidgetMetadata>();

  constructor() {
    this.registerWidgets();
  }

  private registerWidgets(): void {
    // Register Text Widget
    this.widgetRegistry.set('text', TextWidget);
    this.widgetMetadata.set('text', {
      type: 'text',
      name: 'Text Widget',
      description: 'Display text content with customizable styling',
      icon: '📝',
      category: 'Content',
      defaultSize: { w: 3, h: 2 }
    });

    // Register Chart Widget
    this.widgetRegistry.set('chart', ChartWidget);
    this.widgetMetadata.set('chart', {
      type: 'chart',
      name: 'Chart Widget',
      description: 'Display data in various chart formats',
      icon: '📊',
      category: 'Data',
      defaultSize: { w: 4, h: 3 }
    });

    // Register Image Widget
    this.widgetRegistry.set('image', ImageWidget);
    this.widgetMetadata.set('image', {
      type: 'image',
      name: 'Image Widget',
      description: 'Display images with customizable fit modes',
      icon: '🖼️',
      category: 'Media',
      defaultSize: { w: 3, h: 2 }
    });
  }

  createWidget(type: string, config: Partial<WidgetConfig>): WidgetInstance {
    const WidgetClass = this.widgetRegistry.get(type);
    
    if (!WidgetClass) {
      throw new Error(`Widget type '${type}' is not registered`);
    }

    const defaultConfig: WidgetConfig = {
      id: this.generateId(),
      type,
      title: this.getDefaultTitle(type),
      x: 0,
      y: 0,
      w: this.getDefaultSize(type).w,
      h: this.getDefaultSize(type).h,
      data: {}
    };

    const finalConfig = { ...defaultConfig, ...config };
    const widget = new WidgetClass(finalConfig);
    
    return widget.createInstance();
  }

  getAvailableWidgets(): WidgetMetadata[] {
    return Array.from(this.widgetMetadata.values());
  }

  getWidgetMetadata(type: string): WidgetMetadata | undefined {
    return this.widgetMetadata.get(type);
  }

  // Extension point - new widgets can be registered dynamically
  registerWidget(
    type: string, 
    widgetClass: new (config: WidgetConfig) => BaseWidget, 
    metadata: WidgetMetadata
  ): void {
    this.widgetRegistry.set(type, widgetClass);
    this.widgetMetadata.set(type, metadata);
  }

  private generateId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultTitle(type: string): string {
    const metadata = this.widgetMetadata.get(type);
    return metadata?.name || 'New Widget';
  }

  private getDefaultSize(type: string): { w: number; h: number } {
    const metadata = this.widgetMetadata.get(type);
    return metadata?.defaultSize || { w: 2, h: 2 };
  }
}
