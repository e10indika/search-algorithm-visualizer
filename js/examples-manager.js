/**
 * Examples Manager
 * Manages predefined graph examples
 */

export class ExamplesManager {
    static examples = {
        simple: {
            graph: {
                'A': ['B', 'C'],
                'B': ['A', 'D', 'E'],
                'C': ['A', 'F'],
                'D': ['B'],
                'E': ['B', 'F'],
                'F': ['C', 'E']
            },
            weights: {
                'A,B': 1, 'B,A': 1,
                'A,C': 4, 'C,A': 4,
                'B,D': 2, 'D,B': 2,
                'B,E': 5, 'E,B': 5,
                'C,F': 5, 'F,C': 3,
                'E,F': 1, 'F,E': 1
            },
            heuristic: {
                'A': 6,
                'B': 4,
                'C': 4,
                'D': 5,
                'E': 2,
                'F': 0
            },
            start: 'A',
            goal: 'F'
        },
        complex: {
            graph: {
                'S': ['A', 'B'],
                'A': ['S', 'C', 'D'],
                'B': ['S', 'D', 'E'],
                'C': ['A', 'F'],
                'D': ['A', 'B', 'F', 'G'],
                'E': ['B', 'H'],
                'F': ['C', 'D', 'I'],
                'G': ['D', 'I', 'J'],
                'H': ['E', 'J'],
                'I': ['F', 'G'],
                'J': ['G', 'H']
            },
            weights: {
                'S,A': 3, 'A,S': 3,
                'S,B': 2, 'B,S': 2,
                'A,C': 2, 'C,A': 2,
                'A,D': 3, 'D,A': 3,
                'B,D': 5, 'D,B': 5,
                'B,E': 4, 'E,B': 4,
                'C,F': 4, 'F,C': 4,
                'D,F': 2, 'F,D': 2,
                'D,G': 4, 'G,D': 4,
                'E,H': 3, 'H,E': 3,
                'F,I': 3, 'I,F': 3,
                'G,I': 2, 'I,G': 2,
                'G,J': 3, 'J,G': 3,
                'H,J': 2, 'J,H': 2
            },
            heuristic: {
                'S': 10,
                'A': 9,
                'B': 8,
                'C': 7,
                'D': 6,
                'E': 5,
                'F': 4,
                'G': 3,
                'H': 2,
                'I': 1,
                'J': 0
            },
            start: 'S',
            goal: 'J'
        },
        tree: {
            graph: {
                'A': ['B', 'C', 'D'],
                'B': ['E', 'F'],
                'C': ['G', 'H'],
                'D': ['I', 'J'],
                'E': [],
                'F': [],
                'G': [],
                'H': [],
                'I': [],
                'J': []
            },
            weights: {
                'A,B': 1, 'B,A': 1,
                'A,C': 2, 'C,A': 2,
                'A,D': 3, 'D,A': 3,
                'B,E': 1, 'E,B': 1,
                'B,F': 2, 'F,B': 2,
                'C,G': 1, 'G,C': 1,
                'C,H': 2, 'H,C': 2,
                'D,I': 1, 'I,D': 1,
                'D,J': 2, 'J,D': 2
            },
            heuristic: {
                'A': 4, 'B': 3, 'C': 3, 'D': 3,
                'E': 0, 'F': 0, 'G': 0, 'H': 0, 'I': 0, 'J': 0
            },
            start: 'A',
            goal: 'E'
        }
    };

    static async loadExamples() {
        return this.examples;
    }

    static getExample(name) {
        const example = this.examples[name];
        if (!example) return null;
        return JSON.parse(JSON.stringify(example));
    }
}
