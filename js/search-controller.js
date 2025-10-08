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
    static currentStepIndex = 0;
    static searchResult = null;
    static isManualMode = false;

    static drawGraph(graphData) {
        this.goalNodes = (graphData.goal || '').split(',').map(g => g.trim()).filter(g => g);
        this.startNode = graphData.start;
        this.currentGraphData = graphData;

        if (!this.validateGraphData()) return;

        this.renderGraphVisualization(graphData);
        this.renderTreeVisualization(graphData);
        this.clearResults();
    }

    static validateGraphData() {
        if (!this.startNode) {
            alert('Please specify a start node');
            return false;
        }

        if (this.goalNodes.length === 0) {
            alert('Please specify at least one goal node');
            return false;
        }

        const graphNodes = Object.keys(this.currentGraphData.graph);
        if (!graphNodes.includes(this.startNode)) {
            alert(`Start node "${this.startNode}" not found in graph`);
            return false;
        }

        for (const goal of this.goalNodes) {
            if (!graphNodes.includes(goal)) {
                alert(`Goal node "${goal}" not found in graph`);
                return false;
            }
        }

        return true;
    }

    static renderGraphVisualization(graphData) {
        if (!this.graphBuilder) {
            this.graphBuilder = new GraphBuilder(domRefs.graphContainer);
        }
        this.graphBuilder.buildGraph(graphData, this.startNode, this.goalNodes);
    }

    static renderTreeVisualization(graphData) {
        const maxDepth = parseInt(domRefs.treeDepthInput?.value || '4');
        if (!this.treeVisualizer) {
            this.treeVisualizer = new TreeVisualizer(domRefs.stateSpaceTreeContainer);
        }

        const options = {
            weights: graphData.weights || {},
            heuristic: graphData.heuristic || {},
            costs: this.searchResult?.steps?.[this.searchResult.steps.length - 1]?.extra?.costs || {}
        };

        this.treeVisualizer.buildTree(graphData, this.startNode, maxDepth, this.goalNodes, options);
    }

    static async runSearch() {
        if (!this.currentGraphData || !this.startNode || this.goalNodes.length === 0) {
            alert('Please draw a graph first');
            return;
        }

        const algorithm = domRefs.graphAlgorithmSelect?.value || 'bfs';
        const visualizationMode = domRefs.visualizationModeSelect?.value || 'auto';
        const animationSpeed = parseInt(domRefs.animationSpeedSelect?.value || '500');

        // Reset visual state before new search
        this.resetVisualizationState();
        this.clearResults();
        this.clearNodeLists();

        const requestData = {
            algorithm,
            graph: this.currentGraphData.graph,
            start: this.startNode,
            goal: this.goalNodes[0],
            weights: this.currentGraphData.weights || {},
            heuristic: this.currentGraphData.heuristic || {}
        };

        try {
            if (domRefs.traversalList) domRefs.traversalList.textContent = 'Running search...';

            const result = await APIService.searchGraph(requestData);

            if (result.error) {
                alert(`Search failed: ${result.error}`);
                if (domRefs.traversalList) domRefs.traversalList.textContent = `Error: ${result.error}`;
                return;
            }

            this.searchResult = result;
            this.currentStepIndex = 0;
            this.isManualMode = visualizationMode === 'manual';

            this.displayResults(result);

            if (visualizationMode === 'auto') {
                await this.animateSearch(result, animationSpeed);
            } else {
                this.setupManualMode();
            }
        } catch (error) {
            console.error('Search error:', error);
            alert(`Search failed: ${error.message}`);
            if (domRefs.traversalList) domRefs.traversalList.textContent = `Error: ${error.message}`;
        }
    }

    static setupManualMode() {
        const controlsContainer = this.getOrCreateManualControlsContainer();
        this.renderManualControls(controlsContainer);
        this.executeStep(0);
    }

    static getOrCreateManualControlsContainer() {
        let container = document.getElementById('manual-step-controls');
        if (!container) {
            container = document.createElement('div');
            container.id = 'manual-step-controls';
            container.className = 'step-controls-container';
            document.body.appendChild(container);
        }
        return container;
    }

    static renderManualControls(container) {
        container.innerHTML = `
            <button id="prev-step-btn">⏮ Previous</button>
            <span id="step-counter">
                Step 0 / ${this.searchResult.steps.length}
            </span>
            <button id="next-step-btn">Next ⏭</button>
            <button id="play-auto-btn">▶ Play Auto</button>
            <button id="reset-viz-btn">🔄 Reset</button>
        `;

        document.getElementById('prev-step-btn').addEventListener('click', () => this.previousStep());
        document.getElementById('next-step-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('play-auto-btn').addEventListener('click', () => this.playAutoFromCurrent());
        document.getElementById('reset-viz-btn').addEventListener('click', () => this.resetVisualization());
    }

    static executeStep(stepIndex) {
        if (!this.searchResult?.steps || stepIndex < 0 || stepIndex >= this.searchResult.steps.length) return;

        const step = this.searchResult.steps[stepIndex];
        const { current_node: node, frontier: openedNodes = [], visited: closedNodes = [], action } = step;

        this.updateOpenedNodes(openedNodes);
        this.updateClosedNodes(closedNodes);

        if (this.treeVisualizer) {
            this.treeVisualizer.highlightOpenedNodes(openedNodes);
            this.treeVisualizer.highlightClosedNodes(closedNodes);
        }

        if (this.graphBuilder && action === 'visit' && node !== this.startNode && !this.goalNodes.includes(node)) {
            this.graphBuilder.updateNode(node, 'node-circle visited');
        }

        const stepCounter = document.getElementById('step-counter');
        if (stepCounter) stepCounter.textContent = `Step ${stepIndex + 1} / ${this.searchResult.steps.length}`;

        if (action === 'goal_found') {
            const path = this.searchResult.path || [];
            this.graphBuilder?.highlightPath(path);
            this.treeVisualizer?.highlightPath(path);
        }
    }

    static nextStep() {
        if (this.currentStepIndex < this.searchResult.steps.length - 1) {
            this.executeStep(++this.currentStepIndex);
        }
    }

    static previousStep() {
        if (this.currentStepIndex > 0) {
            this.executeStep(--this.currentStepIndex);
        }
    }

    static async playAutoFromCurrent() {
        const speed = parseInt(domRefs.animationSpeedSelect?.value || '500');
        for (let i = this.currentStepIndex; i < this.searchResult.steps.length; i++) {
            this.currentStepIndex = i;
            this.executeStep(i);
            await this.sleep(speed);
        }
    }

    static resetVisualization() {
        this.currentStepIndex = 0;

        // Reset visual state
        this.resetVisualizationState();

        // Clear results and node lists
        this.clearResults();
        this.clearNodeLists();

        if (this.graphBuilder) {
            this.graphBuilder.buildGraph(this.currentGraphData, this.startNode, this.goalNodes);
        }

        if (this.treeVisualizer) {
            const maxDepth = parseInt(domRefs.treeDepthInput?.value || '4');
            const options = {
                weights: this.currentGraphData.weights || {},
                heuristic: this.currentGraphData.heuristic || {}
            };
            this.treeVisualizer.buildTree(this.currentGraphData, this.startNode, maxDepth, this.goalNodes, options);
        }

        // Update step counter if it exists
        const stepCounter = document.getElementById('step-counter');
        if (stepCounter && this.searchResult) {
            stepCounter.textContent = `Step 0 / ${this.searchResult.steps.length}`;
        }
    }

    static async animateSearch(result, speed) {
        for (let i = 0; i < result.steps.length; i++) {
            const step = result.steps[i];
            const { current_node: node, frontier: openedNodes = [], visited: closedNodes = [], action } = step;

            this.updateOpenedNodes(openedNodes);
            this.updateClosedNodes(closedNodes);

            if (this.treeVisualizer) {
                this.treeVisualizer.highlightOpenedNodes(openedNodes);
                this.treeVisualizer.highlightClosedNodes(closedNodes);
            }

            if (this.graphBuilder && action === 'visit' && node !== this.startNode && !this.goalNodes.includes(node)) {
                this.graphBuilder.updateNode(node, 'node-circle visited');
            }

            await this.sleep(speed);
        }

        const path = result.path || [];
        if (path.length > 0) {
            await this.sleep(500);

            for (const node of path) {
                if (this.graphBuilder && node !== this.startNode && !this.goalNodes.includes(node)) {
                    this.graphBuilder.updateNode(node, 'node-circle path');
                }
                await this.sleep(speed / 2);
            }

            this.graphBuilder?.highlightPath(path);
            this.treeVisualizer?.highlightPath(path);
        }
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static clearGraph() {
        this.graphBuilder?.clear();
        this.treeVisualizer?.clear();
        this.clearResults();
        this.clearNodeLists();

        this.currentGraphData = null;
        this.startNode = null;
        this.goalNodes = [];
        this.currentStepIndex = 0;
        this.searchResult = null;
        this.isManualMode = false;

        document.getElementById('manual-step-controls')?.remove();
    }

    static clearResults() {
        if (domRefs.traversalList) domRefs.traversalList.textContent = '';
        if (domRefs.pathList) domRefs.pathList.textContent = '';
        if (domRefs.statsList) domRefs.statsList.textContent = '';
        if (domRefs.graphStats) domRefs.graphStats.innerHTML = '';
    }

    static clearNodeLists() {
        const lists = [domRefs.openedListGraph, domRefs.closedListGraph, domRefs.openedListTree, domRefs.closedListTree];
        lists.forEach(list => { if (list) list.innerHTML = ''; });
    }

    static extractNodeLabel(nodeId) {
        if (nodeId.includes('#')) {
            return nodeId.split('#')[1].split('-')[0];
        }
        return nodeId.split('-')[0];
    }

    static updateOpenedNodes(nodes) {
        const safeNodes = Array.isArray(nodes) ? nodes : [];
        const labels = safeNodes.map(n => `<li>${this.extractNodeLabel(n)}</li>`).join('');

        if (domRefs.openedListGraph) domRefs.openedListGraph.innerHTML = labels;
        if (domRefs.openedListTree) domRefs.openedListTree.innerHTML = labels;
    }

    static updateClosedNodes(nodes) {
        const labels = nodes.map(n => `<li>${this.extractNodeLabel(n)}</li>`).join('');

        if (domRefs.closedListGraph) domRefs.closedListGraph.innerHTML = labels;
        if (domRefs.closedListTree) domRefs.closedListTree.innerHTML = labels;
    }

    static displayResults(results) {
        const traversal = results.visited || results.traversal || [];
        const path = results.path || [];

        if (domRefs.traversalList) {
            domRefs.traversalList.textContent = traversal.join(' → ') || 'N/A';
        }

        if (domRefs.pathList) {
            domRefs.pathList.textContent = path.length > 0 ? path.join(' → ') : 'No path found';
        }

        if (domRefs.statsList) {
            const stats = [
                `Nodes Explored: ${traversal.length || 0}`,
                `Path Length: ${path.length > 0 ? path.length - 1 : 0}`,
                `Algorithm: ${results.algorithm || 'N/A'}`
            ].join(' | ');
            domRefs.statsList.textContent = stats;
        }
    }

    static resetVisualizationState() {
        // Reset all graph nodes to default state
        if (this.graphBuilder?.svg) {
            const svg = this.graphBuilder.svg;

            // Reset all node circles to default
            const nodes = svg.querySelectorAll('.node-circle');
            nodes.forEach(node => {
                const nodeLabel = node.parentElement.getAttribute('data-node');

                // Check if it's start or goal node
                if (nodeLabel === this.startNode) {
                    node.setAttribute('class', 'node-circle start');
                } else if (this.goalNodes.includes(nodeLabel)) {
                    node.setAttribute('class', 'node-circle goal');
                } else {
                    node.setAttribute('class', 'node-circle');
                }
            });

            // Reset all edges to default
            const edges = svg.querySelectorAll('.edge-line');
            edges.forEach(edge => {
                edge.setAttribute('class', 'edge-line');
            });
        }

        // Reset all tree nodes to default state
        if (this.treeVisualizer?.svg) {
            const treeSvg = this.treeVisualizer.svg;

            // Reset all tree nodes
            const treeNodes = treeSvg.querySelectorAll('.tree-node');
            treeNodes.forEach(node => {
                node.setAttribute('class', 'tree-node');
            });

            // Reset all tree links
            const treeLinks = treeSvg.querySelectorAll('.tree-link');
            treeLinks.forEach(link => {
                link.setAttribute('class', 'tree-link');
            });
        }
    }

    // Toggle tree weights visibility
    static toggleTreeWeights(show) {
        if (this.treeVisualizer) {
            this.treeVisualizer.toggleWeights(show);
        }
    }

    // Toggle tree heuristics visibility
    static toggleTreeHeuristics(show) {
        if (this.treeVisualizer) {
            this.treeVisualizer.toggleHeuristics(show);
        }
    }

    // Get tree HTML for opening in new window
    static getTreeHTML() {
        if (this.treeVisualizer) {
            return this.treeVisualizer.getTreeHTML();
        }
        return null;
    }
}
