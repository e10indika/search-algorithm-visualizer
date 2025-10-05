# Algorithms Package

A well-organized, modular implementation of graph search algorithms.

## Package Structure

```
algorithms/
├── __init__.py              # Package exports
├── base.py                  # Abstract base class and result data structure
├── uninformed_search.py     # BFS and DFS implementations
├── informed_search.py       # A* and Greedy Best-First Search
├── weighted_search.py       # Dijkstra's Algorithm
├── tree_generator.py        # State space tree generator
└── factory.py               # Algorithm factory pattern
```

## Architecture

### Design Principles

1. **Separation of Concerns**: Each file handles a specific type of algorithm
2. **Single Responsibility**: Each class has one clear purpose
3. **Open/Closed Principle**: Easy to extend with new algorithms
4. **Factory Pattern**: Centralized algorithm instantiation
5. **Type Hints**: Full typing support for better IDE integration

### Class Hierarchy

```
BaseSearchAlgorithm (ABC)
├── BreadthFirstSearch
├── DepthFirstSearch
├── DijkstraSearch
├── AStarSearch
└── GreedyBestFirstSearch
```

## Usage

### Using the Factory Pattern (Recommended)

```python
from algorithms import AlgorithmFactory

graph = {
    'A': ['B', 'C'],
    'B': ['D'],
    'C': ['D'],
    'D': []
}

# Create algorithm instance
algo = AlgorithmFactory.create('bfs', graph)

# Execute search
result = algo.search('A', 'D')

# Access results
print(result.path)        # ['A', 'B', 'D']
print(result.visited)     # ['A', 'B', 'C', 'D']
print(result.success)     # True
```

### Using Algorithms Directly

```python
from algorithms import BreadthFirstSearch, AStarSearch

# BFS
bfs = BreadthFirstSearch(graph)
result = bfs.search('A', 'D')

# A* with weights and heuristic
astar = AStarSearch(graph)
result = astar.search(
    'A', 'D',
    weights={('A', 'B'): 5, ('B', 'D'): 3},
    heuristic={'A': 10, 'B': 5, 'D': 0}
)
print(result.extra['cost'])  # Access algorithm-specific data
```

### Generating State Space Trees

```python
from algorithms import StateSpaceTreeGenerator

tree = StateSpaceTreeGenerator.generate(graph, 'A', max_depth=3)
print(tree['tree_edges'])  # All exploration edges
print(tree['nodes'])       # All reachable nodes
```

## Algorithm Categories

### Uninformed Search (uninformed_search.py)
- **BFS**: Breadth-First Search - optimal for unweighted graphs
- **DFS**: Depth-First Search - memory efficient, may not find shortest path

### Weighted Search (weighted_search.py)
- **Dijkstra**: Finds shortest path in weighted graphs

### Informed Search (informed_search.py)
- **A***: Optimal pathfinding with heuristic guidance
- **Greedy Best-First**: Fast but not always optimal

## SearchResult Object

All algorithms return a `SearchResult` object with:

```python
result.path          # Solution path (list of nodes)
result.visited       # Nodes visited in order
result.success       # Whether goal was found (bool)
result.algorithm     # Algorithm name (string)
result.parent        # Parent pointers (dict)
result.tree_edges    # Exploration tree edges
result.extra         # Algorithm-specific data (dict)
result.to_dict()     # Convert to JSON-serializable dict
```

## Adding New Algorithms

1. Create a new class inheriting from `BaseSearchAlgorithm`
2. Implement the `search()` method
3. Register in `factory.py`
4. Export in `__init__.py`

Example:

```python
from .base import BaseSearchAlgorithm, SearchResult

class MyNewAlgorithm(BaseSearchAlgorithm):
    def search(self, start: str, goal: str, **kwargs) -> SearchResult:
        visited, visited_set, parent, tree_edges = self._initialize_search(start)
        
        # Your algorithm logic here
        
        return self._build_result(
            path=path,
            visited=visited,
            success=True,
            parent=parent,
            tree_edges=tree_edges
        )
```

## Benefits of This Structure

✅ **Maintainability**: Each algorithm is isolated and easy to modify
✅ **Testability**: Individual algorithms can be unit tested independently
✅ **Extensibility**: Adding new algorithms doesn't affect existing code
✅ **Readability**: Clear organization and naming conventions
✅ **Type Safety**: Full type hints for better IDE support
✅ **Reusability**: Common functionality in base class
✅ **Backward Compatibility**: Old API still works via wrapper

