/**
 * Search Controller
 * Coordinates graph visualization, tree generation, and search execution
 */

import { GraphBuilder } from './graph-builder.js';
import { TreeVisualizer } from './tree-visualizer.js';
import { domRefs } from './dom.js';

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
        this.treeVisualizer.buildTree(graphData, this.startNode, maxDepth);

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

        // Get selected algorithm
        const algorithm = domRefs.graphAlgorithmSelect?.value || 'bfs';
        const visualizationMode = domRefs.visualizationModeSelect?.value || 'auto';

        // TODO: Implement actual search algorithm execution
        // This will be connected to the backend API
        console.log(`Algorithm: ${algorithm}, Mode: ${visualizationMode}`);
        alert(`Search functionality will be implemented next.\nAlgorithm: ${algorithm}\nStart: ${this.startNode}\nGoals: ${this.goalNodes.join(', ')}`);
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
        if (domRefs.traversalList) {
            domRefs.traversalList.textContent = results.traversal?.join(' → ') || 'N/A';
        }
        if (domRefs.pathList) {
            domRefs.pathList.textContent = results.path?.join(' → ') || 'No path found';
        }
        if (domRefs.statsList) {
            const stats = [
                `Nodes Explored: ${results.nodesExplored || 0}`,
                `Path Length: ${results.pathLength || 0}`,
                `Time: ${results.executionTime || 0}ms`
            ].join(' | ');
            domRefs.statsList.textContent = stats;
        }
    }
}