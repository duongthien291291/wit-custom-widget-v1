import { useState } from 'preact/hooks';
import { WidgetManager } from '../services/WidgetManager';

interface HeaderProps {
  widgetManager: WidgetManager;
}

/**
 * Header Component
 * Application header with controls
 * Follows Single Responsibility Principle
 * Optimized with React state instead of DOM manipulation
 */
export const Header = ({ widgetManager }: HeaderProps) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all widgets? This action cannot be undone.')) {
      widgetManager.clearAllWidgets();
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    widgetManager.save();
    
    // Show visual feedback using React state
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved!';
      default: return '💾 Save Dashboard';
    }
  };

  const getSaveButtonClass = () => {
    const baseClass = 'btn btn-primary header-save-button';
    const disabledClass = widgetManager.hasUnsavedChanges.value ? '' : 'disabled';
    const statusClass = saveStatus === 'saved' ? 'btn-success' : '';
    return `${baseClass} ${disabledClass} ${statusClass}`.trim();
  };

  return (
    <header class="app-layout-header">
      <div class="header-container">
        <div>
          <h1 class="header-title">
            WIT Custom Widget Dashboard
          </h1>
          <p class="header-subtitle">
            Drag widgets from the sidebar to build your dashboard
          </p>
        </div>
        
        <div class="header-actions">
          {widgetManager.hasUnsavedChanges.value && (
            <span class="header-unsaved-indicator">
              ● Unsaved changes
            </span>
          )}
          <button
            class={getSaveButtonClass()}
            onClick={handleSave}
            disabled={!widgetManager.hasUnsavedChanges.value || saveStatus === 'saving'}
          >
            {getSaveButtonText()}
          </button>
          
          <button
            class="btn btn-outline-primary header-clear-button"
            onClick={handleClearAll}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>
    </header>
  );
};
