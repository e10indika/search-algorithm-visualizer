/**
 * Priority Queue implementation for weighted search algorithms
 */

export class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    push(priority, item) {
        this.heap.push({ priority, item });
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop().item;

        const result = this.heap[0].item;
        this.heap[0] = this.heap.pop();
        this._bubbleDown(0);
        return result;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].priority >= this.heap[parentIndex].priority) break;
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }

    _bubbleDown(index) {
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }
            if (smallest === index) break;

            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}

/**
 * Dijkstra's Shortest Path Algorithm
 */

import { BaseSearchAlgorithm, SearchStep } from './base.js';

export class DijkstraSearch extends BaseSearchAlgorithm {
    /**
     * Execute Dijkstra's algorithm
     * @param {string} start - Starting node
     * @param {string} goal - Goal node
     * @param {object} options - weights: edge weights {(node1, node2): weight}
     * @returns {SearchResult} Search result with shortest path
     */
    search(start, goal, options = {}) {
        const weights = options.weights || {};

        const { visited, visitedSet, parent, treeEdges } = this._initializeSearch(start);
        const distances = { [start]: 0 };
        const pq = new PriorityQueue();
        pq.push(0, [start, [start]]);

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
            distances: { ...distances }
        }));
        stepNumber++;

        while (!pq.isEmpty()) {
            const [current, path] = pq.pop();
            const currentDist = distances[current];

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
                distances: { ...distances },
                current_distance: currentDist
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
                    distances: { ...distances },
                    distance: currentDist
                }));

                return this._buildResult({
                    path,
                    visited,
                    success: true,
                    parent,
                    treeEdges,
                    distance: currentDist,
                    steps
                });
            }

            const neighbors = this.graph[current] || [];
            for (const neighbor of neighbors) {
                if (!visitedSet.has(neighbor)) {
                    const weight = weights[`${current},${neighbor}`] || weights[`${neighbor},${current}`] || 1;
                    const newDist = currentDist + weight;

                    if (!(neighbor in distances) || newDist < distances[neighbor]) {
                        distances[neighbor] = newDist;
                        if (!(neighbor in parent)) {
                            parent[neighbor] = current;
                            treeEdges.push([current, neighbor]);
                        }
                        pq.push(newDist, [neighbor, [...path, neighbor]]);

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
                            distances: { ...distances },
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

