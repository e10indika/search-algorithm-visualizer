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
        const pq = new PriorityQueue();
        pq.push(fScore[start], [start, [start]]);

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
            g_score: { ...gScore },
            f_score: { ...fScore }
        }));
        stepNumber++;

        while (!pq.isEmpty()) {
            const [current, path] = pq.pop();
            const currentF = fScore[current];

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
                g_score: { ...gScore },
                f_score: { ...fScore },
                current_g: gScore[current],
                current_f: currentF
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
                    treeEdges: treeEdges.map(e => [...e]),
                    g_score: { ...gScore },
                    f_score: { ...fScore },
                    cost: gScore[current]
                }));

                return this._buildResult({
                    path,
                    visited,
                    success: true,
                    parent,
                    treeEdges,
                    cost: gScore[current],
                    steps
                });
            }

            const neighbors = this.graph[current] || [];
            for (const neighbor of neighbors) {
                if (!visitedSet.has(neighbor)) {
                    const weight = weights[`${current},${neighbor}`] || weights[`${neighbor},${current}`] || 1;
                    const tentativeG = gScore[current] + weight;

                    if (!(neighbor in gScore) || tentativeG < gScore[neighbor]) {
                        gScore[neighbor] = tentativeG;
                        const f = tentativeG + (heuristic[neighbor] || 0);
                        fScore[neighbor] = f;

                        if (!(neighbor in parent)) {
                            parent[neighbor] = current;
                            treeEdges.push([current, neighbor]);
                        }
                        pq.push(f, [neighbor, [...path, neighbor]]);

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
                            g_score: { ...gScore },
                            f_score: { ...fScore },
                            edge_weight: weight
                        }));
                        stepNumber++;
                    }
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

