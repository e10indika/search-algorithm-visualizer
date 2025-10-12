/**
 * Greedy Best-First Search Algorithm
 * JavaScript implementation
 */

import { BaseSearchAlgorithm, SearchStep } from './base.js';
import { PriorityQueue } from './dijkstra.js';

export class GreedyBestFirstSearch extends BaseSearchAlgorithm {
    /**
     * Execute Greedy Best-First Search
     * @param {string} start - Starting node
     * @param {string} goal - Goal node
     * @param {object} options - heuristic values
     * @returns {SearchResult} Search result with path
     */
    search(start, goal, options = {}) {
        const heuristic = options.heuristic || {};

        const { visited, visitedSet, parent, treeEdges } = this._initializeSearch(start);

        // Start node is at depth 0
        const startId = `${start}-0`;

        // Priority queue stores [h_score, node_label, node_id, path, depth]
        const pq = new PriorityQueue();
        pq.push(heuristic[start] || 0, [start, startId, [start], 0]);

        const steps = [];
        let stepNumber = 0;

        // Track opened/closed with node IDs
        const openedIds = [startId];
        const closedIds = [];

        while (!pq.isEmpty()) {
            const [current, currentId, path, depth] = pq.pop();

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

            // Explore neighbors at depth + 1
            const neighborDepth = depth + 1;
            const neighbors = this.graph[current] || [];

            for (const neighbor of neighbors) {
                if (!visitedSet.has(neighbor)) {
                    const h = heuristic[neighbor] || 0;

                    visitedSet.add(neighbor);
                    parent[neighbor] = current;
                    treeEdges.push([current, neighbor]);

                    // Generate node ID with path format: parentPath#node-depth
                    const pathStr = path.join('');
                    const neighborId = `${pathStr}#${neighbor}-${neighborDepth}`;
                    pq.push(h, [neighbor, neighborId, [...path, neighbor], neighborDepth]);

                    // Add to opened list
                    openedIds.push(neighborId);
                }
            }

            // Update frontier to reflect current queue
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
                heuristic_value: heuristic[current] || 0
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
                    treeEdges: treeEdges.map(e => [...e])
                }));

                return this._buildResult({
                    path,
                    visited,
                    success: true,
                    parent,
                    treeEdges,
                    steps
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
