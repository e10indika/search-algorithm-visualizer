/**
 * A* Search Algorithm
 * JavaScript implementation
 */

import { BaseSearchAlgorithm, SearchStep } from './base.js';
import { PriorityQueue } from './dijkstra.js';

export class AStarSearch extends BaseSearchAlgorithm {
    /**
     * Execute A* algorithm
     * @param {string} start - Starting node
     * @param {string} goal - Goal node
     * @param {object} options - weights and heuristic values
     * @returns {SearchResult} Search result with optimal path
     */
    search(start, goal, options = {}) {
        const weights = options.weights || {};
        const heuristic = options.heuristic || {};

        const { visited, visitedSet, parent, treeEdges } = this._initializeSearch(start);
        const gScore = { [start]: 0 };
        const fScore = { [start]: heuristic[start] || 0 };

        // Start node is at depth 0
        const startId = `${start}-0`;

        // Priority queue stores [f_score, node_label, node_id, path, depth]
        const pq = new PriorityQueue();
        pq.push(fScore[start], [start, startId, [start], 0]);

        const steps = [];
        let stepNumber = 0;

        // Track opened/closed with node IDs
        const openedIds = [startId];
        const closedIds = [];

        while (!pq.isEmpty()) {
            const [current, currentId, path, depth] = pq.pop();
            const currentG = gScore[current];
            const currentF = fScore[current];

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
                    const weight = weights[`${current},${neighbor}`] || weights[`${neighbor},${current}`] || 1;
                    const tentativeG = currentG + weight;

                    if (!(neighbor in gScore) || tentativeG < gScore[neighbor]) {
                        gScore[neighbor] = tentativeG;
                        const f = tentativeG + (heuristic[neighbor] || 0);
                        fScore[neighbor] = f;

                        visitedSet.add(neighbor);
                        parent[neighbor] = current;
                        treeEdges.push([current, neighbor]);

                        // Generate node ID with path format: parentPath#node-depth
                        const pathStr = path.join('');
                        const neighborId = `${pathStr}#${neighbor}-${neighborDepth}`;
                        pq.push(f, [neighbor, neighborId, [...path, neighbor], neighborDepth]);

                        // Add to opened list
                        openedIds.push(neighborId);
                    }
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
                g_score: { ...gScore },
                f_score: { ...fScore },
                current_g: currentG,
                current_f: currentF
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
                    g_score: { ...gScore },
                    f_score: { ...fScore },
                    cost: currentG
                }));

                return this._buildResult({
                    path,
                    visited,
                    success: true,
                    parent,
                    treeEdges,
                    cost: currentG,
                    costs: gScore,
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
            costs: gScore,
            steps
        });
    }
}
