import { GridStack, GridStackOptions, GridStackWidget, GridStackNode } from 'gridstack';
import { WidgetConfig, DragDropService, WidgetInstance } from '../types';

/**
 * GridStack Drag and Drop Service
 * 
 * Handles all drag-and-drop operations using GridStack v10+
 * - External drag-in from widget palette
 * - Internal grid rearrangement
 * - Widget state change notifications
 * 
 * Follows Single Responsibility Principle
 */
export class GridStackDragDropService implements DragDropService {
  private grid: GridStack | null = null;
  private changeCallbacks: ((widgets: WidgetConfig[]) => void)[] = [];

  initializeGrid(container: HTMLElement): void {
    if (this.grid) {
      this.destroy();
    }

    const options: GridStackOptions = {
      cellHeight: 70,
      margin: 10,
      removable: true,
      acceptWidgets: true,
      float: true,
      animate: true,
      staticGrid: false
    };

    this.grid = GridStack.init(options, container);

    // Set up external drag-in functionality using GridStack v10+ method
    // Optimized for better responsiveness
    GridStack.setupDragIn('.widget-item', {
        helper: 'clone',
      scroll: true
    });

    // Ensure the grid is visible
    if (this.grid && this.grid.el) {
      this.grid.el.style.display = 'block';
      this.grid.el.style.visibility = 'visible';
      this.grid.el.style.opacity = '1';
    }

    // GridStack.setupDragIn automatically handles widget creation from dragged elements
    // No need for custom 'added' event handler - it would create duplicates

    // GridStack handles drag events automatically

    // Handle widget changes (position, size, etc.)
    this.grid.on('change', (_event, items) => {
      const widgets = this.mapItemsToWidgets(items);
      this.changeCallbacks.forEach(callback => callback(widgets));
    });

    // Handle widget additions (for tracking new widgets)
    this.grid.on('added', (_event, items) => {
      // GridStack.setupDragIn handles widget creation automatically
      // Ensure newly added widgets have the widget-item class
      if (items && items.length > 0) {
        items.forEach(item => {
          if (item.el && !item.el.classList.contains('widget-item')) {
            item.el.classList.add('widget-item');
          }
        });
        
        const widgets = this.mapItemsToWidgets(items);
        this.changeCallbacks.forEach(callback => callback(widgets));
      }
    });
  }

  /**
   * Add widget by cloning from sidebar item
   * This ensures perfect consistency between all widget creation methods
   */
  addWidget(widget: WidgetInstance): void {
    this.addWidgetFromSidebar(widget.type, widget.id, {
      w: widget.config.w,
      h: widget.config.h,
      x: widget.config.x,
      y: widget.config.y,
      title: widget.config.title,
      data: widget.config.data
    });
  }

  /**
   * Add widget from click by cloning the sidebar item directly
   * This ensures perfect consistency with dragged widgets
   */
  addWidgetFromClick(type: string, _title: string, _icon: string, _description: string, id?: string): void {
    this.addWidgetFromSidebar(type, id);
  }

  /**
   * Core method that clones sidebar items for all widget creation
   * This ensures perfect consistency across all methods
   */
  private addWidgetFromSidebar(type: string, id?: string, options?: {
    w?: number;
    h?: number;
    x?: number;
    y?: number;
    title?: string;
    data?: Record<string, unknown>;
  }): void {
    if (!this.grid) return;

    // Find the sidebar item to clone
    const sidebarItem = document.querySelector(`[data-widget-type="${type}"]`) as HTMLElement;
    if (!sidebarItem) {
      throw new Error(`Sidebar item not found for type: ${type}`);
    }

    // Clone the sidebar item
    const element = sidebarItem.cloneNode(true) as HTMLElement;
    
    // Remove any event listeners and reset classes
    // Preserve both widget-item and grid-stack-item classes for proper styling
    element.className = 'grid-stack-item widget-item';
    element.removeAttribute('draggable');
    element.removeAttribute('onclick');
    element.removeAttribute('onmousedown');
    element.removeAttribute('onmouseup');
    element.removeAttribute('onmouseleave');
    
    // Set the widget ID for state management
    if (id) {
      element.setAttribute('gs-id', id);
    }
    
    // Update data attributes if provided
    if (options?.title) {
      element.setAttribute('data-widget-title', options.title);
    }
    if (options?.data) {
      element.setAttribute('data-widget-data', JSON.stringify(options.data));
    }

    // Set GridStack positioning options
    const widgetOptions: GridStackWidget = Object.fromEntries(
      Object.entries({
        w: options?.w,
        h: options?.h,
        x: options?.x,
        y: options?.y
      }).filter(([, value]) => value !== undefined)
    );
    
    this.grid.addWidget(element, Object.keys(widgetOptions).length > 0 ? widgetOptions : undefined);
  }

  removeWidget(id: string): void {
    if (!this.grid) return;
    
    const element = this.grid.el.querySelector(`[gs-id="${id}"]`) as HTMLElement;
    if (element) {
      this.grid.removeWidget(element);
    }
  }

  /**
   * Clear all widgets from the grid
   * This method removes all widgets at once more efficiently
   */
  clearAllWidgets(): void {
    if (!this.grid) return;
    
    // Get all widget elements and remove them
    // We iterate in reverse to avoid index issues
    const allNodes = Array.from(this.grid.el.querySelectorAll('.grid-stack-item'));
    
    allNodes.forEach(node => {
      this.grid!.removeWidget(node as HTMLElement);
    });
  }

  /**
   * Get all current widgets from the grid
   * This ensures we always have the complete picture of what's in the grid
   */
  getAllWidgets(): WidgetConfig[] {
    if (!this.grid) return [];
    
    // Get all grid stack items from the grid
    const items = this.grid.engine.nodes;
    
    // Map them to widget configs
    return this.mapItemsToWidgets(items);
  }

  onWidgetChange(callback: (widgets: WidgetConfig[]) => void): void {
    this.changeCallbacks.push(callback);
  }

  /**
   * Maps GridStack items to WidgetConfig objects
   * Optimized with caching and error handling
   */
  private mapItemsToWidgets(items: GridStackNode[]): WidgetConfig[] {
    return items.map(item => {
      const el = item.el;
      if (!el) {
        console.warn('GridStack item missing element:', item);
        return this.createDefaultConfig(item);
      }

      const dataAttr = el.getAttribute('data-widget-data');
      let data = {};
      
      if (dataAttr) {
        try {
          data = JSON.parse(dataAttr);
        } catch (error) {
          console.warn('Failed to parse widget data:', error);
        }
      }
      
      return {
        id: item.id || this.generateFallbackId(),
        type: el.getAttribute('data-widget-type') || 'unknown',
        title: el.getAttribute('data-widget-title') || 'Untitled Widget',
        x: item.x || 0,
        y: item.y || 0,
        w: item.w || 1,
        h: item.h || 1,
        data
      };
    });
  }

  private createDefaultConfig(item: GridStackNode): WidgetConfig {
    return {
      id: item.id || this.generateFallbackId(),
      type: 'unknown',
      title: 'Untitled Widget',
      x: item.x || 0,
      y: item.y || 0,
      w: item.w || 1,
      h: item.h || 1,
      data: {}
    };
  }

  private generateFallbackId(): string {
    return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    if (this.grid) {
      this.grid.destroy(false);
      this.grid = null;
    }
    this.changeCallbacks = [];
  }
}
