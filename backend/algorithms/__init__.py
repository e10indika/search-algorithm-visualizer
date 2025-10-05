"""
Search Algorithms Package
Organized collection of graph search algorithms
"""

from .uninformed_search import BreadthFirstSearch, DepthFirstSearch
from .informed_search import AStarSearch, GreedyBestFirstSearch
from .weighted_search import DijkstraSearch
from .tree_generator import StateSpaceTreeGenerator
from .factory import AlgorithmFactory
from .library_based import NetworkXSearchAdapter, HeapqSearchOptimized
from .utils import AlgorithmBenchmark, AlgorithmSelector

__all__ = [
    'BreadthFirstSearch',
    'DepthFirstSearch',
    'AStarSearch',
    'GreedyBestFirstSearch',
    'DijkstraSearch',
    'StateSpaceTreeGenerator',
    'AlgorithmFactory',
    'NetworkXSearchAdapter',
    'HeapqSearchOptimized',
    'AlgorithmBenchmark',
    'AlgorithmSelector',
]
