import { WidgetConfig } from '../types';
import { BaseWidget } from './BaseWidget';

/**
 * Text Widget implementation
 * Follows Single Responsibility Principle - handles only text display
 */
export class TextWidget extends BaseWidget {
  constructor(config: WidgetConfig) {
    super(config);
  }

  protected render(): any {
    const data = this.getData();
    const content = data.content || 'Enter your text here...';
    const fontSize = data.fontSize || '16px';
    const color = data.color || '#333';

    return (
      <div 
        className="widget-container text-widget" 
        style={{
          '--text-font-size': fontSize,
          '--text-color': color,
          '--text-bg-color': '#f8f9fa',
          fontSize: 'var(--text-font-size)',
          color: 'var(--text-color)',
          backgroundColor: 'var(--text-bg-color)'
        } as any}
      >
        <div className="widget-content">
          <div className="text-widget-content">
            {content}
          </div>
        </div>
      </div>
    );
  }
}
