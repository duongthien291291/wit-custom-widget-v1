import { WidgetConfig, WidgetInstance } from '../types';
import { JSX } from 'preact/jsx-runtime';

/**
 * Abstract Base Widget following Template Method Pattern
 * Defines the common structure for all widgets
 * Optimized with lazy rendering and memoization
 */
export abstract class BaseWidget {
  protected config: WidgetConfig;
  private _renderedComponent: JSX.Element | null = null;
  private _lastRenderConfig: WidgetConfig | null = null;

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
  protected abstract render(): JSX.Element;

  // Hook methods - can be overridden by subclasses
  protected getTitle(): string {
    return this.config.title;
  }

  protected getData(): Record<string, unknown> {
    return this.config.data || {};
  }

  protected updateConfig(updates: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...updates };
    // Clear cached render when config changes
    this._renderedComponent = null;
    this._lastRenderConfig = null;
  }

  // Optimized render method with caching
  protected getCachedRender(): JSX.Element {
    // Check if we need to re-render
    if (this._renderedComponent && this._lastRenderConfig && 
        this.hasConfigChanged(this._lastRenderConfig, this.config)) {
      this._renderedComponent = null;
      this._lastRenderConfig = null;
    }

    if (!this._renderedComponent) {
      this._renderedComponent = this.render();
      this._lastRenderConfig = { ...this.config };
    }

    return this._renderedComponent;
  }

  private hasConfigChanged(oldConfig: WidgetConfig, newConfig: WidgetConfig): boolean {
    return oldConfig.title !== newConfig.title ||
           oldConfig.x !== newConfig.x ||
           oldConfig.y !== newConfig.y ||
           oldConfig.w !== newConfig.w ||
           oldConfig.h !== newConfig.h ||
           JSON.stringify(oldConfig.data) !== JSON.stringify(newConfig.data);
  }
}
