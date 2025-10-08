/**
 * Depth-First Search Algorithm
 * JavaScript implementation
 */

import { BaseSearchAlgorithm, SearchStep } from './base.js';

export class DepthFirstSearch extends BaseSearchAlgorithm {
    /**
     * Execute DFS algorithm
     * @param {string} start - Starting node
     * @param {string} goal - Goal node
     * @param {object} options - Additional options
     * @returns {SearchResult} Search result with path and exploration details
     */
    search(start, goal, options = {}) {
        const { visited, visitedSet, parent, treeEdges } = this._initializeSearch(start);

        const stack = [[start, [start]]];
        const steps = [];
        let stepNumber = 0;

        // Track opened (frontier) and closed (visited) lists
        const opened = [start];
        const closed = [];

        // Initial step - add start node to frontier
        steps.push(new SearchStep({
            stepNumber,
            currentNode: start,
            action: 'initialize',
            pathSoFar: [start],
            visited: [],
            frontier: [...opened],
            parent: { ...parent },
            treeEdges: []
        }));
        stepNumber++;

        while (stack.length > 0) {
            const [current, path] = stack.pop();

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

            // Step: visiting current node (node moved from opened to closed)
            steps.push(new SearchStep({
                stepNumber,
                currentNode: current,
                action: 'visit',
                pathSoFar: [...path],
                visited: [...closed],
                frontier: [...opened],
                parent: { ...parent },
                treeEdges: treeEdges.map(e => [...e])
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
            for (let i = neighbors.length - 1; i >= 0; i--) {
                const neighbor = neighbors[i];
                if (!visitedSet.has(neighbor)) {
                    if (!(neighbor in parent)) {
                        parent[neighbor] = current;
                        treeEdges.push([current, neighbor]);
                    }
                    stack.push([neighbor, [...path, neighbor]]);

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
                        treeEdges: treeEdges.map(e => [...e])
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

