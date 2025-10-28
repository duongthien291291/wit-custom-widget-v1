import { signal } from '@preact/signals';
import { WidgetConfig, WidgetInstance } from '../types';
import { ConcreteWidgetFactory } from '../factories/WidgetFactory';
import { GridStackDragDropService } from '../services/DragDropService';
import { LocalStorageService } from '../services/StorageService';

/**
 * Widget Manager following Facade Pattern
 * Provides a unified interface for widget operations
 * Implements Observer Pattern for state management
 */
export class WidgetManager {
  private factory: ConcreteWidgetFactory;
  private dragDropService: GridStackDragDropService;
  private storageService: LocalStorageService;
  
  // Reactive state using Preact signals
  public readonly widgets = signal<WidgetInstance[]>([]);
  public readonly isInitialized = signal<boolean>(false);
  public readonly hasUnsavedChanges = signal<boolean>(false);

  constructor(
    factory: ConcreteWidgetFactory,
    dragDropService: GridStackDragDropService,
    storageService: LocalStorageService
  ) {
    this.factory = factory;
    this.dragDropService = dragDropService;
    this.storageService = storageService;
  }

  async initialize(container: HTMLElement): Promise<void> {
    try {
      // Initialize drag-drop service
      this.dragDropService.initializeGrid(container);
      
      // Set up change listener
      this.dragDropService.onWidgetChange(this.handleWidgetChange.bind(this));
      
      // Load saved widgets
      await this.loadWidgets();
      
      this.isInitialized.value = true;
    } catch (error) {
      console.error('Failed to initialize WidgetManager:', error);
      throw error;
    }
  }


  addWidgetFromClick(type: string, title: string, icon: string, description: string): void {
    // Create a proper widget instance and add it to our state
    const widgetConfig: WidgetConfig = {
      id: this.generateId(),
      type,
      title,
      x: 0, // GridStack will position it automatically
      y: 0,
      w: 3,
      h: 2,
      data: { icon, description }
    };

    const widget = this.factory.createWidget(type, widgetConfig);
    
    // Add to reactive state
    this.widgets.value = [...this.widgets.value, widget];
    
    // Add to drag-drop service for visual display with same styling as drag
    this.dragDropService.addWidgetFromClick(type, title, icon, description, widget.id);
    
    // Mark as having unsaved changes
    this.hasUnsavedChanges.value = true;
  }

  private generateId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  removeWidget(id: string): void {
    // Remove from reactive state
    this.widgets.value = this.widgets.value.filter(w => w.id !== id);
    
    // Remove from drag-drop service
    this.dragDropService.removeWidget(id);
    
    // Mark as having unsaved changes
    this.hasUnsavedChanges.value = true;
  }

  clearAllWidgets(): void {
    // Clear from drag-drop service
    this.dragDropService.clearAllWidgets();
    
    // Clear from reactive state
    this.widgets.value = [];
    
    // Mark as having unsaved changes
    this.hasUnsavedChanges.value = true;
  }

  updateWidget(id: string, updates: Partial<WidgetConfig>): void {
    const widgetIndex = this.widgets.value.findIndex(w => w.id === id);
    if (widgetIndex === -1) return;

    const widget = this.widgets.value[widgetIndex];
    const updatedConfig = { ...widget.config, ...updates };
    
    // Create new widget instance with updated config
    const updatedWidget = this.factory.createWidget(widget.type, updatedConfig);
    
    // Update in reactive state
    this.widgets.value = [
      ...this.widgets.value.slice(0, widgetIndex),
      updatedWidget,
      ...this.widgets.value.slice(widgetIndex + 1)
    ];
    
    // Mark as having unsaved changes
    this.hasUnsavedChanges.value = true;
  }

  getWidget(id: string): WidgetInstance | undefined {
    return this.widgets.value.find(w => w.id === id);
  }

  getAvailableWidgetTypes() {
    return this.factory.getAvailableWidgets();
  }

  save(): void {
    this.saveWidgets();
    this.hasUnsavedChanges.value = false;
  }

  private handleWidgetChange(widgetConfigs: WidgetConfig[]): void {
    // Start with existing widgets and update their positions/sizes
    const existingWidgets = new Map(
      this.widgets.value.map(w => [w.id, w])
    );
    
    // Process all widgets from the grid
    const updatedWidgets = widgetConfigs.map(config => {
      const existingWidget = existingWidgets.get(config.id);
      
      if (existingWidget) {
        // Update existing widget
        return this.factory.createWidget(config.type, config);
      } else {
        // Add new widget (added via drag-drop)
        return this.factory.createWidget(config.type, config);
      }
    });

    this.widgets.value = updatedWidgets;
    this.hasUnsavedChanges.value = true;
  }

  private async loadWidgets(): Promise<void> {
    try {
      const savedWidgets = this.storageService.load<WidgetConfig[]>('widgets');
      if (savedWidgets && Array.isArray(savedWidgets)) {
        const widgetInstances = savedWidgets.map(config => 
          this.factory.createWidget(config.type, config)
        );
        
        this.widgets.value = widgetInstances;
        
        // Add to drag-drop service
        widgetInstances.forEach(widget => {
          this.dragDropService.addWidget(widget);
        });
      }
    } catch (error) {
      console.error('Failed to load widgets:', error);
    }
  }

  private saveWidgets(): void {
    try {
      // Get all widgets from the grid to ensure we capture everything
      // This includes widgets added via drag-drop that might not be in state yet
      const gridWidgets = this.dragDropService.getAllWidgets();
      
      // Save what's actually in the grid
      this.storageService.save('widgets', gridWidgets);
      
      // Update our state to match what's in the grid
      const widgetInstances = gridWidgets.map(config => 
        this.factory.createWidget(config.type, config)
      );
      this.widgets.value = widgetInstances;
    } catch (error) {
      console.error('Failed to save widgets:', error);
    }
  }

  destroy(): void {
    this.dragDropService.destroy();
    this.widgets.value = [];
    this.isInitialized.value = false;
  }
}
