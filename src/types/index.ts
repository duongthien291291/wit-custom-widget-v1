// Core types and interfaces following Interface Segregation Principle

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  data?: Record<string, any>;
}

export interface WidgetMetadata {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultSize: { w: number; h: number };
}

export interface WidgetInstance {
  id: string;
  type: string;
  config: WidgetConfig;
  component: () => any;
}

export interface StorageService {
  save(key: string, data: any): void;
  load<T>(key: string): T | null;
  remove(key: string): void;
}

export interface WidgetFactory {
  createWidget(type: string, config: Partial<WidgetConfig>): WidgetInstance;
  getAvailableWidgets(): WidgetMetadata[];
}

export interface DragDropService {
  initializeGrid(container: HTMLElement): void;
  addWidget(widget: WidgetInstance): void;
  addWidgetFromClick(type: string, title: string, icon: string, description: string, id?: string): void;
  removeWidget(id: string): void;
  clearAllWidgets(): void;
  getAllWidgets(): WidgetConfig[];
  onWidgetChange(callback: (widgets: WidgetConfig[]) => void): void;
  destroy(): void;
}

export interface WidgetRenderer {
  render(widget: WidgetInstance): any;
}

export type WidgetChangeCallback = (widgets: WidgetConfig[]) => void;
export type WidgetEventType = 'add' | 'remove' | 'update' | 'move' | 'resize';
