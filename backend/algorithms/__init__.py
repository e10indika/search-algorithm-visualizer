"""
Search Algorithms Package
Organized collection of graph search algorithms
"""

from .base import SearchStep, SearchResult
from .depth_first_search import DepthFirstSearch
from .breadth_first_search import BreadthFirstSearch
from .informed_search import AStarSearch, GreedyBestFirstSearch
from .weighted_search import DijkstraSearch
from .tree_generator import StateSpaceTreeGenerator
from .factory import AlgorithmFactory
from .library_based import NetworkXSearchAdapter, HeapqSearchOptimized
from .utils import AlgorithmBenchmark, AlgorithmSelector

__all__ = [
    'SearchStep',
    'SearchResult',
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
