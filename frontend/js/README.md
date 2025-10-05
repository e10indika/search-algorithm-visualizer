# Frontend JavaScript Modules

This directory contains the refactored modular JavaScript code for the Search Algorithms Visualizer.

## File Structure

```
js/
├── main.js                    # Main entry point and initialization
├── config.js                  # Configuration and constants
├── state.js                   # Application state management
├── dom.js                     # DOM elements manager
├── api.js                     # API service for backend communication
├── utils.js                   # Utility functions
├── validator.js               # Graph validation
├── svg-renderer.js            # SVG rendering utilities
├── ui-builder.js              # UI component builders
├── graph-builder.js           # Graph visualization builder
├── tree-visualizer.js         # Tree visualization
├── animation-controller.js    # Animation logic
├── visualization-manager.js   # Visualization orchestration
├── search-controller.js       # Search algorithm controller
└── examples-manager.js        # Example data management
```

## Module Descriptions

### Core Modules

- **main.js**: Application entry point, initializes the app and sets up event listeners
- **config.js**: Contains all configuration constants (API URLs, colors, dimensions, etc.)
- **state.js**: Manages application state using the AppState class
- **dom.js**: Centralized DOM element references and helper methods

### Services

- **api.js**: Handles all API calls to the backend (fetch examples, search, generate tree)
- **validator.js**: Validates user inputs before processing

### Utilities

- **utils.js**: Common utility functions (sleep, SVG creation, layout calculation)
- **svg-renderer.js**: SVG element creation and rendering functions

### UI Components

- **ui-builder.js**: Creates UI elements (titles, status divs, legends, controls)
- **graph-builder.js**: Builds and renders the graph visualization
- **tree-visualizer.js**: Builds and renders the state space tree

### Controllers

- **animation-controller.js**: Manages animation sequences
- **visualization-manager.js**: Orchestrates the visualization process
- **search-controller.js**: Controls search execution and tree generation
- **examples-manager.js**: Loads and manages example graphs

## Module Dependencies

```
main.js
  ├── api.js (config.js)
  ├── dom.js
  ├── search-controller.js
  │   ├── state.js
  │   ├── dom.js
  │   ├── api.js
  │   ├── validator.js
  │   └── visualization-manager.js
  └── examples-manager.js
      ├── state.js
      ├── dom.js
      └── api.js

visualization-manager.js
  ├── state.js
  ├── dom.js
  ├── utils.js
  ├── ui-builder.js
  ├── graph-builder.js
  ├── tree-visualizer.js
  └── animation-controller.js
```

## Usage

The modules use ES6 import/export syntax. The HTML file loads only `main.js` as a module:

```html
<script type="module" src="js/main.js"></script>
```

All other modules are imported as needed using ES6 imports.

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a single, well-defined responsibility
2. **Maintainability**: Easier to find and modify specific functionality
3. **Reusability**: Modules can be reused independently
4. **Testability**: Each module can be tested in isolation
5. **Scalability**: Easy to add new features without modifying existing code
6. **Code Organization**: Clear structure makes onboarding easier

## Migration Notes

The original `script.js` (1450 lines) has been:
- Backed up as `script.js.backup`
- Split into 14 focused modules (~100-200 lines each)
- Converted to use ES6 modules with proper imports/exports

All functionality remains the same - only the organization has changed.

