"""
Uninformed Search Algorithms
BFS and DFS implementations
"""

from collections import deque
from typing import Dict, List
from .base import BaseSearchAlgorithm, SearchResult


class BreadthFirstSearch(BaseSearchAlgorithm):
    """Breadth-First Search Algorithm"""

    def search(self, start: str, goal: str, **kwargs) -> SearchResult:
        """
        Execute BFS algorithm

        Args:
            start: Starting node
            goal: Goal node

        Returns:
            SearchResult with path and exploration details
        """
        visited, visited_set, parent, tree_edges = self._initialize_search(start)
        queue = deque([(start, [start])])
        visited_set.add(start)

        while queue:
            current, path = queue.popleft()
            visited.append(current)

            if current == goal:
                return self._build_result(
                    path=path,
                    visited=visited,
                    success=True,
                    parent=parent,
                    tree_edges=tree_edges
                )

            for neighbor in self.graph.get(current, []):
                if neighbor not in visited_set:
                    visited_set.add(neighbor)
                    parent[neighbor] = current
                    tree_edges.append([current, neighbor])
                    queue.append((neighbor, path + [neighbor]))

        return self._build_result(
            path=[],
            visited=visited,
            success=False,
            parent=parent,
            tree_edges=tree_edges
        )


class DepthFirstSearch(BaseSearchAlgorithm):
    """Depth-First Search Algorithm"""

    def search(self, start: str, goal: str, **kwargs) -> SearchResult:
        """
        Execute DFS algorithm

        Args:
            start: Starting node
            goal: Goal node

        Returns:
            SearchResult with path and exploration details
        """
        visited, visited_set, parent, tree_edges = self._initialize_search(start)
        stack = [(start, [start])]

        while stack:
            current, path = stack.pop()

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
                    tree_edges=tree_edges
                )

            for neighbor in reversed(self.graph.get(current, [])):
                if neighbor not in visited_set:
                    if neighbor not in parent:
                        parent[neighbor] = current
                        tree_edges.append([current, neighbor])
                    stack.append((neighbor, path + [neighbor]))

        return self._build_result(
            path=[],
            visited=visited,
            success=False,
            parent=parent,
            tree_edges=tree_edges
        )

