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
        const pq = new PriorityQueue();
        pq.push(heuristic[start] || 0, [start, [start]]);

        const steps = [];
        let stepNumber = 0;

        // Track opened (frontier) and closed (visited) lists
        const opened = [start];
        const closed = [];

        // Initial step
        steps.push(new SearchStep({
            stepNumber,
            currentNode: start,
            action: 'initialize',
            pathSoFar: [start],
            visited: [],
            frontier: [...opened],
            parent: { ...parent },
            treeEdges: [],
            heuristic_value: heuristic[start] || 0
        }));
        stepNumber++;

        while (!pq.isEmpty()) {
            const [current, path] = pq.pop();

            if (visitedSet.has(current)) {
                continue;
            }

            // Remove current from opened list and add to closed list
            const openedIndex = opened.indexOf(current);
            if (openedIndex !== -1) {
                opened.splice(openedIndex, 1);
            }
            if (!closed.includes(current)) {
                closed.push(current);
            }

            visitedSet.add(current);
            visited.push(current);

            // Step: visiting current node
            steps.push(new SearchStep({
                stepNumber,
                currentNode: current,
                action: 'visit',
                pathSoFar: [...path],
                visited: [...closed],
                frontier: [...opened],
                parent: { ...parent },
                treeEdges: treeEdges.map(e => [...e]),
                heuristic_value: heuristic[current] || 0
            }));
            stepNumber++;

            if (current === goal) {
                // Step: goal found
                steps.push(new SearchStep({
                    stepNumber,
                    currentNode: current,
                    action: 'goal_found',
                    pathSoFar: [...path],
                    visited: [...closed],
                    frontier: [...opened],
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

            const neighbors = this.graph[current] || [];
            for (const neighbor of neighbors) {
                if (!visitedSet.has(neighbor)) {
                    const h = heuristic[neighbor] || 0;

                    if (!(neighbor in parent)) {
                        parent[neighbor] = current;
                        treeEdges.push([current, neighbor]);
                    }
                    pq.push(h, [neighbor, [...path, neighbor]]);

                    // Add neighbor to opened list
                    if (!opened.includes(neighbor)) {
                        opened.push(neighbor);
                    }

                    // Step: add neighbor to frontier
                    steps.push(new SearchStep({
                        stepNumber,
                        currentNode: neighbor,
                        action: 'add_to_frontier',
                        pathSoFar: [...path, neighbor],
                        visited: [...closed],
                        frontier: [...opened],
                        parent: { ...parent },
                        treeEdges: treeEdges.map(e => [...e]),
                        heuristic_value: h
                    }));
                    stepNumber++;
                }
            }
        }

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

