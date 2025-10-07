/**
 * Search Controller
 * Coordinates graph visualization, tree generation, and search execution
 */

import { GraphBuilder } from './graph-builder.js';
import { TreeVisualizer } from './tree-visualizer.js';
import { domRefs } from './dom.js';
import { APIService } from './api.js';

export class SearchController {
    static graphBuilder = null;
    static treeVisualizer = null;
    static currentGraphData = null;
    static startNode = null;
    static goalNodes = [];

    /**
     * Draw graph and state space tree
     */
    static drawGraph(graphData) {
        console.log('🎨 Drawing graph and state space tree...', graphData);

        // Parse goal nodes (support multiple goals separated by comma)
        const goalInput = graphData.goal || '';
        this.goalNodes = goalInput.split(',').map(g => g.trim()).filter(g => g);
        this.startNode = graphData.start;
        this.currentGraphData = graphData;

        // Validate inputs
        if (!this.startNode) {
            alert('Please specify a start node');
            return;
        }

        if (this.goalNodes.length === 0) {
            alert('Please specify at least one goal node');
            return;
        }

        // Validate that start and goal nodes exist in graph
        const graphNodes = Object.keys(graphData.graph);
        if (!graphNodes.includes(this.startNode)) {
            alert(`Start node "${this.startNode}" not found in graph`);
            return;
        }

        for (const goal of this.goalNodes) {
            if (!graphNodes.includes(goal)) {
                alert(`Goal node "${goal}" not found in graph`);
                return;
            }
        }

        // Build graph visualization
        if (!this.graphBuilder) {
            this.graphBuilder = new GraphBuilder(domRefs.graphContainer);
        }
        this.graphBuilder.buildGraph(graphData, this.startNode, this.goalNodes);

        // Build state space tree
        const maxDepth = parseInt(domRefs.treeDepthInput?.value || '4');
        if (!this.treeVisualizer) {
            this.treeVisualizer = new TreeVisualizer(domRefs.stateSpaceTreeContainer);
        }
        this.treeVisualizer.buildTree(graphData, this.startNode, maxDepth, this.goalNodes);

        // Clear previous results
        this.clearResults();

        console.log('✅ Graph and tree drawn successfully');
    }

    /**
     * Run search algorithm
     */
    static async runSearch() {
        if (!this.currentGraphData || !this.startNode || this.goalNodes.length === 0) {
            alert('Please draw a graph first');
            return;
        }

        console.log('🔍 Starting search...');

        // Get selected algorithm and settings
        const algorithm = domRefs.graphAlgorithmSelect?.value || 'bfs';
        const visualizationMode = domRefs.visualizationModeSelect?.value || 'auto';
        const animationSpeed = parseInt(domRefs.animationSpeedSelect?.value || '500');

        // Clear previous results
        this.clearResults();
        this.clearNodeLists();

        // Prepare request data
        const requestData = {
            algorithm: algorithm,
            graph: this.currentGraphData.graph,
            start: this.startNode,
            goal: this.goalNodes[0], // Use first goal for single-goal algorithms
            weights: this.currentGraphData.weights || {},
            heuristic: this.currentGraphData.heuristic || {}
        };

        try {
            // Show loading message
            if (domRefs.traversalList) {
                domRefs.traversalList.textContent = 'Running search...';
            }

            // Call backend API
            console.log('📡 Calling backend API with:', requestData);
            const result = await APIService.searchGraph(requestData);
            console.log('✅ Search completed:', result);

            // Check if search was successful
            if (result.error) {
                alert(`Search failed: ${result.error}`);
                if (domRefs.traversalList) {
                    domRefs.traversalList.textContent = `Error: ${result.error}`;
                }
                return;
            }

            // Display results
            this.displayResults(result);

            // Animate the search if in auto mode
            if (visualizationMode === 'auto') {
                await this.animateSearch(result, animationSpeed);
            } else {
                // Manual mode - just highlight final path
                this.highlightPath(result.path);
            }

        } catch (error) {
            console.error('❌ Search error:', error);
            alert(`Search failed: ${error.message}\n\nMake sure the backend server is running on port 5001.`);
            if (domRefs.traversalList) {
                domRefs.traversalList.textContent = `Error: ${error.message}`;
            }
        }
    }

    /**
     * Animate the search process
     */
    static async animateSearch(result, speed) {
        console.log('🎬 Starting animation...');

        const visited = result.visited || result.traversal || [];
        const path = result.path || [];

        // Animate visited nodes
        for (let i = 0; i < visited.length; i++) {
            const node = visited[i];

            // Update opened/closed lists
            const openedNodes = visited.slice(i);
            const closedNodes = visited.slice(0, i + 1);
            this.updateOpenedNodes(openedNodes);
            this.updateClosedNodes(closedNodes);

            // Highlight node in graph
            if (this.graphBuilder && node !== this.startNode && !this.goalNodes.includes(node)) {
                this.graphBuilder.updateNode(node, 'node-circle visited');
            }

            // Highlight node in tree
            if (this.treeVisualizer) {
                this.treeVisualizer.highlightNodeByLabel(node);
            }

            await this.sleep(speed);
        }

        // Highlight the final path
        if (path.length > 0) {
            await this.sleep(500); // Pause before showing path
            console.log('🎯 Highlighting path:', path);

            for (const node of path) {
                if (this.graphBuilder && node !== this.startNode && !this.goalNodes.includes(node)) {
                    this.graphBuilder.updateNode(node, 'node-circle path');
                }
                await this.sleep(speed / 2);
            }

            // Highlight full path in graph
            if (this.graphBuilder) {
                this.graphBuilder.highlightPath(path);
            }

            console.log('✅ Animation complete!');
        }
    }

    /**
     * Highlight the final path without animation
     */
    static highlightPath(path) {
        if (!path || path.length === 0) return;

        path.forEach(node => {
            if (this.graphBuilder && node !== this.startNode && !this.goalNodes.includes(node)) {
                this.graphBuilder.updateNode(node, 'node-circle path');
            }
        });

        if (this.graphBuilder) {
            this.graphBuilder.highlightPath(path);
        }
    }

    /**
     * Sleep utility for animation
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear graph and tree
     */
    static clearGraph() {
        console.log('🧹 Clearing visualizations...');

        if (this.graphBuilder) {
            this.graphBuilder.clear();
        }

        if (this.treeVisualizer) {
            this.treeVisualizer.clear();
        }

        this.clearResults();
        this.clearNodeLists();

        this.currentGraphData = null;
        this.startNode = null;
        this.goalNodes = [];

        console.log('✅ Cleared');
    }

    /**
     * Clear results section
     */
    static clearResults() {
        if (domRefs.traversalList) {
            domRefs.traversalList.textContent = '';
        }
        if (domRefs.pathList) {
            domRefs.pathList.textContent = '';
        }
        if (domRefs.statsList) {
            domRefs.statsList.textContent = '';
        }
        if (domRefs.graphStats) {
            domRefs.graphStats.innerHTML = '';
        }
    }

    /**
     * Clear node lists
     */
    static clearNodeLists() {
        if (domRefs.openedListGraph) {
            domRefs.openedListGraph.innerHTML = '';
        }
        if (domRefs.closedListGraph) {
            domRefs.closedListGraph.innerHTML = '';
        }
        if (domRefs.openedListTree) {
            domRefs.openedListTree.innerHTML = '';
        }
        if (domRefs.closedListTree) {
            domRefs.closedListTree.innerHTML = '';
        }
    }

    /**
     * Update opened nodes list
     */
    static updateOpenedNodes(nodes) {
        if (domRefs.openedListGraph) {
            domRefs.openedListGraph.innerHTML = nodes.map(n => `<li>${n}</li>`).join('');
        }
        if (domRefs.openedListTree) {
            domRefs.openedListTree.innerHTML = nodes.map(n => `<li>${n}</li>`).join('');
        }
    }

    /**
     * Update closed nodes list
     */
    static updateClosedNodes(nodes) {
        if (domRefs.closedListGraph) {
            domRefs.closedListGraph.innerHTML = nodes.map(n => `<li>${n}</li>`).join('');
        }
        if (domRefs.closedListTree) {
            domRefs.closedListTree.innerHTML = nodes.map(n => `<li>${n}</li>`).join('');
        }
    }

    /**
     * Display search results
     */
    static displayResults(results) {
        // Use 'visited' or 'traversal' depending on what backend returns
        const traversal = results.visited || results.traversal || [];
        const path = results.path || [];

        if (domRefs.traversalList) {
            domRefs.traversalList.textContent = traversal.join(' → ') || 'N/A';
        }
        if (domRefs.pathList) {
            if (path.length > 0) {
                domRefs.pathList.textContent = path.join(' → ');
            } else {
                domRefs.pathList.textContent = 'No path found';
            }
        }
        if (domRefs.statsList) {
            const nodesExplored = traversal.length || 0;
            const pathLength = path.length > 0 ? path.length - 1 : 0; // edges count
            const stats = [
                `Nodes Explored: ${nodesExplored}`,
                `Path Length: ${pathLength}`,
                `Algorithm: ${results.algorithm || 'N/A'}`
            ].join(' | ');
            domRefs.statsList.textContent = stats;
        }
    }
}