/**
 * Base Search Algorithm Classes
 * JavaScript implementation of search algorithm base classes
 */

/**
 * SearchStep - Encapsulates a single step in the search process
 */
export class SearchStep {
    constructor({
        stepNumber,
        currentNode,
        action,
        pathSoFar,
        visited,
        frontier,
        parent,
        treeEdges,
        ...extra
    }) {
        this.step_number = stepNumber;
        this.current_node = currentNode;
        this.action = action;
        this.path_so_far = pathSoFar;
        this.visited = [...visited];
        this.frontier = [...frontier];
        this.parent = { ...parent };
        this.tree_edges = treeEdges.map(edge => [...edge]);
        this.extra = extra;
    }

    toDict() {
        return {
            step_number: this.step_number,
            current_node: this.current_node,
            action: this.action,
            path_so_far: this.path_so_far,
            visited: this.visited,
            frontier: this.frontier,
            parent: this.parent,
            tree_edges: this.tree_edges,
            ...this.extra
        };
    }
}

/**
 * SearchResult - Encapsulates search algorithm results
 */
export class SearchResult {
    constructor({
        path,
        visited,
        success,
        algorithm,
        parent,
        treeEdges,
        steps = [],
        ...extra
    }) {
        this.path = path;
        this.visited = visited;
        this.success = success;
        this.algorithm = algorithm;
        this.parent = parent;
        this.tree_edges = treeEdges;
        this.steps = steps;
        this.extra = extra;
    }

    toDict() {
        return {
            path: this.path,
            visited: this.visited,
            success: this.success,
            algorithm: this.algorithm,
            parent: this.parent,
            tree_edges: this.tree_edges,
            steps: this.steps.map(step => step.toDict()),
            ...this.extra
        };
    }
}

/**
 * BaseSearchAlgorithm - Abstract base class for all search algorithms
 */
export class BaseSearchAlgorithm {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * Execute the search algorithm (to be implemented by subclasses)
     */
    search(start, goal, options = {}) {
        throw new Error('search() must be implemented by subclass');
    }

    /**
     * Initialize common search data structures
     */
    _initializeSearch(start) {
        const visited = [];
        const visitedSet = new Set();
        const parent = { [start]: null };
        const treeEdges = [];
        return { visited, visitedSet, parent, treeEdges };
    }

    /**
     * Build a SearchResult object
     */
    _buildResult({
        path,
        visited,
        success,
        parent,
        treeEdges,
        steps = [],
        ...extra
    }) {
        return new SearchResult({
            path,
            visited,
            success,
            algorithm: this.constructor.name,
            parent,
            treeEdges,
            steps,
            ...extra
        });
    }
}

