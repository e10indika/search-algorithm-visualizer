/**
 * Depth-First Search Algorithm
 * JavaScript implementation with support for limited depth search
 */

import { BaseSearchAlgorithm, SearchStep } from './base.js';

export class DepthFirstSearch extends BaseSearchAlgorithm {
    /**
     * Execute DFS algorithm
     * @param {string} start - Starting node
     * @param {string} goal - Goal node
     * @param {object} options - Additional options (maxDepth: limit search depth)
     * @returns {SearchResult} Search result with path and exploration details
     */
    search(start, goal, options = {}) {
        const maxDepth = options.maxDepth || Infinity;
        const { visited, visitedSet, parent, treeEdges } = this._initializeSearch(start);

        // Ensure start node is marked visited
        visited.push(start);
        visitedSet.add(start);

        // Start node is at depth 0
        const startId = `${start}-0`;

        // Stack stores [node_label, node_id, path, depth]
        const stack = [[start, startId, [start], 0]];
        const steps = [];
        let stepNumber = 0;

        // Track opened/closed with node IDs
        const openedIds = [startId];
        const closedIds = [];

        // DFS main loop
        while (stack.length > 0) {
            const [current, currentId, path, depth] = stack.pop();

            // Move current from opened to closed
            const openedIndex = openedIds.indexOf(currentId);
            if (openedIndex !== -1) {
                openedIds.splice(openedIndex, 1);
            }
            if (!closedIds.includes(currentId)) {
                closedIds.push(currentId);
            }

            // Add current to visited if not already there
            if (!visited.includes(current)) {
                visited.push(current);
            }

            // Only explore neighbors if we haven't reached max depth
            if (depth < maxDepth) {
                const neighborDepth = depth + 1;
                const neighbors = this.graph[current] || [];

                for (const neighbor of neighbors) {
                    if (!visitedSet.has(neighbor)) {
                        visitedSet.add(neighbor);
                        parent[neighbor] = current;
                        treeEdges.push([current, neighbor]);

                        // Generate node ID with path format: parentPath#node-depth
                        const pathStr = path.join('');
                        const neighborId = `${pathStr}#${neighbor}-${neighborDepth}`;
                        stack.push([neighbor, neighborId, [...path, neighbor], neighborDepth]);

                        // Add to opened list
                        openedIds.push(neighborId);
                    }
                }
            }

            // Update frontier to reflect current stack
            const frontierNodeIds = [...openedIds];

            // Record step with node IDs
            steps.push(new SearchStep({
                stepNumber,
                currentNode: current,
                action: 'visit',
                pathSoFar: [...path],
                visited: [...closedIds],
                frontier: frontierNodeIds,
                parent: { ...parent },
                treeEdges: treeEdges.map(e => [...e]),
                depth
            }));
            stepNumber++;

            // Check if goal found
            if (current === goal) {
                steps.push(new SearchStep({
                    stepNumber,
                    currentNode: current,
                    action: 'goal_found',
                    pathSoFar: [...path],
                    visited: [...closedIds],
                    frontier: frontierNodeIds,
                    parent: { ...parent },
                    treeEdges: treeEdges.map(e => [...e]),
                    depth
                }));

                return this._buildResult({
                    path,
                    visited,
                    success: true,
                    parent,
                    treeEdges,
                    steps,
                    depth
                });
            }
        }

        // Goal not found
        return this._buildResult({
            path: [],
            visited,
            success: false,
            parent,
            treeEdges,
            steps
        });
    }
}
