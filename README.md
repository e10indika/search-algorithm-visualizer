# 🔍 Search Algorithms Visualizer

An interactive web application for visualizing various search and pathfinding algorithms with both grid-based and graph-based implementations.

## 📋 Features

- **Grid Mode**: Visualize pathfinding on a 2D grid with obstacles
  - Breadth-First Search (BFS)
  - A* Search with Manhattan/Euclidean heuristics
  
- **Graph Mode**: Visualize search algorithms on custom graphs
  - Breadth-First Search (BFS)
  - Depth-First Search (DFS)
  - Dijkstra's Algorithm
  - A* Search
  - Greedy Best-First Search

## 🚀 Getting Started

### Prerequisites

- Python 3.x installed on your system
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation & Setup

1. **Navigate to the project directory**
   ```bash
   cd /Users/indika/MSc/IT5431/SearchAlgorithms
   ```

2. **Install Python dependencies**
   ```bash
   pip install flask flask-cors
   ```
   
   Or if using pip3:
   ```bash
   pip3 install flask flask-cors
   ```

### Running the Application

#### Option 1: Quick Start (Recommended)

1. **Start the backend server**
   ```bash
   cd backend
   python3 app.py
   ```
   
   You should see:
   ```
   Starting Search Algorithms API Server...
   Server running at http://localhost:5001
   * Serving Flask app 'app'
   * Debug mode: on
   ```

2. **Open the frontend**
   
   In a new terminal window or simply double-click:
   ```bash
   open frontend/index.html
   ```
   
   Or manually open `frontend/index.html` in your web browser.

#### Option 2: Using the Start Script

```bash
chmod +x start.sh
./start.sh
```

### Accessing the Application

- **Backend API**: http://localhost:5001
- **Frontend UI**: Opens automatically in your default browser
- **API Health Check**: http://localhost:5001/api/health

## 🎮 How to Use

### Grid Mode
1. Select "Grid Mode" from the mode selector
2. Choose an algorithm (BFS or A*)
3. Set grid size and heuristic type (for A*)
4. Click on grid cells to:
   - Set start point (green)
   - Set goal point (red)
   - Add obstacles (black)
5. Click "Run Algorithm" to visualize the pathfinding process

### Graph Mode
1. Select "Graph Mode" from the mode selector
2. Choose an algorithm (BFS, DFS, Dijkstra, A*, or Greedy)
3. Load a predefined example or create your own graph
4. Set start and goal nodes
5. Click "Run Algorithm" to see the search visualization

## 📁 Project Structure

```
SearchAlgorithms/
├── backend/
│   ├── app.py                  # Flask API server
│   ├── search_algorithms.py    # Algorithm implementations
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── index.html             # Main UI
│   ├── script.js              # Frontend logic
│   └── styles.css             # Styling
├── README.md                  # This file
├── run.py                     # Alternative startup script
└── start.sh                   # Shell script to start the app
```

## 🛠️ Troubleshooting

### Port 5000 Already in Use
If you see "Address already in use" error, it's likely because macOS AirPlay Receiver uses port 5000. The application has been configured to use port 5001 instead.

To disable AirPlay Receiver:
- Go to System Preferences → General → AirDrop & Handoff
- Disable "AirPlay Receiver"

### Python Command Not Found
If `python` command doesn't work, try using `python3` instead:
```bash
python3 app.py
```

### Module Not Found Errors
Make sure all dependencies are installed:
```bash
pip3 install flask flask-cors
```

## 🔌 API Endpoints

- `GET /api/health` - Health check
- `POST /api/search/graph` - Execute graph-based search algorithms
- `POST /api/search/grid` - Execute grid-based search algorithms
- `GET /api/examples/graph` - Get predefined graph examples

## 📝 Algorithms Implemented

### Uninformed Search
- **BFS (Breadth-First Search)**: Explores all neighbors at current depth before moving to next level
- **DFS (Depth-First Search)**: Explores as far as possible along each branch before backtracking

### Informed Search
- **A* Search**: Uses heuristic to find optimal path efficiently
- **Dijkstra's Algorithm**: Finds shortest path using actual distances
- **Greedy Best-First Search**: Uses heuristic to guide search towards goal

## 👨‍💻 Development

To run in development mode with auto-reload:
```bash
cd backend
export FLASK_ENV=development
python3 app.py
```

## 📄 License

This project is for educational purposes as part of IT5431 coursework.

## 🤝 Contributing

This is an academic project. For suggestions or improvements, please contact the project maintainer.

---

**Note**: Make sure the backend server is running before using the frontend interface. The frontend needs to communicate with the API at http://localhost:5001.

