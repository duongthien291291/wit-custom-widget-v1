import { useMemo, useCallback } from 'preact/hooks';
import { WidgetManager } from '../services/WidgetManager';
import { ConcreteWidgetFactory } from '../factories/WidgetFactory';
import { GridStackDragDropService } from '../services/DragDropService';
import { LocalStorageService } from '../services/StorageService';

/**
 * Custom hook for WidgetManager
 * Provides memoized instance and optimized callbacks
 * Follows performance best practices with useMemo and useCallback
 */
export const useWidgetManager = () => {
  // Memoize service instances to prevent recreation on every render
  const services = useMemo(() => {
    const storageService = new LocalStorageService();
    const dragDropService = new GridStackDragDropService();
    const widgetFactory = new ConcreteWidgetFactory();
    
    return {
      storageService,
      dragDropService,
      widgetFactory,
      widgetManager: new WidgetManager(widgetFactory, dragDropService, storageService)
    };
  }, []);

  // Memoized callbacks to prevent unnecessary re-renders

  const handleWidgetRemove = useCallback((id: string) => {
    services.widgetManager.removeWidget(id);
  }, [services.widgetManager]);

  const handleWidgetUpdate = useCallback((id: string, updates: Record<string, unknown>) => {
    services.widgetManager.updateWidget(id, updates);
  }, [services.widgetManager]);

  const handleWidgetClick = useCallback((type: string, title: string, icon: string, description: string) => {
    services.widgetManager.addWidgetFromClick(type, title, icon, description);
  }, [services.widgetManager]);

  return {
    widgetManager: services.widgetManager,
    addWidgetFromClick: handleWidgetClick,
    removeWidget: handleWidgetRemove,
    updateWidget: handleWidgetUpdate
  };
};
