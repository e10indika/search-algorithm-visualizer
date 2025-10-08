from collections import deque

from .base import BaseSearchAlgorithm, SearchStep, SearchResult


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

        # Ensure start node is marked visited
        visited.append(start)
        visited_set.add(start)

        # Start node is at depth 0
        start_id = f"{start}-0"

        # Queue now stores (node_label, node_id, path, depth)
        queue = deque([(start, start_id, [start], 0)])
        steps = []
        step_number = 0

        # Track opened/closed with node IDs
        opened_ids = [start_id]  # Node IDs in frontier
        closed_ids = []  # Node IDs that have been visited

        # BFS main loop
        while queue:
            current, current_id, path, depth = queue.popleft()

            # Move current from opened to closed
            if current_id in opened_ids:
                opened_ids.remove(current_id)
            if current_id not in closed_ids:
                closed_ids.append(current_id)

            # Add current to visited if not already there
            if current not in visited:
                visited.append(current)

            # Explore neighbors at depth + 1
            neighbor_depth = depth + 1
            for neighbor in self.graph.get(current, []):
                if neighbor not in visited_set:
                    visited_set.add(neighbor)
                    parent[neighbor] = current
                    tree_edges.append([current, neighbor])

                    # Generate node ID with path format: parentPath#node-depth
                    path_str = ''.join(path)
                    neighbor_id = f"{path_str}#{neighbor}-{neighbor_depth}"
                    queue.append((neighbor, neighbor_id, path + [neighbor], neighbor_depth))

                    # Add to opened list
                    opened_ids.append(neighbor_id)

            # Update frontier to reflect current queue
            frontier_node_ids = opened_ids.copy()

            # Record step with node IDs
            steps.append(SearchStep(
                step_number=step_number,
                current_node=current,
                action='visit',
                path_so_far=path,
                visited=closed_ids.copy(),  # Send node IDs for closed
                frontier=frontier_node_ids,  # Send node IDs for opened
                parent=parent.copy(),
                tree_edges=tree_edges.copy()
            ))
            step_number += 1

            # Check if goal found
            if current == goal:
                steps.append(SearchStep(
                    step_number=step_number,
                    current_node=current,
                    action='goal_found',
                    path_so_far=path,
                    visited=closed_ids.copy(),
                    frontier=frontier_node_ids,
                    parent=parent.copy(),
                    tree_edges=tree_edges.copy()
                ))
                return self._build_result(
                    path=path,
                    visited=visited,
                    success=True,
                    parent=parent,
                    tree_edges=tree_edges,
                    steps=steps
                )

        # Goal not found
        return self._build_result(
            path=[],
            visited=visited,
            success=False,
            parent=parent,
            tree_edges=tree_edges,
            steps=steps
        )