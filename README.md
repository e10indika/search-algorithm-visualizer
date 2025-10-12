# 🔍 Search Algorithms Visualizer

An interactive web-based visualization tool for graph search algorithms. No backend required - runs entirely in your browser!

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.ecma-international.org/ecma-262/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-success.svg)](https://pages.github.com/)

## ✨ Features

- 🎯 **5 Search Algorithms**: BFS, DFS, Dijkstra, A*, Greedy Best-First
- 🎨 **Dual Visualization**: State space graph + search tree side-by-side
- ⚡ **Step-by-Step Mode**: Manual control with Next/Previous buttons
- 🎬 **Auto Animation**: Adjustable speed for automatic visualization
- 📊 **Real-time Tracking**: Opened/Closed node lists with path-based IDs
- 🌐 **100% Browser-Based**: No backend server needed
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎓 **Educational**: Perfect for learning and teaching graph algorithms

## 🚀 Quick Start

### Option 1: Open Locally (Instant)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/SearchAlgorithms.git
cd SearchAlgorithms

# Start a local server (choose one):
python3 -m http.server 8000
# OR
npx http-server -p 8000
# OR
php -S localhost:8000

# Open in browser
open http://localhost:8000
```

### Option 2: Deploy to GitHub Pages (Free Hosting)

1. Fork or clone this repository
2. Go to **Settings** → **Pages**
3. Select **Source**: `main` branch, root folder
4. Click **Save**
5. Your site will be live at: `https://YOUR_USERNAME.github.io/SearchAlgorithms/`

### Option 3: Test Algorithms Quickly

Open `standalone-test.html` directly in your browser to test all algorithms without the full UI.

## 📖 How to Use

### Using Predefined Examples

1. Toggle to **"Predefined Example"** mode
2. Select from:
   - **Simple Graph** (6 nodes) - Great for beginners
   - **Complex Graph** (10 nodes) - Advanced testing
   - **Tree Structure** (10 nodes) - Perfect tree
3. Click **"Draw Graph & Tree"**
4. Select an algorithm (BFS, DFS, Dijkstra, A*, Greedy)
5. Choose visualization mode (Auto/Manual)
6. Click **"Start Search"**

### Creating Custom Graphs

1. Toggle to **"Custom Graph"** mode
2. Enter graph in JSON format:
```json
{
  "A": ["B", "C"],
  "B": ["A", "D"],
  "C": ["A", "F"],
  "D": ["B"],
  "E": ["B", "F"],
  "F": ["C", "E"]
}
```
3. Optional: Add weights (for Dijkstra, A*)
```json
{
  "A,B": 1,
  "A,C": 3,
  "B,D": 2
}
```
4. Optional: Add heuristics (for A*, Greedy)
```json
{
  "A": 5,
  "B": 4,
  "F": 0
}
```

## 🎮 Visualization Modes

### Auto Mode
- Automatic step-by-step animation
- Adjustable speed (2s to 0.05s per step)
- Highlights visited nodes and final path

### Manual Mode
- **Next**: Advance one step
- **Previous**: Go back one step
- **Play Auto**: Resume automatic animation
- **Reset**: Start over from step 0

## 🏗️ Architecture

### Frontend-Only Design
```
SearchAlgorithms/
├── index.html              # Main application
├── standalone-test.html    # Quick algorithm tests
├── styles.css             # Global styles
├── css/
│   └── styles.css         # Component styles
└── js/
    ├── main.js            # Application entry point
    ├── api.js             # Local algorithm executor
    ├── search-controller.js # Search orchestration
    ├── tree-visualizer.js  # Tree rendering
    ├── graph-builder.js    # Graph rendering
    ├── examples-manager.js # Predefined examples
    └── algorithms/         # All search algorithms
        ├── base.js         # Base classes
        ├── bfs.js          # Breadth-First Search
        ├── dfs.js          # Depth-First Search
        ├── dijkstra.js     # Dijkstra's Algorithm
        ├── astar.js        # A* Search
        ├── greedy.js       # Greedy Best-First
        └── search-algorithms.js # Algorithm manager
```

### No Backend Required!
All algorithms run directly in the browser using JavaScript. The original Python backend has been completely converted to JavaScript.

## 🎯 Algorithms Implemented

| Algorithm | Type | Optimal? | Complete? | Time Complexity |
|-----------|------|----------|-----------|-----------------|
| **BFS** | Uninformed | Yes* | Yes | O(V + E) |
| **DFS** | Uninformed | No | Yes | O(V + E) |
| **Dijkstra** | Weighted | Yes | Yes | O((V + E) log V) |
| **A*** | Informed | Yes** | Yes | O((V + E) log V) |
| **Greedy** | Informed | No | Yes | O((V + E) log V) |

\* Optimal for unweighted graphs  
\** Optimal with admissible heuristic

## 🎨 Visualization Features

### Node ID Format
Nodes use path-based IDs showing their position in the search tree:
- `A-0` → Node A at depth 0 (root)
- `A#B-1` → Node B reached via path A, at depth 1
- `ABE#F-3` → Node F reached via path A→B→E, at depth 3

### Color Coding
- 🟢 **Green**: Start node
- 🔴 **Red**: Goal node
- 🔵 **Blue**: Opened nodes (frontier)
- 🟠 **Orange**: Closed nodes (visited)
- 🟡 **Yellow**: Solution path

## 🛠️ Technologies

- **JavaScript ES6+**: Modern JavaScript features
- **SVG**: Scalable vector graphics for visualization
- **CSS3**: Responsive styling
- **ES6 Modules**: Modular code organization
- **No Dependencies**: Pure vanilla JavaScript

## 📝 Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

Requires ES6 module support (all modern browsers).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎓 Educational Use

Perfect for:
- Computer Science courses
- Algorithm visualization
- Self-learning data structures and algorithms
- Teaching graph theory concepts
- Comparing algorithm efficiency

## 🙏 Acknowledgments

- Inspired by classical graph search algorithms
- Built with educational purposes in mind
- Converted from Python to JavaScript for browser-based deployment

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for learning and education** | **No backend required - 100% browser-based** 🚀

