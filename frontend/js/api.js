/**
 * API Service
 * Handles search algorithm execution using local JavaScript implementation
 */

import { SearchAlgorithms } from './algorithms/search-algorithms.js';

export class APIService {
    /**
     * Execute search algorithm locally (no backend required)
     * @param {object} requestData - Request data containing algorithm, graph, start, goal, etc.
     * @returns {Promise<object>} Search result
     */
    static async searchGraph(requestData) {
        try {
            const { algorithm, graph, start, goal, weights, heuristic } = requestData;

            console.log('🔍 Executing search locally:', { algorithm, start, goal });

            // Execute the algorithm locally using JavaScript implementation
            const result = SearchAlgorithms.search(algorithm, graph, start, goal, {
                weights: weights || {},
                heuristic: heuristic || {}
            });

            console.log('✅ Search completed locally:', result);

            return result;
        } catch (error) {
            console.error('❌ Search error:', error);
            return {
                error: error.message,
                success: false,
                path: [],
                visited: [],
                steps: []
            };
        }
    }

    /**
     * Legacy method - kept for compatibility
     * Now executes locally instead of calling backend
     */
    static async callBackend(endpoint, data) {
        console.warn('Backend call intercepted - executing locally instead');
        return this.searchGraph(data);
    }
}
