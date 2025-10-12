# JavaScript Modules

This directory contains all the JavaScript modules for the Search Algorithms Visualizer.

## 📁 Module Structure

### Core Modules
- **`main.js`** - Application entry point and initialization
- **`api.js`** - Local algorithm executor (no backend needed)
- **`search-controller.js`** - Orchestrates search execution and visualization
- **`dom.js`** - DOM element references and utilities
- **`config.js`** - Application configuration

### Visualization Modules
- **`graph-builder.js`** - Builds and renders the state space graph
- **`tree-visualizer.js`** - Builds and renders the search tree
- **`svg-renderer.js`** - SVG rendering utilities
- **`animation-controller.js`** - Controls animation timing

### UI Modules
- **`ui-builder.js`** - UI component builders
- **`examples-manager.js`** - Manages predefined graph examples
- **`validator.js`** - Input validation
- **`utils.js`** - General utilities
- **`state.js`** - Application state management

### Algorithm Modules (`algorithms/`)
- **`base.js`** - Base classes (SearchStep, SearchResult, BaseSearchAlgorithm)
- **`bfs.js`** - Breadth-First Search
- **`dfs.js`** - Depth-First Search
- **`ids.js`** - Iterative Deepening Search
- **`ucs.js`** - Uniform Cost Search
- **`dijkstra.js`** - Dijkstra's Algorithm + PriorityQueue
- **`astar.js`** - A* Search
- **`greedy.js`** - Greedy Best-First Search
- **`bds.js`** - Bidirectional Search
- **`search-algorithms.js`** - Algorithm factory/manager

## 🔄 Module Dependencies

```
main.js
├── api.js
│   └── algorithms/search-algorithms.js
│       ├── algorithms/bfs.js
│       ├── algorithms/dfs.js
│       ├── algorithms/ids.js
│       ├── algorithms/ucs.js
│       ├── algorithms/dijkstra.js
│       ├── algorithms/astar.js
│       ├── algorithms/greedy.js
│       └── algorithms/bds.js
├── search-controller.js
│   ├── graph-builder.js
│   ├── tree-visualizer.js
│   └── api.js
├── examples-manager.js
└── dom.js
```

## 🎯 Key Features

- **ES6 Modules**: Modern JavaScript module system
- **No Dependencies**: Pure vanilla JavaScript
- **Browser-Based**: All algorithms run in the browser
- **Modular Design**: Easy to maintain and extend

## 📝 Adding New Algorithms

To add a new algorithm:

1. Create a new file in `algorithms/` (e.g., `bidirectional.js`)
2. Extend `BaseSearchAlgorithm` from `base.js`
3. Implement the `search(start, goal, options)` method
4. Export the class
5. Add to `search-algorithms.js` factory
6. Update the algorithm dropdown in `index.html`

Example:
```javascript
import { BaseSearchAlgorithm } from './base.js';

export class MyNewAlgorithm extends BaseSearchAlgorithm {
    search(start, goal, options = {}) {
        // Your implementation
        return this._buildResult({ ... });
    }
}
```

## 🧪 Testing

Use `standalone-test.html` in the root directory to test algorithms independently.
