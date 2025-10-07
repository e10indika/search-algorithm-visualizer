"""
Weighted Search Algorithms
Dijkstra's Algorithm implementation
"""

import heapq
from typing import Dict, List, Tuple
from .base import BaseSearchAlgorithm, SearchResult, SearchStep


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
            tree_edges=tree_edges,
            distances=distances.copy()
        ))
        step_number += 1

        while pq:
            current_dist, current, path = heapq.heappop(pq)

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
                tree_edges=tree_edges,
                distances=distances.copy(),
                current_distance=current_dist
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
                    tree_edges=tree_edges,
                    distances=distances.copy(),
                    distance=current_dist
                ))
                return self._build_result(
                    path=path,
                    visited=visited,
                    success=True,
                    parent=parent,
                    tree_edges=tree_edges,
                    distance=current_dist,
                    steps=steps
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
                            tree_edges=tree_edges,
                            distances=distances.copy(),
                            edge_weight=weight
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
