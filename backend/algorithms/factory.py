"""
Algorithm Factory
Factory pattern for creating search algorithm instances
"""

from typing import Dict, List

from .breadth_first_search import BreadthFirstSearch
from .base import BaseSearchAlgorithm
from .depth_first_search import DepthFirstSearch
from .informed_search import AStarSearch, GreedyBestFirstSearch
from .weighted_search import DijkstraSearch


class AlgorithmFactory:
    """Factory class for creating search algorithm instances"""

    _algorithms = {
        'bfs': BreadthFirstSearch,
        'dfs': DepthFirstSearch,
        'dijkstra': DijkstraSearch,
        'astar': AStarSearch,
        'greedy': GreedyBestFirstSearch,
    }

    @classmethod
    def create(cls, algorithm_name: str, graph: Dict[str, List[str]]) -> BaseSearchAlgorithm:
        """
        Create an instance of the specified algorithm

        Args:
            algorithm_name: Name of the algorithm (bfs, dfs, dijkstra, astar, greedy)
            graph: Graph represented as adjacency list

        Returns:
            Instance of the requested algorithm

        Raises:
            ValueError: If algorithm_name is not recognized
        """
        algorithm_class = cls._algorithms.get(algorithm_name.lower())

        if algorithm_class is None:
            raise ValueError(
                f"Unknown algorithm: {algorithm_name}. "
                f"Available algorithms: {', '.join(cls._algorithms.keys())}"
            )

        return algorithm_class(graph)

    @classmethod
    def available_algorithms(cls) -> List[str]:
        """Get list of available algorithm names"""
        return list(cls._algorithms.keys())
