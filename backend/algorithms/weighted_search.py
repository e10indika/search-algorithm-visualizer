"""
Weighted Search Algorithms
Dijkstra's Algorithm implementation
"""

import heapq
from typing import Dict, List, Tuple
from .base import BaseSearchAlgorithm, SearchResult


class DijkstraSearch(BaseSearchAlgorithm):
    """Dijkstra's Shortest Path Algorithm"""

    def search(self, start: str, goal: str, **kwargs) -> SearchResult:
        """
        Execute Dijkstra's algorithm

        Args:
            start: Starting node
            goal: Goal node
            weights: Dictionary of edge weights in format {(node1, node2): weight}

        Returns:
            SearchResult with shortest path and exploration details
        """
        weights = kwargs.get('weights', {})

        visited, visited_set, parent, tree_edges = self._initialize_search(start)
        distances = {start: 0}
        pq = [(0, start, [start])]

        while pq:
            current_dist, current, path = heapq.heappop(pq)

            if current in visited_set:
                continue

            visited_set.add(current)
            visited.append(current)

            if current == goal:
                return self._build_result(
                    path=path,
                    visited=visited,
                    success=True,
                    parent=parent,
                    tree_edges=tree_edges,
                    distance=current_dist
                )

            for neighbor in self.graph.get(current, []):
                if neighbor not in visited_set:
                    weight = weights.get((current, neighbor), 1)
                    new_dist = current_dist + weight

                    if neighbor not in distances or new_dist < distances[neighbor]:
                        distances[neighbor] = new_dist
                        if neighbor not in parent:
                            parent[neighbor] = current
                            tree_edges.append([current, neighbor])
                        heapq.heappush(pq, (new_dist, neighbor, path + [neighbor]))

        return self._build_result(
            path=[],
            visited=visited,
            success=False,
            parent=parent,
            tree_edges=tree_edges
        )

