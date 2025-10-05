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
                'A-B': 1,
                'A-C': 4,
                'B-D': 2,
                'B-E': 5,
                'C-F': 3,
                'E-F': 1
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
                'S-A': 3,
                'S-B': 2,
                'A-C': 2,
                'A-D': 3,
                'B-D': 5,
                'B-E': 4,
                'C-F': 4,
                'D-F': 2,
                'D-G': 4,
                'E-H': 3,
                'F-I': 3,
                'G-I': 2,
                'G-J': 3,
                'H-J': 2,
                'I-F': 3,
                'I-G': 2
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
        }
    };

    static async loadExamples() {
        console.log('📚 Loading predefined examples...');
        // Examples are already defined above
        console.log(`✅ Loaded ${Object.keys(this.examples).length} examples`);
        return this.examples;
    }

    static getExample(name) {
        const example = this.examples[name];
        if (!example) {
            console.warn(`Example '${name}' not found`);
            return null;
        }
        // Return a deep copy to avoid mutations
        return JSON.parse(JSON.stringify(example));
    }

    static listExamples() {
        return Object.keys(this.examples);
    }

    static addExample(name, exampleData) {
        this.examples[name] = exampleData;
        console.log(`✅ Added example '${name}'`);
    }
}
