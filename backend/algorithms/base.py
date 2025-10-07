"""
Base Search Algorithm
Abstract base class for all search algorithms
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Set, Tuple, Optional, Any


class SearchStep:
    """Data class to encapsulate a single step in the search process"""

    def __init__(
        self,
        step_number: int,
        current_node: str,
        action: str,  # 'visit', 'expand', 'goal_found', 'add_to_frontier'
        path_so_far: List[str],
        visited: List[str],
        frontier: List[str],
        parent: Dict[str, Optional[str]],
        tree_edges: List[List[str]],
        **kwargs
    ):
        self.step_number = step_number
        self.current_node = current_node
        self.action = action
        self.path_so_far = path_so_far
        self.visited = visited.copy()
        self.frontier = frontier.copy()
        self.parent = parent.copy()
        self.tree_edges = [edge.copy() for edge in tree_edges]
        self.extra = kwargs  # For algorithm-specific data

    def to_dict(self) -> Dict[str, Any]:
        """Convert step to dictionary for JSON serialization"""
        result = {
            'step_number': self.step_number,
            'current_node': self.current_node,
            'action': self.action,
            'path_so_far': self.path_so_far,
            'visited': self.visited,
            'frontier': self.frontier,
            'parent': self.parent,
            'tree_edges': self.tree_edges
        }
        result.update(self.extra)
        return result


class SearchResult:
    """Data class to encapsulate search algorithm results"""

    def __init__(
        self,
        path: List[str],
        visited: List[str],
        success: bool,
        algorithm: str,
        parent: Dict[str, Optional[str]],
        tree_edges: List[List[str]],
        steps: Optional[List[SearchStep]] = None,
        **kwargs
    ):
        self.path = path
        self.visited = visited
        self.success = success
        self.algorithm = algorithm
        self.parent = parent
        self.tree_edges = tree_edges
        self.steps = steps or []
        self.extra = kwargs  # For algorithm-specific data (cost, distance, etc.)

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary for JSON serialization"""
        result = {
            'path': self.path,
            'visited': self.visited,
            'success': self.success,
            'algorithm': self.algorithm,
            'parent': self.parent,
            'tree_edges': self.tree_edges,
            'steps': [step.to_dict() for step in self.steps]
        }
        result.update(self.extra)
        return result


class BaseSearchAlgorithm(ABC):
    """Abstract base class for all search algorithms"""

    def __init__(self, graph: Dict[str, List[str]]):
        self.graph = graph

    @abstractmethod
    def search(self, start: str, goal: str, **kwargs) -> SearchResult:
        """
        Execute the search algorithm

        Args:
            start: Starting node
            goal: Goal node
            **kwargs: Algorithm-specific parameters

        Returns:
            SearchResult object containing search results
        """
        pass

    def _initialize_search(self, start: str) -> Tuple[List[str], Set[str], Dict[str, Optional[str]], List[List[str]]]:
        """Initialize common search data structures"""
        visited = []
        visited_set = set()
        parent = {start: None}
        tree_edges = []
        return visited, visited_set, parent, tree_edges

    def _build_result(
        self,
        path: List[str],
        visited: List[str],
        success: bool,
        parent: Dict[str, Optional[str]],
        tree_edges: List[List[str]],
        steps: Optional[List[SearchStep]] = None,
        **kwargs
    ) -> SearchResult:
        """Build a SearchResult object"""
        return SearchResult(
            path=path,
            visited=visited,
            success=success,
            algorithm=self.__class__.__name__,
            parent=parent,
            tree_edges=tree_edges,
            steps=steps,
            **kwargs
        )
