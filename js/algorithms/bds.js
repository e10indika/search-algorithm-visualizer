/**
 * Bidirectional Search Algorithm
 * Performs simultaneous BFS from both start and goal nodes
 * Finds the shortest path by meeting in the middle
 */

import { BaseSearchAlgorithm, SearchStep } from './base.js';

export class BidirectionalSearch extends BaseSearchAlgorithm {
    /**
     * Execute Bidirectional Search algorithm
     * @param {string} start - Starting node
     * @param {string} goal - Goal node
     * @param {object} options - Additional options
     * @returns {SearchResult} Search result with path and exploration details
     */
    search(start, goal, options = {}) {
        const { visited, visitedSet, parent, treeEdges } = this._initializeSearch(start);

        // Initialize forward search (from start)
        const startId = `${start}-0`;
        const forwardQueue = [[start, startId, [start], 0]];
        const forwardVisited = new Set([start]);
        const forwardParent = { [start]: null };
        const forwardIds = [startId];
        const forwardClosed = [];

        // Initialize backward search (from goal)
        const goalId = `${goal}-0`;
        const backwardQueue = [[goal, goalId, [goal], 0]];
        const backwardVisited = new Set([goal]);
        const backwardParent = { [goal]: null };
        const backwardIds = [goalId];
        const backwardClosed = [];

        const steps = [];
        let stepNumber = 0;
        let meetingNode = null;

        // Track all node IDs across both searches for visualization
        const allOpenedIds = new Set([startId, goalId]);
        const allClosedIds = new Set();

        // Track backward search node labels for tree highlighting
        const backwardNodeLabels = new Set([goal]);

        // Initial step
        steps.push(new SearchStep({
            stepNumber,
            currentNode: start,
            action: 'initialize',
            pathSoFar: [start],
            visited: [],
            frontier: [startId, goalId],
            parent: { ...forwardParent },
            treeEdges: [],
            direction: 'both',
            backwardLabels: Array.from(backwardNodeLabels)
        }));
        stepNumber++;

        // Bidirectional search main loop
        while (forwardQueue.length > 0 && backwardQueue.length > 0) {
            // Forward step
            if (forwardQueue.length > 0) {
                const [current, currentId, path, depth] = forwardQueue.shift();
                this.nodesConsidered++;

                // Move from opened to closed
                const idx = forwardIds.indexOf(currentId);
                if (idx !== -1) forwardIds.splice(idx, 1);
                if (!forwardClosed.includes(currentId)) forwardClosed.push(currentId);

                allOpenedIds.delete(currentId);
                allClosedIds.add(currentId);

                // Add to global visited
                if (!visited.includes(current)) visited.push(current);

                // Check if we met the backward search
                if (backwardVisited.has(current)) {
                    meetingNode = current;

                    steps.push(new SearchStep({
                        stepNumber,
                        currentNode: current,
                        action: 'meeting_found',
                        pathSoFar: [...path],
                        visited: Array.from(allClosedIds),
                        frontier: Array.from(allOpenedIds),
                        parent: { ...forwardParent, ...backwardParent },
                        treeEdges: treeEdges.map(e => [...e]),
                        direction: 'forward',
                        backwardLabels: Array.from(backwardNodeLabels)
                    }));

                    // Construct the full path
                    const fullPath = this._constructBidirectionalPath(
                        meetingNode,
                        forwardParent,
                        backwardParent,
                        start,
                        goal
                    );

                    return this._buildResult({
                        path: fullPath,
                        visited,
                        success: true,
                        parent: { ...forwardParent, ...backwardParent },
                        treeEdges,
                        steps,
                        meetingNode
                    });
                }

                // Expand forward neighbors
                const neighborDepth = depth + 1;
                const neighbors = this.graph[current] || [];

                for (const neighbor of neighbors) {
                    if (!forwardVisited.has(neighbor)) {
                        forwardVisited.add(neighbor);
                        forwardParent[neighbor] = current;
                        treeEdges.push([current, neighbor]);

                        // Generate node ID compatible with tree visualization
                        const pathStr = path.join('');
                        const neighborId = `${pathStr}#${neighbor}-${neighborDepth}`;
                        forwardQueue.push([neighbor, neighborId, [...path, neighbor], neighborDepth]);
                        forwardIds.push(neighborId);
                        allOpenedIds.add(neighborId);
                    }
                }

                steps.push(new SearchStep({
                    stepNumber,
                    currentNode: current,
                    action: 'visit',
                    pathSoFar: [...path],
                    visited: Array.from(allClosedIds),
                    frontier: Array.from(allOpenedIds),
                    parent: { ...forwardParent, ...backwardParent },
                    treeEdges: treeEdges.map(e => [...e]),
                    direction: 'forward',
                    backwardLabels: Array.from(backwardNodeLabels)
                }));
                stepNumber++;
            }

            // Backward step
            if (backwardQueue.length > 0 && !meetingNode) {
                const [current, currentId, path, depth] = backwardQueue.shift();
                this.nodesConsidered++;

                // Move from opened to closed
                const idx = backwardIds.indexOf(currentId);
                if (idx !== -1) backwardIds.splice(idx, 1);
                if (!backwardClosed.includes(currentId)) backwardClosed.push(currentId);

                allOpenedIds.delete(currentId);
                allClosedIds.add(currentId);

                // Add to global visited
                if (!visited.includes(current)) visited.push(current);

                // Check if we met the forward search
                if (forwardVisited.has(current)) {
                    meetingNode = current;

                    steps.push(new SearchStep({
                        stepNumber,
                        currentNode: current,
                        action: 'meeting_found',
                        pathSoFar: [...path],
                        visited: Array.from(allClosedIds),
                        frontier: Array.from(allOpenedIds),
                        parent: { ...forwardParent, ...backwardParent },
                        treeEdges: treeEdges.map(e => [...e]),
                        direction: 'backward',
                        backwardLabels: Array.from(backwardNodeLabels)
                    }));

                    // Construct the full path
                    const fullPath = this._constructBidirectionalPath(
                        meetingNode,
                        forwardParent,
                        backwardParent,
                        start,
                        goal
                    );

                    return this._buildResult({
                        path: fullPath,
                        visited,
                        success: true,
                        parent: { ...forwardParent, ...backwardParent },
                        treeEdges,
                        steps,
                        meetingNode
                    });
                }

                // Expand backward neighbors (reverse direction)
                const neighborDepth = depth + 1;

                // For backward search, we need to look at nodes that have current as a neighbor
                const neighbors = this._getIncomingNeighbors(current);

                for (const neighbor of neighbors) {
                    if (!backwardVisited.has(neighbor)) {
                        backwardVisited.add(neighbor);
                        backwardParent[neighbor] = current;
                        backwardNodeLabels.add(neighbor); // Track backward labels
                        treeEdges.push([neighbor, current]); // Reverse edge for backward search

                        // Generate node ID compatible with tree visualization
                        const pathStr = path.join('');
                        const neighborId = `${pathStr}#${neighbor}-${neighborDepth}`;
                        backwardQueue.push([neighbor, neighborId, [...path, neighbor], neighborDepth]);
                        backwardIds.push(neighborId);
                        allOpenedIds.add(neighborId);
                    }
                }

                steps.push(new SearchStep({
                    stepNumber,
                    currentNode: current,
                    action: 'visit',
                    pathSoFar: [...path],
                    visited: Array.from(allClosedIds),
                    frontier: Array.from(allOpenedIds),
                    parent: { ...forwardParent, ...backwardParent },
                    treeEdges: treeEdges.map(e => [...e]),
                    direction: 'backward',
                    backwardLabels: Array.from(backwardNodeLabels)
                }));
                stepNumber++;
            }
        }

        // No path found
        return this._buildResult({
            path: [],
            visited,
            success: false,
            parent: { ...forwardParent, ...backwardParent },
            treeEdges,
            steps
        });
    }

    /**
     * Get incoming neighbors (nodes that point to the given node)
     * Used for backward search in directed graphs
     */
    _getIncomingNeighbors(node) {
        const incoming = [];
        for (const [source, targets] of Object.entries(this.graph)) {
            if (targets && targets.includes(node)) {
                incoming.push(source);
            }
        }
        return incoming;
    }

    /**
     * Construct the full path from start to goal using both forward and backward parent maps
     */
    _constructBidirectionalPath(meetingNode, forwardParent, backwardParent, start, goal) {
        // Build forward path (start to meeting node)
        const forwardPath = [];
        let current = meetingNode;
        while (current !== null) {
            forwardPath.unshift(current);
            current = forwardParent[current];
        }

        // Build backward path (meeting node to goal)
        const backwardPath = [];
        current = backwardParent[meetingNode]; // Skip meeting node to avoid duplication
        while (current !== null) {
            backwardPath.push(current);
            current = backwardParent[current];
        }

        // Combine paths
        return [...forwardPath, ...backwardPath];
    }
}
