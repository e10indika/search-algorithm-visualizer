"""
Flask Backend API for Search Algorithms Visualization
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from search_algorithms import SearchAlgorithms

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication


@app.route('/api/generate-tree', methods=['POST'])
def generate_tree():
    """
    Endpoint to generate complete state space tree
    Expected JSON:
    {
        "graph": {"A": ["B", "C"], ...},
        "start": "A",
        "max_depth": 5
    }
    """
    try:
        data = request.json
        graph = data.get('graph', {})
        start = data.get('start')
        max_depth = data.get('max_depth', 5)

        if not start or not graph:
            return jsonify({'error': 'Graph and start node are required'}), 400

        result = SearchAlgorithms.generate_complete_state_space_tree(graph, start, max_depth)
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/search/graph', methods=['POST'])
def search_graph():
    """
    Endpoint for graph-based search algorithms
    Expected JSON:
    {
        "algorithm": "bfs|dfs|dijkstra|astar|greedy",
        "graph": {"A": ["B", "C"], ...},
        "start": "A",
        "goal": "D",
        "weights": {"A-B": 5, ...},  # optional, for weighted algorithms
        "heuristic": {"A": 10, ...}  # optional, for informed algorithms
    }
    """
    try:
        data = request.json
        algorithm = data.get('algorithm', 'bfs').lower()
        graph = data.get('graph', {})
        start = data.get('start')
        goal = data.get('goal')
        weights = data.get('weights', {})
        heuristic = data.get('heuristic', {})

        # Convert weights from "A-B" format to (A, B) tuple format
        weights_dict = {}
        for edge, weight in weights.items():
            if '-' in edge:
                node1, node2 = edge.split('-')
                weights_dict[(node1, node2)] = weight

        # Execute the appropriate algorithm
        if algorithm == 'bfs':
            result = SearchAlgorithms.bfs(graph, start, goal)
        elif algorithm == 'dfs':
            result = SearchAlgorithms.dfs(graph, start, goal)
        elif algorithm == 'dijkstra':
            result = SearchAlgorithms.dijkstra(graph, start, goal, weights_dict)
        elif algorithm == 'astar':
            result = SearchAlgorithms.a_star(graph, start, goal, weights_dict, heuristic)
        elif algorithm == 'greedy':
            result = SearchAlgorithms.greedy_best_first(graph, start, goal, heuristic)
        else:
            return jsonify({'error': 'Invalid algorithm'}), 400

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/examples/graph', methods=['GET'])
def get_graph_examples():
    """Get predefined graph examples"""
    examples = {
        'simple': {
            'graph': {
                'A': ['B', 'C'],
                'B': ['A', 'D', 'E'],
                'C': ['A', 'F'],
                'D': ['B'],
                'E': ['B', 'F'],
                'F': ['C', 'E']
            },
            'start': 'A',
            'goal': 'F',
            'weights': {
                'A-B': 4,
                'A-C': 2,
                'B-D': 5,
                'B-E': 10,
                'C-F': 3,
                'E-F': 1
            },
            'heuristic': {
                'A': 7,
                'B': 6,
                'C': 5,
                'D': 8,
                'E': 2,
                'F': 0
            }
        },
        'complex': {
            'graph': {
                'S': ['A', 'B', 'C'],
                'A': ['S', 'D', 'E'],
                'B': ['S', 'F'],
                'C': ['S', 'G'],
                'D': ['A', 'H'],
                'E': ['A', 'H'],
                'F': ['B', 'I'],
                'G': ['C', 'I'],
                'H': ['D', 'E', 'G'],
                'I': ['F', 'G']
            },
            'start': 'S',
            'goal': 'I',
            'weights': {
                'S-A': 1,
                'S-B': 4,
                'S-C': 8,
                'A-D': 3,
                'A-E': 7,
                'B-F': 5,
                'C-G': 3,
                'D-H': 4,
                'E-H': 2,
                'F-I': 6,
                'G-I': 2,
                'H-G': 5
            },
            'heuristic': {
                'S': 10,
                'A': 9,
                'B': 7,
                'C': 5,
                'D': 8,
                'E': 6,
                'F': 4,
                'G': 3,
                'H': 4,
                'I': 0
            }
        }
    }
    return jsonify(examples)


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Search Algorithms API is running'})


if __name__ == '__main__':
    print("Starting Search Algorithms API Server...")
    print("Server running at http://localhost:5001")
    app.run(debug=True, port=5001)
