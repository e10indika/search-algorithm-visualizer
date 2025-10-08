/**
 * Graph Validator
 */

export class GraphValidator {
    static validateSearchInputs(start, goal, graph) {
        if (!start || !goal) {
            throw new Error('Please specify start and goal nodes');
        }
        if (Object.keys(graph).length === 0) {
            throw new Error('Please provide a graph structure');
        }
        return true;
    }

    static validateTreeInputs(start, graph) {
        if (!start) {
            throw new Error('Please specify a start node');
        }
        if (Object.keys(graph).length === 0) {
            throw new Error('Please provide a graph structure');
        }
        return true;
    }
}

