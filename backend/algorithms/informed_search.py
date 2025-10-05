"""
Informed Search Algorithms
A* and Greedy Best-First Search implementations
"""

import heapq
from typing import Dict, List
from .base import BaseSearchAlgorithm, SearchResult


class AStarSearch(BaseSearchAlgorithm):
    """A* Search Algorithm"""

    def search(self, start: str, goal: str, **kwargs) -> SearchResult:
        """
        Execute A* algorithm

        Args:
            start: Starting node
            goal: Goal node
            weights: Dictionary of edge weights in format {(node1, node2): weight}
            heuristic: Dictionary of heuristic values {node: h_value}

        Returns:
            SearchResult with optimal path and exploration details
        """
        weights = kwargs.get('weights', {})
        heuristic = kwargs.get('heuristic', {})

        visited, visited_set, parent, tree_edges = self._initialize_search(start)
        g_score = {start: 0}
        f_score = {start: heuristic.get(start, 0)}
        pq = [(f_score[start], start, [start])]

        while pq:
            current_f, current, path = heapq.heappop(pq)

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
                    cost=g_score[current]
                )

            for neighbor in self.graph.get(current, []):
                if neighbor not in visited_set:
                    weight = weights.get((current, neighbor), 1)
                    tentative_g = g_score[current] + weight

                    if neighbor not in g_score or tentative_g < g_score[neighbor]:
                        g_score[neighbor] = tentative_g
                        f = tentative_g + heuristic.get(neighbor, 0)
                        f_score[neighbor] = f
                        if neighbor not in parent:
                            parent[neighbor] = current
                            tree_edges.append([current, neighbor])
                        heapq.heappush(pq, (f, neighbor, path + [neighbor]))

        return self._build_result(
            path=[],
            visited=visited,
            success=False,
            parent=parent,
            tree_edges=tree_edges
        )


class GreedyBestFirstSearch(BaseSearchAlgorithm):
    """Greedy Best-First Search Algorithm"""

    def search(self, start: str, goal: str, **kwargs) -> SearchResult:
        """
        Execute Greedy Best-First Search

        Args:
            start: Starting node
            goal: Goal node
            heuristic: Dictionary of heuristic values {node: h_value}

        Returns:
            SearchResult with path and exploration details
        """
        heuristic = kwargs.get('heuristic', {})

        visited, visited_set, parent, tree_edges = self._initialize_search(start)
        pq = [(heuristic.get(start, 0), start, [start])]

        while pq:
            _, current, path = heapq.heappop(pq)

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

            for neighbor in self.graph.get(current, []):
                if neighbor not in visited_set:
                    h = heuristic.get(neighbor, 0)
                    if neighbor not in parent:
                        parent[neighbor] = current
                        tree_edges.append([current, neighbor])
                    heapq.heappush(pq, (h, neighbor, path + [neighbor]))

        return self._build_result(
            path=[],
            visited=visited,
            success=False,
            parent=parent,
            tree_edges=tree_edges
        )

