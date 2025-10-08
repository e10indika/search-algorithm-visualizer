"""
Uninformed Search Algorithms
BFS and DFS implementations
"""

from collections import deque
from typing import Dict, List
from .base import BaseSearchAlgorithm, SearchResult, SearchStep


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
        steps = []
        step_number = 0

        # Track opened (frontier) and closed (visited) lists
        opened = [start]  # Start with root node in opened list
        closed = []  # Empty closed list initially

        # Initial step - add start node to frontier
        steps.append(SearchStep(
            step_number=step_number,
            current_node=start,
            action='initialize',
            path_so_far=[start],
            visited=[],
            frontier=opened.copy(),
            parent=parent,
            tree_edges=tree_edges
        ))
        step_number += 1

        while stack:
            current, path = stack.pop()

            if current in visited_set:
                continue

            # Remove current from opened list and add to closed list
            if current in opened:
                opened.remove(current)
            if current not in closed:
                closed.append(current)

            visited_set.add(current)
            visited.append(current)

            # Step: visiting current node (node moved from opened to closed)
            steps.append(SearchStep(
                step_number=step_number,
                current_node=current,
                action='visit',
                path_so_far=path,
                visited=closed.copy(),
                frontier=opened.copy(),
                parent=parent,
                tree_edges=tree_edges
            ))
            step_number += 1

            if current == goal:
                # Step: goal found
                steps.append(SearchStep(
                    step_number=step_number,
                    current_node=current,
                    action='goal_found',
                    path_so_far=path,
                    visited=closed.copy(),
                    frontier=opened.copy(),
                    parent=parent,
                    tree_edges=tree_edges
                ))
                return self._build_result(
                    path=path,
                    visited=visited,
                    success=True,
                    parent=parent,
                    tree_edges=tree_edges,
                    steps=steps
                )

            for neighbor in reversed(self.graph.get(current, [])):
                if neighbor not in visited_set:
                    if neighbor not in parent:
                        parent[neighbor] = current
                        tree_edges.append([current, neighbor])
                    stack.append((neighbor, path + [neighbor]))

                    # Add neighbor to opened list
                    if neighbor not in opened:
                        opened.append(neighbor)

                    # Step: add neighbor to frontier
                    steps.append(SearchStep(
                        step_number=step_number,
                        current_node=neighbor,
                        action='add_to_frontier',
                        path_so_far=path + [neighbor],
                        visited=closed.copy(),
                        frontier=opened.copy(),
                        parent=parent,
                        tree_edges=tree_edges
                    ))
                    step_number += 1

        return self._build_result(
            path=[],
            visited=visited,
            success=False,
            parent=parent,
            tree_edges=tree_edges,
            steps=steps
        )
