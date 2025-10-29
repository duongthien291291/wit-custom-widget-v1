import { WidgetConfig } from '../types';
import { BaseWidget } from './BaseWidget';
import { JSX } from 'preact/jsx-runtime';

/**
 * Image Widget implementation
 * Follows Single Responsibility Principle - handles only image display
 */
export class ImageWidget extends BaseWidget {
  constructor(config: WidgetConfig) {
    super(config);
  }

  protected render(): JSX.Element {
    const data = this.getData();
    const imageUrl = (data.imageUrl as string) || 'https://via.placeholder.com/300x200?text=No+Image';
    const altText = (data.altText as string) || 'Widget Image';
    const fitMode = (data.fitMode as string) || 'cover';

    return (
      <div className="widget-container image-widget">
        <div className="widget-content image-widget-content">
          <img
            src={imageUrl}
            alt={altText}
            className="image-widget-img"
            style={{
              '--image-fit-mode': fitMode,
              objectFit: 'var(--image-fit-mode)'
            } as Record<string, string>}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
            }}
          />
        </div>
      </div>
    );
  }
}
