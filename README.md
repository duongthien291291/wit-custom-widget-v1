# WIT Custom Widget Dashboard

A modern, performant Preact TypeScript application for creating customizable widget dashboards with drag-and-drop functionality.

## Features

- 🎯 **Drag & Drop Interface**: Intuitive widget placement using GridStack
- 🧩 **Modular Widget System**: Easy to extend with new widget types
- 💾 **Local Storage**: Automatic persistence of dashboard layouts
- ⚡ **Performance Optimized**: Uses Preact signals and memoization
- 🎨 **Modern UI/UX**: Responsive design with SCSS styling
- 🏗️ **Clean Architecture**: Follows SOLID principles and design patterns

## Architecture

### SOLID Principles Implementation

- **Single Responsibility**: Each class has one reason to change
- **Open-Closed**: Easy to extend with new widgets without modifying existing code
- **Liskov Substitution**: All widgets implement the same interface
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depends on abstractions, not concretions

### Design Patterns Used

- **Factory Pattern**: WidgetFactory for creating widgets
- **Template Method**: BaseWidget defines widget structure
- **Observer Pattern**: Reactive state management with signals
- **Facade Pattern**: WidgetManager provides unified interface
- **Strategy Pattern**: Different widget types with same interface

## Tech Stack

- **Frontend**: Preact + TypeScript
- **Build Tool**: Vite
- **Styling**: SCSS with CSS variables
- **Drag & Drop**: GridStack
- **State Management**: Preact Signals
- **Storage**: Local Storage API

## Getting Started

### Prerequisites

- Node.js 18+ OR Docker & Docker Compose
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Development with Hot Reload

```bash
# Build and start development container with hot reload
docker-compose up dev

# Or use the npm script
npm run docker:dev

# Access the app at http://localhost:3000
# Changes in src/ folder will hot reload automatically
```

### Docker Production

```bash
# Build and start production container
docker-compose up prod

# Or use the npm script
npm run docker:prod

# Access the app at http://localhost:80

# Run in detached mode
docker-compose up -d prod
```

### Docker Commands

```bash
# Start development service
docker-compose up dev

# Start production service
docker-compose up prod

# Rebuild containers
docker-compose build dev
docker-compose build prod

# Stop containers
docker-compose down

# View logs
docker-compose logs -f dev
docker-compose logs -f prod

# Clean up (remove containers and volumes)
docker-compose down -v
```

## Project Structure

```
src/
├── components/          # React components
├── services/           # Business logic services
├── widgets/            # Widget implementations
├── factories/          # Factory patterns
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/             # TypeScript type definitions
└── styles/            # SCSS stylesheets
```

## Widget System

### Creating Custom Widgets

1. Extend the `BaseWidget` class
2. Implement the `render()` method
3. Register with `WidgetFactory`

```typescript
export class CustomWidget extends BaseWidget {
  protected render(): JSX.Element {
    return <div>Custom Widget Content</div>;
  }
}

// Register in factory
factory.registerWidget('custom', CustomWidget, {
  type: 'custom',
  name: 'Custom Widget',
  description: 'A custom widget',
  icon: '🔧',
  category: 'Custom',
  defaultSize: { w: 2, h: 2 }
});
```

## Performance Optimizations

- **Preact Signals**: Reactive state management
- **useMemo**: Memoized expensive calculations
- **useCallback**: Memoized event handlers
- **Debouncing**: Optimized user input handling
- **Lazy Loading**: Components loaded on demand

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Follow the established architecture patterns
2. Ensure all new widgets extend BaseWidget
3. Add proper TypeScript types
4. Include performance optimizations
5. Test across different screen sizes

## License

MIT License - see LICENSE file for details
