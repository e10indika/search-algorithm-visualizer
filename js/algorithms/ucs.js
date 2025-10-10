/**
 * Uniform Cost Search (UCS) Algorithm
 * Finds the least-cost path by expanding nodes in order of path cost
 */

import { BaseSearchAlgorithm, SearchStep } from './base.js';
import { PriorityQueue } from './dijkstra.js';

export class UniformCostSearch extends BaseSearchAlgorithm {
    /**
     * Execute UCS algorithm
     * @param {string} start - Starting node
     * @param {string} goal - Goal node
     * @param {object} options - weights: edge weights {(node1, node2): weight}
     * @returns {SearchResult} Search result with lowest-cost path
     */
    search(start, goal, options = {}) {
        const weights = options.weights || {};

        const { visited, visitedSet, parent, treeEdges } = this._initializeSearch(start);
        const costs = { [start]: 0 };

        // Start node is at depth 0
        const startId = `${start}-0`;

        // Priority queue stores [cost, node_label, node_id, path, depth]
        const pq = new PriorityQueue();
        pq.push(0, [start, startId, [start], 0]);

        const steps = [];
        let stepNumber = 0;

        // Track opened/closed with node IDs
        const openedIds = [startId];
        const closedIds = [];

        while (!pq.isEmpty()) {
            const [current, currentId, path, depth] = pq.pop();
            const currentCost = costs[current];

            // Skip if we've already visited this node with a better cost
            if (visitedSet.has(current)) {
                continue;
            }

            // Mark as visited now
            visitedSet.add(current);

            // Move current from opened to closed
            const openedIndex = openedIds.indexOf(currentId);
            if (openedIndex !== -1) {
                openedIds.splice(openedIndex, 1);
            }
            if (!closedIds.includes(currentId)) {
                closedIds.push(currentId);
            }

            // Add current to visited list if not already there
            if (!visited.includes(current)) {
                visited.push(current);
            }

            // Check if goal found (check AFTER marking as visited)
            if (current === goal) {
                // Update frontier before recording final step
                const frontierNodeIds = [...openedIds];

                steps.push(new SearchStep({
                    stepNumber,
                    currentNode: current,
                    action: 'goal_found',
                    pathSoFar: [...path],
                    visited: [...closedIds],
                    frontier: frontierNodeIds,
                    parent: { ...parent },
                    treeEdges: treeEdges.map(e => [...e]),
                    costs: { ...costs },
                    total_cost: currentCost
                }));

                return this._buildResult({
                    path,
                    visited,
                    success: true,
                    parent,
                    treeEdges,
                    total_cost: currentCost,
                    costs,
                    steps
                });
            }

            // Explore neighbors at depth + 1
            const neighborDepth = depth + 1;
            const neighbors = this.graph[current] || [];

            for (const neighbor of neighbors) {
                const weight = weights[`${current},${neighbor}`] || weights[`${neighbor},${current}`] || 1;
                const newCost = currentCost + weight;

                // Add to queue if not visited OR if we found a cheaper path
                if (!visitedSet.has(neighbor) && (!(neighbor in costs) || newCost < costs[neighbor])) {
                    costs[neighbor] = newCost;
                    parent[neighbor] = current;

                    // Only add tree edge if this is a new or better path
                    const existingEdge = treeEdges.findIndex(e => e[1] === neighbor);
                    if (existingEdge !== -1) {
                        treeEdges[existingEdge] = [current, neighbor];
                    } else {
                        treeEdges.push([current, neighbor]);
                    }

                    // Generate node ID with path format: parentPath#node-depth
                    const pathStr = path.join('');
                    const neighborId = `${pathStr}#${neighbor}-${neighborDepth}`;

                    // Store cost with BOTH the node label and the full node ID
                    costs[neighborId] = newCost;

                    pq.push(newCost, [neighbor, neighborId, [...path, neighbor], neighborDepth]);

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
                costs: { ...costs },
                current_cost: currentCost
            }));
            stepNumber++;
        }

        // Goal not found
        return this._buildResult({
            path: [],
            visited,
            success: false,
            parent,
            treeEdges,
            costs,
            steps
        });
    }
}
