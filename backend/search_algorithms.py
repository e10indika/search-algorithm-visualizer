"""
Search Algorithms Implementation
Updated to use built-in NetworkX algorithms for better performance and reliability
"""

from algorithms import (
    NetworkXSearchAdapter,
    StateSpaceTreeGenerator
)


class SearchAlgorithms:
    """
    Wrapper class for search algorithms using NetworkX built-in implementations
    """

    @staticmethod
    def generate_complete_state_space_tree(graph, start, max_depth=5):
        """Generate complete state space tree from start node"""
        return StateSpaceTreeGenerator.generate(graph, start, max_depth)

    @staticmethod
    def bfs(graph, start, goal):
        """Breadth-First Search using NetworkX"""
        adapter = NetworkXSearchAdapter(graph)
        result = adapter.bfs(start, goal)
        return result.to_dict()

    @staticmethod
    def dfs(graph, start, goal):
        """Depth-First Search using NetworkX"""
        adapter = NetworkXSearchAdapter(graph)
        result = adapter.dfs(start, goal)
        return result.to_dict()

    @staticmethod
    def dijkstra(graph, start, goal, weights):
        """Dijkstra's Algorithm using NetworkX"""
        adapter = NetworkXSearchAdapter(graph)
        result = adapter.dijkstra(start, goal, weights=weights)
        return result.to_dict()

    @staticmethod
    def a_star(graph, start, goal, weights, heuristic):
        """A* Search Algorithm using NetworkX"""
        adapter = NetworkXSearchAdapter(graph)
        result = adapter.astar(start, goal, weights=weights, heuristic=heuristic)
        return result.to_dict()

    @staticmethod
    def greedy_best_first(graph, start, goal, heuristic):
        """Greedy Best-First Search using NetworkX"""
        adapter = NetworkXSearchAdapter(graph)
        result = adapter.greedy_best_first(start, goal, heuristic=heuristic)
        return result.to_dict()
