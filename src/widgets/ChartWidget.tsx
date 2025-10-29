import { WidgetConfig } from '../types';
import { BaseWidget } from './BaseWidget';
import { JSX } from 'preact/jsx-runtime';

/**
 * Chart Widget implementation
 * Follows Single Responsibility Principle - handles only chart display
 */
export class ChartWidget extends BaseWidget {
  constructor(config: WidgetConfig) {
    super(config);
  }

  protected render(): JSX.Element {
    const data = this.getData();
    const chartType = (data.chartType as string) || 'bar';
    const values = (data.values as number[]) || [10, 20, 30, 40, 50];

    return (
      <div className="widget-container">
        <div className="widget-content">
          <h4 className="widget-title">
            {this.getTitle()}
          </h4>
          <div className="widget-body">
            <div className="chart-container">
              {this.renderChart(chartType, values)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderChart = (type: string, values: number[]): JSX.Element => {
    const maxValue = Math.max(...values);
    
    if (type === 'bar') {
      return (
        <div className="chart-bars">
          {values.map((value, index) => (
            <div 
              key={index}
              className="chart-bar"
              style={{
                '--bar-height': `${(value / maxValue) * 100}%`,
                '--bar-color': `hsl(${index * 60}, 70%, 50%)`,
                height: 'var(--bar-height)',
                backgroundColor: 'var(--bar-color)'
              } as Record<string, string>}
            >
              {value}
            </div>
          ))}
        </div>
      );
    }

    // Default to line chart
    return (
      <div className="chart-line-container">
        <svg width="100%" height="100%" viewBox="0 0 300 200">
          <polyline
            points={values.map((value, index) => 
              `${(index / (values.length - 1)) * 300},${200 - (value / maxValue) * 200}`
            ).join(' ')}
            fill="none"
            stroke="#007bff"
            strokeWidth="2"
          />
          {values.map((value, index) => (
            <circle
              key={index}
              cx={(index / (values.length - 1)) * 300}
              cy={200 - (value / maxValue) * 200}
              r="4"
              fill="#007bff"
            />
          ))}
        </svg>
      </div>
    );
  }
}
