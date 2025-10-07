"""
Search Algorithms Implementation
Updated to use custom implementations with step-by-step tracking
"""

from algorithms import (
    BreadthFirstSearch,
    DepthFirstSearch,
    DijkstraSearch,
    AStarSearch,
    GreedyBestFirstSearch,
    StateSpaceTreeGenerator
)


class SearchAlgorithms:
    """
    Wrapper class for search algorithms with step-by-step tracking
    """

    @staticmethod
    def generate_complete_state_space_tree(graph, start, max_depth=5):
        """Generate complete state space tree from start node"""
        return StateSpaceTreeGenerator.generate(graph, start, max_depth)

    @staticmethod
    def bfs(graph, start, goal):
        """Breadth-First Search with step-by-step tracking"""
        algorithm = BreadthFirstSearch(graph)
        result = algorithm.search(start, goal)
        return result.to_dict()

    @staticmethod
    def dfs(graph, start, goal):
        """Depth-First Search with step-by-step tracking"""
        algorithm = DepthFirstSearch(graph)
        result = algorithm.search(start, goal)
        return result.to_dict()

    @staticmethod
    def dijkstra(graph, start, goal, weights):
        """Dijkstra's Algorithm with step-by-step tracking"""
        algorithm = DijkstraSearch(graph)
        result = algorithm.search(start, goal, weights=weights)
        return result.to_dict()

    @staticmethod
    def a_star(graph, start, goal, weights, heuristic):
        """A* Search Algorithm with step-by-step tracking"""
        algorithm = AStarSearch(graph)
        result = algorithm.search(start, goal, weights=weights, heuristic=heuristic)
        return result.to_dict()

    @staticmethod
    def greedy_best_first(graph, start, goal, heuristic):
        """Greedy Best-First Search with step-by-step tracking"""
        algorithm = GreedyBestFirstSearch(graph)
        result = algorithm.search(start, goal, heuristic=heuristic)
        return result.to_dict()
