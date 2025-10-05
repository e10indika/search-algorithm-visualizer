"""
Algorithm Comparison Utilities
Tools to compare custom implementations vs library-based implementations
"""

import time
from typing import Dict, List, Any, Callable
from .base import SearchResult


class AlgorithmBenchmark:
    """Benchmark and compare different algorithm implementations"""

    @staticmethod
    def benchmark_algorithm(
        algorithm_func: Callable,
        graph: Dict[str, List[str]],
        start: str,
        goal: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Benchmark a single algorithm execution

        Returns:
            Dictionary with result and performance metrics
        """
        start_time = time.perf_counter()
        result = algorithm_func(start, goal, **kwargs)
        end_time = time.perf_counter()

        execution_time = (end_time - start_time) * 1000  # Convert to milliseconds

        result_dict = result.to_dict() if isinstance(result, SearchResult) else result

        return {
            **result_dict,
            'execution_time_ms': round(execution_time, 4),
            'nodes_explored': len(result_dict.get('visited', [])),
            'path_length': len(result_dict.get('path', []))
        }

    @staticmethod
    def compare_implementations(
        custom_algo: Callable,
        library_algo: Callable,
        graph: Dict[str, List[str]],
        start: str,
        goal: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Compare custom vs library implementation

        Returns:
            Comparison results with both implementations
        """
        print("Running custom implementation...")
        custom_result = AlgorithmBenchmark.benchmark_algorithm(
            custom_algo, graph, start, goal, **kwargs
        )

        print("Running library-based implementation...")
        library_result = AlgorithmBenchmark.benchmark_algorithm(
            library_algo, graph, start, goal, **kwargs
        )

        speedup = custom_result['execution_time_ms'] / library_result['execution_time_ms'] if library_result['execution_time_ms'] > 0 else float('inf')

        return {
            'custom': custom_result,
            'library': library_result,
            'speedup': round(speedup, 2),
            'same_result': custom_result['path'] == library_result['path']
        }


class AlgorithmSelector:
    """Smart selector to choose between custom and library implementations"""

    @staticmethod
    def get_recommended_implementation(
        algorithm: str,
        graph_size: int,
        use_library: bool = False
    ) -> str:
        """
        Recommend implementation based on graph size and requirements

        Args:
            algorithm: Algorithm name
            graph_size: Number of nodes in graph
            use_library: Force use of library implementation

        Returns:
            'custom' or 'library'
        """
        if use_library:
            return 'library'

        # For large graphs (>1000 nodes), recommend library
        if graph_size > 1000:
            return 'library'

        # For educational purposes or small graphs, use custom
        if graph_size < 100:
            return 'custom'

        # Medium graphs - library for complex algorithms
        if algorithm in ['dijkstra', 'astar']:
            return 'library'

        return 'custom'

