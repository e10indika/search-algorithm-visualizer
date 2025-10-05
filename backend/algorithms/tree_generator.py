"""
State Space Tree Generator
Generates complete state space exploration trees
"""

from collections import deque
from typing import Dict, List, Any


class StateSpaceTreeGenerator:
    """Generator for complete state space trees"""

    @staticmethod
    def generate(graph: Dict[str, List[str]], start: str, max_depth: int = 5) -> Dict[str, Any]:
        """
        Generate complete state space tree from start node

        Args:
            graph: Adjacency list representation of the graph
            start: Starting node
            max_depth: Maximum depth to explore

        Returns:
            Dictionary containing tree_edges, nodes, and max_depth
        """
        tree_edges = []
        all_nodes = set()
        queue = deque([(start, 0, [])])  # (node, depth, path_so_far)

        all_nodes.add(start)

        while queue:
            current, depth, path = queue.popleft()

            if depth >= max_depth:
                continue

            for neighbor in graph.get(current, []):
                # Only add edge if neighbor is not an ancestor in current path
                # This prevents backward edges like E->B when we already have B->E
                if neighbor not in path:
                    # Always add edge to tree (allows revisiting nodes in different branches)
                    tree_edges.append([current, neighbor])
                    all_nodes.add(neighbor)

                    # Continue exploration with updated path
                    new_path = path + [current]
                    queue.append((neighbor, depth + 1, new_path))

        return {
            'tree_edges': tree_edges,
            'nodes': list(all_nodes),
            'max_depth': max_depth
        }

