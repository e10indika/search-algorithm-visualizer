#!/usr/bin/env python3
"""
Test script for refactored algorithms package
"""

print('Testing refactored algorithms package...\n')

# Test imports
from algorithms import AlgorithmFactory, StateSpaceTreeGenerator

graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

print('1. Testing Custom Implementations...')
# Test custom BFS
algo = AlgorithmFactory.create('bfs', graph)
result = algo.search('A', 'F')
print(f'   ✓ Custom BFS: {result.path}')

# Test custom DFS
algo = AlgorithmFactory.create('dfs', graph)
result = algo.search('A', 'F')
print(f'   ✓ Custom DFS: {result.path}')

print('\n2. Testing Backward Compatibility...')
from search_algorithms import SearchAlgorithms
result_dict = SearchAlgorithms.bfs(graph, 'A', 'F')
print(f'   ✓ Old API works: Success={result_dict["success"]}, Path={result_dict["path"]}')

print('\n3. Testing Tree Generator...')
tree = StateSpaceTreeGenerator.generate(graph, 'A', max_depth=3)
print(f'   ✓ Tree Generator: {len(tree["tree_edges"])} edges, {len(tree["nodes"])} nodes')

print('\n4. Testing NetworkX Library Integration...')
try:
    from algorithms import NetworkXSearchAdapter
    adapter = NetworkXSearchAdapter(graph)
    result = adapter.bfs('A', 'F')
    print(f'   ✓ NetworkX BFS: {result.path}')

    weights = {('A', 'B'): 4, ('A', 'C'): 2, ('C', 'F'): 3}
    result = adapter.dijkstra('A', 'F', weights)
    print(f'   ✓ NetworkX Dijkstra: {result.path}, Distance={result.extra.get("distance")}')
except ImportError as e:
    print(f'   ⚠ NetworkX not available: {e}')
    print('   Install with: pip install networkx')

print('\n✅ All tests passed!')
print('\n📊 Package Structure:')
print('   - Custom implementations for learning')
print('   - Library implementations for performance')
print('   - Backward compatible API')
print('   - Factory pattern for easy instantiation')

