/**
 * API Service
 * Handles search algorithm execution using local JavaScript implementation
 */

import {SearchAlgorithms} from './algorithms/search-algorithms.js';

export class APIService {
    static async checkHealth() {
        return {status: 'ok', mode: 'browser-only'};
    }

    static async searchGraph(requestData) {
        try {
            const {algorithm, graph, start, goal, weights, heuristic, maxDepth} = requestData;

            return SearchAlgorithms.search(algorithm, graph, start, goal, {
                weights: weights || {},
                heuristic: heuristic || {},
                maxDepth: maxDepth || undefined
            });
        } catch (error) {
            console.error('Search error:', error);
            return {
                error: error.message,
                success: false,
                path: [],
                visited: [],
                steps: []
            };
        }
    }
}
