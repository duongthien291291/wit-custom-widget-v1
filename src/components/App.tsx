import { useWidgetManager } from '../hooks/useWidgetManager';
import { Header } from './Header';
import { WidgetPalette } from './WidgetPalette';
import { Dashboard } from './Dashboard';

/**
 * Main App Component
 * Orchestrates all components and services
 * Follows Dependency Inversion Principle
 * Optimized with custom hooks for better performance
 */
export function App() {
  const { widgetManager, addWidgetFromClick } = useWidgetManager();

  return (
    <div className="app-layout">
      <aside className="app-layout-sidebar">
        <WidgetPalette
          availableWidgets={widgetManager.getAvailableWidgetTypes()}
          onWidgetSelect={addWidgetFromClick}
        />
      </aside>
      
      <main className="app-layout-main">
        <Header widgetManager={widgetManager} />
        <div className="app-layout-content">
          <Dashboard widgetManager={widgetManager} />
        </div>
      </main>
    </div>
  );
}