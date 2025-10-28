import { useMemo, useCallback } from 'preact/hooks';
import { WidgetMetadata } from '../types';

interface WidgetPaletteProps {
  availableWidgets: WidgetMetadata[];
  onWidgetSelect: (type: string, title: string, icon: string, description: string) => void;
}

/**
 * Widget Palette Component
 * Displays available widgets for drag-and-drop
 * Follows Single Responsibility Principle
 * Optimized with useMemo and useCallback for performance
 */
export function WidgetPalette({ availableWidgets, onWidgetSelect }: WidgetPaletteProps) {
  // Memoize grouped widgets for performance
  const groupedWidgets = useMemo(() => {
    const groups = availableWidgets.reduce((acc, widget) => {
      if (!acc[widget.category]) {
        acc[widget.category] = [];
      }
      acc[widget.category].push(widget);
      return acc;
    }, {} as Record<string, WidgetMetadata[]>);

    return Object.entries(groups).map(([category, widgets]) => ({
      category,
      widgets
    }));
  }, [availableWidgets]);

  // Memoized callback to prevent unnecessary re-renders
  const handleWidgetClick = useCallback((type: string, title: string, icon: string, description: string) => {
    onWidgetSelect(type, title, icon, description);
  }, [onWidgetSelect]);

  // Add visual drag feedback
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = 'scale(0.95)';
    target.style.opacity = '0.8';
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = '';
    target.style.opacity = '';
  }, []);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = '';
    target.style.opacity = '';
  }, []);

  // GridStack handles drag events automatically - no custom handlers needed

  return (
    <div className="widget-palette">
      <div className="card">
        <div className="card-header">
          <h3 className="widget-palette-header">
            Widget Library
          </h3>
          <p className="widget-palette-description">
            Click widgets to add them to the dashboard
          </p>
        </div>
        <div className="card-body widget-palette-body">
          {groupedWidgets.map(({ category, widgets }) => (
            <div key={category} className="widget-palette-category">
              <h4 className="widget-palette-category-title">
                {category}
              </h4>
              <div className="widget-palette-category-items">
                {widgets.map((widget) => (
                  <div
                    key={widget.type}
                    className="widget-item grid-stack-item"
                    data-widget-type={widget.type}
                    data-widget-title={widget.name}
                    data-widget-data="{}"
                    gs-w="3"
                    gs-h="2"
                    draggable={true}
                    onClick={() => handleWidgetClick(widget.type, widget.name, widget.icon, widget.description)}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="grid-stack-item-content">
                      <div className="widget-item-icon">{widget.icon}</div>
                      <div className="widget-item-title">{widget.name}</div>
                      <div className="widget-item-description">{widget.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}