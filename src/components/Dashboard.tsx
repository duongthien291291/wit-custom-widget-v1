import { useEffect, useRef } from 'preact/hooks';
import { WidgetManager } from '../services/WidgetManager';

interface DashboardProps {
  widgetManager: WidgetManager;
}

/**
 * Dashboard Component
 * Main container for the widget grid
 * Follows Single Responsibility Principle
 */
export function Dashboard({ widgetManager }: DashboardProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current && !widgetManager.isInitialized.value) {
      widgetManager.initialize(gridRef.current);
    }
  }, [widgetManager]);

  // GridStack handles drag and drop automatically with proper configuration

  return (
    <div className="dashboard">
      <div className="grid-container">
        <div 
          ref={gridRef}
          className="grid-stack"
        />
      </div>
    </div>
  );
}
