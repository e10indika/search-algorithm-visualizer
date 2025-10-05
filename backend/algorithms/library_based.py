"""
Library-based Search Algorithms
Using NetworkX and other standard Python libraries for production-ready implementations
"""

import networkx as nx
from typing import Dict, List, Optional, Any, Tuple
from .base import SearchResult


class NetworkXSearchAdapter:
    """
    Adapter class that wraps NetworkX algorithms to provide
    the same interface as our custom implementations
    """

    def __init__(self, graph: Dict[str, List[str]]):
        """
        Initialize with adjacency list and convert to NetworkX graph

        Args:
            graph: Adjacency list representation
        """
        self.graph = graph
        self.nx_graph = self._build_nx_graph(graph)

    def _build_nx_graph(self, graph: Dict[str, List[str]]) -> nx.Graph:
        """Convert adjacency list to NetworkX graph"""
        G = nx.Graph()
        for node, neighbors in graph.items():
            for neighbor in neighbors:
                G.add_edge(node, neighbor)
        return G

    def _build_nx_digraph(self, graph: Dict[str, List[str]], weights: Optional[Dict[Tuple[str, str], float]] = None) -> nx.DiGraph:
        """Convert adjacency list to NetworkX directed graph with weights"""
        G = nx.DiGraph()
        for node, neighbors in graph.items():
            for neighbor in neighbors:
                weight = weights.get((node, neighbor), 1) if weights else 1
                G.add_edge(node, neighbor, weight=weight)
        return G

    def bfs(self, start: str, goal: str) -> SearchResult:
        """
        BFS using NetworkX

        Note: NetworkX's shortest_path uses BFS for unweighted graphs
        """
        try:
            # Get shortest path (uses BFS internally)
            path = nx.shortest_path(self.nx_graph, source=start, target=goal)

            # Simulate visited order using BFS traversal
            visited = list(nx.bfs_tree(self.nx_graph, source=start).nodes())

            # Build parent dict
            parent = {start: None}
            tree_edges = []
            for node in nx.bfs_tree(self.nx_graph, source=start).nodes():
                if node != start:
                    predecessors = list(nx.bfs_predecessors(self.nx_graph, start))
                    for pred, succ in predecessors:
                        parent[succ] = pred
                        tree_edges.append([pred, succ])

            return SearchResult(
                path=path,
                visited=visited,
                success=True,
                algorithm='NetworkX-BFS',
                parent=parent,
                tree_edges=tree_edges
            )
        except nx.NetworkXNoPath:
            return SearchResult(
                path=[],
                visited=[],
                success=False,
                algorithm='NetworkX-BFS',
                parent={start: None},
                tree_edges=[]
            )

    def dfs(self, start: str, goal: str) -> SearchResult:
        """DFS using NetworkX"""
        try:
            # DFS traversal
            dfs_edges = list(nx.dfs_edges(self.nx_graph, source=start))
            visited = [start] + [v for u, v in dfs_edges]

            # Find path using DFS
            path = None
            for p in nx.all_simple_paths(self.nx_graph, start, goal):
                path = p
                break  # DFS takes first path found

            if not path:
                raise nx.NetworkXNoPath()

            # Build parent dict
            parent = {start: None}
            tree_edges = []
            for u, v in dfs_edges:
                parent[v] = u
                tree_edges.append([u, v])

            return SearchResult(
                path=path,
                visited=visited,
                success=True,
                algorithm='NetworkX-DFS',
                parent=parent,
                tree_edges=tree_edges
            )
        except (nx.NetworkXNoPath, StopIteration):
            return SearchResult(
                path=[],
                visited=[start],
                success=False,
                algorithm='NetworkX-DFS',
                parent={start: None},
                tree_edges=[]
            )

    def dijkstra(self, start: str, goal: str, weights: Optional[Dict[Tuple[str, str], float]] = None) -> SearchResult:
        """Dijkstra's algorithm using NetworkX"""
        G = self._build_nx_digraph(self.graph, weights)

        try:
            # Get shortest path and distance
            path = nx.dijkstra_path(G, source=start, target=goal, weight='weight')
            distance = nx.dijkstra_path_length(G, source=start, target=goal, weight='weight')

            # Get visited nodes (all nodes explored)
            distances = nx.single_source_dijkstra_path_length(G, start, weight='weight')
            visited = list(distances.keys())

            # Build parent dict
            parent = {start: None}
            tree = nx.dijkstra_predecessor_and_distance(G, start, weight='weight')
            predecessors = tree[0]
            tree_edges = []

            for node, preds in predecessors.items():
                if preds:
                    parent[node] = preds[0]
                    tree_edges.append([preds[0], node])

            return SearchResult(
                path=path,
                visited=visited,
                success=True,
                algorithm='NetworkX-Dijkstra',
                parent=parent,
                tree_edges=tree_edges,
                distance=distance
            )
        except nx.NetworkXNoPath:
            return SearchResult(
                path=[],
                visited=[start],
                success=False,
                algorithm='NetworkX-Dijkstra',
                parent={start: None},
                tree_edges=[]
            )

    def astar(self, start: str, goal: str, weights: Optional[Dict[Tuple[str, str], float]] = None,
              heuristic: Optional[Dict[str, float]] = None) -> SearchResult:
        """A* algorithm using NetworkX"""
        G = self._build_nx_digraph(self.graph, weights)

        # Define heuristic function for NetworkX
        # NetworkX expects heuristic(node, target) with 2 arguments
        def h(node, target):
            return heuristic.get(node, 0) if heuristic else 0

        try:
            # Get shortest path using A*
            path = nx.astar_path(G, source=start, target=goal, heuristic=h, weight='weight')
            cost = nx.astar_path_length(G, source=start, target=goal, heuristic=h, weight='weight')

            # For visited nodes, we approximate with Dijkstra's exploration
            distances = nx.single_source_dijkstra_path_length(G, start, weight='weight')
            visited = list(distances.keys())

            # Build parent dict
            parent = {start: None}
            tree_edges = []
            for i in range(len(path) - 1):
                parent[path[i + 1]] = path[i]
                tree_edges.append([path[i], path[i + 1]])

            return SearchResult(
                path=path,
                visited=visited,
                success=True,
                algorithm='NetworkX-A*',
                parent=parent,
                tree_edges=tree_edges,
                cost=cost
            )
        except nx.NetworkXNoPath:
            return SearchResult(
                path=[],
                visited=[start],
                success=False,
                algorithm='NetworkX-A*',
                parent={start: None},
                tree_edges=[]
            )

    def greedy_best_first(self, start: str, goal: str, heuristic: Optional[Dict[str, float]] = None) -> SearchResult:
        """
        Greedy Best-First Search using NetworkX A* with zero edge weights

        Greedy Best-First is essentially A* where edge weights are ignored (set to 0),
        making it purely heuristic-driven
        """
        import heapq

        if not heuristic:
            heuristic = {}

        # Use priority queue based on heuristic only
        visited = []
        visited_set = set()
        parent = {start: None}
        tree_edges = []

        # Priority queue: (heuristic_value, node)
        pq = [(heuristic.get(start, 0), start)]

        while pq:
            _, current = heapq.heappop(pq)

            if current in visited_set:
                continue

            visited_set.add(current)
            visited.append(current)

            if current == goal:
                # Reconstruct path
                path = []
                node = goal
                while node is not None:
                    path.append(node)
                    node = parent.get(node)
                path.reverse()

                return SearchResult(
                    path=path,
                    visited=visited,
                    success=True,
                    algorithm='NetworkX-Greedy-BFS',
                    parent=parent,
                    tree_edges=tree_edges
                )

            # Explore neighbors
            for neighbor in self.graph.get(current, []):
                if neighbor not in visited_set:
                    if neighbor not in parent:
                        parent[neighbor] = current
                        tree_edges.append([current, neighbor])
                    heapq.heappush(pq, (heuristic.get(neighbor, float('inf')), neighbor))

        return SearchResult(
            path=[],
            visited=visited,
            success=False,
            algorithm='NetworkX-Greedy-BFS',
            parent={start: None},
            tree_edges=tree_edges
        )


class HeapqSearchOptimized:
    """
    Optimized implementations using Python's heapq library
    These are enhanced versions of our custom implementations with better performance
    """

    @staticmethod
    def dijkstra_optimized(graph: Dict[str, List[str]], start: str, goal: str,
                          weights: Dict[Tuple[str, str], float]) -> Dict[str, Any]:
        """
        Highly optimized Dijkstra using heapq with lazy deletion
        Performance: O((V + E) log V)
        """
        import heapq

        distances = {start: 0}
        parent = {start: None}
        pq = [(0, start, [start])]
        visited = []
        visited_set = set()
        tree_edges = []

        while pq:
            current_dist, current, path = heapq.heappop(pq)

            # Lazy deletion - skip if we've found a better path
            if current in visited_set:
                continue

            visited_set.add(current)
            visited.append(current)

            if current == goal:
                return {
                    'path': path,
                    'visited': visited,
                    'success': True,
                    'distance': current_dist,
                    'algorithm': 'Optimized-Dijkstra',
                    'parent': parent,
                    'tree_edges': tree_edges
                }

            for neighbor in graph.get(current, []):
                if neighbor not in visited_set:
                    weight = weights.get((current, neighbor), 1)
                    new_dist = current_dist + weight

                    # Only update if better path found
                    if neighbor not in distances or new_dist < distances[neighbor]:
                        distances[neighbor] = new_dist
                        parent[neighbor] = current
                        tree_edges.append([current, neighbor])
                        heapq.heappush(pq, (new_dist, neighbor, path + [neighbor]))

        return {
            'path': [],
            'visited': visited,
            'success': False,
            'algorithm': 'Optimized-Dijkstra',
            'parent': parent,
            'tree_edges': tree_edges
        }
