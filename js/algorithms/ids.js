/**
 * Iterative Deepening Search (IDS) Algorithm
 * Performs depth-limited search with incrementally increasing depth limits
 */

import { BaseSearchAlgorithm, SearchStep } from './base.js';
import { DepthFirstSearch } from './dfs.js';

export class IterativeDeepeningSearch extends BaseSearchAlgorithm {
    /**
     * Execute IDS algorithm
     * @param {string} start - Starting node
     * @param {string} goal - Goal node
     * @param {object} options - Additional options (maxDepth: maximum depth limit)
     * @returns {SearchResult} Search result with path and exploration details
     */
    search(start, goal, options = {}) {
        const maxIterations = options.maxDepth || 10;

        const visited = [];
        const visitedSet = new Set();
        let allSteps = [];
        let stepNumber = 0;
        const parent = { [start]: null };
        const treeEdges = [];

        // Track all opened and closed node IDs across iterations
        const allOpenedIds = new Set();
        const allClosedIds = new Set();

        // Try increasing depth limits
        for (let depthLimit = 0; depthLimit <= maxIterations; depthLimit++) {
            allSteps.push(new SearchStep({
                stepNumber,
                currentNode: start,
                action: 'depth_limit_increase',
                pathSoFar: [start],
                visited: Array.from(allClosedIds),
                frontier: Array.from(allOpenedIds),
                parent: { ...parent },
                treeEdges: treeEdges.map(e => [...e]),
                currentDepthLimit: depthLimit
            }));
            stepNumber++;

            // Perform depth-limited DFS
            const dfs = new DepthFirstSearch(this.graph);
            const result = dfs.search(start, goal, { maxDepth: depthLimit });

            // Merge visited nodes
            result.visited.forEach(node => {
                if (!visitedSet.has(node)) {
                    visitedSet.add(node);
                    visited.push(node);
                }
            });

            // Update parent and tree edges
            Object.assign(parent, result.parent);
            result.tree_edges.forEach(edge => {
                const edgeStr = `${edge[0]}-${edge[1]}`;
                if (!treeEdges.some(e => `${e[0]}-${e[1]}` === edgeStr)) {
                    treeEdges.push(edge);
                }
            });

            // Collect all node IDs from this iteration
            result.steps.forEach(step => {
                step.visited.forEach(id => allClosedIds.add(id));
                step.frontier.forEach(id => allOpenedIds.add(id));

                allSteps.push(new SearchStep({
                    stepNumber,
                    currentNode: step.current_node,
                    action: step.action,
                    pathSoFar: step.path_so_far,
                    visited: step.visited,
                    frontier: step.frontier,
                    parent: { ...parent },
                    treeEdges: treeEdges.map(e => [...e]),
                    currentDepthLimit: depthLimit,
                    depth: step.extra.depth || 0
                }));
                stepNumber++;
            });

            // Check if goal was found
            if (result.success) {
                allSteps.push(new SearchStep({
                    stepNumber,
                    currentNode: goal,
                    action: 'goal_found',
                    pathSoFar: result.path,
                    visited: Array.from(allClosedIds),
                    frontier: Array.from(allOpenedIds),
                    parent: { ...parent },
                    treeEdges: treeEdges.map(e => [...e]),
                    currentDepthLimit: depthLimit,
                    depth: result.extra.depth || 0
                }));

                return this._buildResult({
                    path: result.path,
                    visited,
                    success: true,
                    parent,
                    treeEdges,
                    steps: allSteps,
                    depthLimitUsed: depthLimit
                });
            }
        }

        // Goal not found within max depth
        return this._buildResult({
            path: [],
            visited,
            success: false,
            parent,
            treeEdges,
            steps: allSteps,
            maxDepthReached: maxIterations
        });
    }
}
