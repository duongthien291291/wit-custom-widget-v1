import { WidgetManager } from '../services/WidgetManager';

interface HeaderProps {
  widgetManager: WidgetManager;
}

/**
 * Header Component
 * Application header with controls
 * Follows Single Responsibility Principle
 */
export function Header({ widgetManager }: HeaderProps) {
  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all widgets? This action cannot be undone.')) {
      widgetManager.clearAllWidgets();
    }
  };

  const handleSave = () => {
    widgetManager.save();
    
    // Show visual feedback
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
      const originalText = saveButton.textContent;
      saveButton.textContent = 'Saved!';
      saveButton.style.backgroundColor = 'var(--success-color)';
      
      setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.backgroundColor = '';
      }, 2000);
    }
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
            id="save-button"
            class={`btn btn-primary header-save-button ${widgetManager.hasUnsavedChanges.value ? '' : 'disabled'}`}
            onClick={handleSave}
            disabled={!widgetManager.hasUnsavedChanges.value}
          >
            💾 Save Dashboard
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
}
