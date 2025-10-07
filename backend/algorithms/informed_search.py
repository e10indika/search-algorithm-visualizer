"""
Informed Search Algorithms
A* and Greedy Best-First Search implementations
"""

import heapq
from typing import Dict, List
from .base import BaseSearchAlgorithm, SearchResult, SearchStep


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
            g_score=g_score.copy(),
            f_score=f_score.copy()
        ))
        step_number += 1

        while pq:
            current_f, current, path = heapq.heappop(pq)

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
                g_score=g_score.copy(),
                f_score=f_score.copy(),
                current_g=g_score[current],
                current_f=current_f
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
                    g_score=g_score.copy(),
                    f_score=f_score.copy(),
                    cost=g_score[current]
                ))
                return self._build_result(
                    path=path,
                    visited=visited,
                    success=True,
                    parent=parent,
                    tree_edges=tree_edges,
                    cost=g_score[current],
                    steps=steps
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
                            g_score=g_score.copy(),
                            f_score=f_score.copy(),
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
            heuristic_value=heuristic.get(start, 0)
        ))
        step_number += 1

        while pq:
            _, current, path = heapq.heappop(pq)

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
                heuristic_value=heuristic.get(current, 0)
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

            for neighbor in self.graph.get(current, []):
                if neighbor not in visited_set:
                    h = heuristic.get(neighbor, 0)
                    if neighbor not in parent:
                        parent[neighbor] = current
                        tree_edges.append([current, neighbor])
                    heapq.heappush(pq, (h, neighbor, path + [neighbor]))

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
                        heuristic_value=h
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
