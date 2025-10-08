/**
 * Search Algorithms Manager
 * Central class to execute all search algorithms
 * Replaces the backend API
 */

import { BreadthFirstSearch } from './bfs.js';
import { DepthFirstSearch } from './dfs.js';
import { DijkstraSearch } from './dijkstra.js';
import { AStarSearch } from './astar.js';
import { GreedyBestFirstSearch } from './greedy.js';
import { UniformCostSearch } from './ucs.js';
import { IterativeDeepeningSearch } from './ids.js';

export class SearchAlgorithms {
    /**
     * Execute a search algorithm
     * @param {string} algorithm - Algorithm name (bfs, dfs, dijkstra, astar, greedy, ucs, ids)
     * @param {object} graph - Graph adjacency list
     * @param {string} start - Start node
     * @param {string} goal - Goal node
     * @param {object} options - Additional options (weights, heuristic, maxDepth)
     * @returns {object} Search result
     */
    static search(algorithm, graph, start, goal, options = {}) {
        let searchAlgorithm;

        switch (algorithm.toLowerCase()) {
            case 'bfs':
                searchAlgorithm = new BreadthFirstSearch(graph);
                break;
            case 'dfs':
                searchAlgorithm = new DepthFirstSearch(graph);
                break;
            case 'dijkstra':
                searchAlgorithm = new DijkstraSearch(graph);
                break;
            case 'astar':
            case 'a_star':
                searchAlgorithm = new AStarSearch(graph);
                break;
            case 'greedy':
            case 'greedy_best_first':
                searchAlgorithm = new GreedyBestFirstSearch(graph);
                break;
            case 'ucs':
            case 'uniform_cost':
                searchAlgorithm = new UniformCostSearch(graph);
                break;
            case 'ids':
            case 'iterative_deepening':
                searchAlgorithm = new IterativeDeepeningSearch(graph);
                break;
            default:
                throw new Error(`Unknown algorithm: ${algorithm}`);
        }

        const result = searchAlgorithm.search(start, goal, options);
        return result.toDict();
    }

    /**
     * Individual algorithm methods for direct access
     */
    static bfs(graph, start, goal) {
        return this.search('bfs', graph, start, goal);
    }

    static dfs(graph, start, goal, maxDepth = null) {
        const options = maxDepth !== null ? { maxDepth } : {};
        return this.search('dfs', graph, start, goal, options);
    }

    static dijkstra(graph, start, goal, weights = {}) {
        return this.search('dijkstra', graph, start, goal, { weights });
    }

    static astar(graph, start, goal, weights = {}, heuristic = {}) {
        return this.search('astar', graph, start, goal, { weights, heuristic });
    }

    static greedy(graph, start, goal, heuristic = {}) {
        return this.search('greedy', graph, start, goal, { heuristic });
    }

    static ucs(graph, start, goal, weights = {}) {
        return this.search('ucs', graph, start, goal, { weights });
    }

    static ids(graph, start, goal, maxDepth = 10) {
        return this.search('ids', graph, start, goal, { maxDepth });
    }
}
