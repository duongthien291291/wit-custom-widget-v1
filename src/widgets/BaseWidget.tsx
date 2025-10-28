import { WidgetConfig, WidgetInstance } from '../types';

/**
 * Abstract Base Widget following Template Method Pattern
 * Defines the common structure for all widgets
 */
export abstract class BaseWidget {
  protected config: WidgetConfig;

  constructor(config: WidgetConfig) {
    this.config = { ...config };
  }

  // Template method - defines the algorithm structure
  public createInstance(): WidgetInstance {
    return {
      id: this.config.id,
      type: this.config.type,
      config: this.config,
      component: this.render.bind(this)
    };
  }

  // Abstract method - must be implemented by concrete widgets
  protected abstract render(): any;

  // Hook methods - can be overridden by subclasses
  protected getTitle(): string {
    return this.config.title;
  }

  protected getData(): Record<string, any> {
    return this.config.data || {};
  }

  protected updateConfig(updates: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
