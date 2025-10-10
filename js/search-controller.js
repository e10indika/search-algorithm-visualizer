/**
 * Search Controller
 * Coordinates graph visualization, tree generation, and search execution
 */

import {GraphBuilder} from './graph-builder.js';
import {TreeVisualizer} from './tree-visualizer.js';
import {domRefs} from './dom.js';
import {APIService} from './api.js';

export class SearchController {
    static graphBuilder = null;
    static treeVisualizer = null;
    static currentGraphData = null;
    static startNode = null;
    static goalNodes = [];
    static currentStepIndex = 0;
    static searchResult = null;
    static isManualMode = false;

    // ==================== Graph Drawing & Validation ====================

    static drawGraph(graphData) {
        this.goalNodes = (graphData.goal || '').split(',').map(g => g.trim()).filter(g => g);
        this.startNode = graphData.start;
        this.currentGraphData = graphData;

        if (!this.validateGraphData()) return;

        this.resetVisualization();
        this.renderGraphVisualization(graphData);
        this.renderTreeVisualization(graphData);
        this.syncVisualizationSizes();
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

    static syncVisualizationSizes() {
        const graphContainer = domRefs.graphContainer;
        const treeContainer = domRefs.stateSpaceTreeContainer;

        if (!graphContainer || !treeContainer) return;

        setTimeout(() => {
            const graphRect = graphContainer.getBoundingClientRect();
            const treeRect = treeContainer.getBoundingClientRect();

            const maxWidth = Math.max(graphRect.width, treeRect.width);
            const maxHeight = Math.max(graphRect.height, treeRect.height);

            if (maxWidth > 0 && maxHeight > 0) {
                const sizeStyle = `${maxWidth}px`;
                const heightStyle = `${maxHeight}px`;

                graphContainer.style.minWidth = sizeStyle;
                graphContainer.style.minHeight = heightStyle;
                treeContainer.style.minWidth = sizeStyle;
                treeContainer.style.minHeight = heightStyle;
            }
        }, 100);
    }

    // ==================== Search Execution ====================

    static async runSearch() {
        if (!this.currentGraphData || !this.startNode || this.goalNodes.length === 0) {
            alert('Please draw a graph first');
            return;
        }

        const algorithm = domRefs.graphAlgorithmSelect?.value || 'bfs';
        const visualizationMode = domRefs.visualizationModeSelect?.value || 'auto';
        const animationSpeed = parseInt(domRefs.animationSpeedSelect?.value || '500');

        this.resetVisualizationState();
        this.clearResults();
        this.clearNodeLists();

        const requestData = {
            algorithm,
            graph: this.currentGraphData.graph,
            start: this.startNode,
            goal: this.goalNodes[0],
            weights: this.currentGraphData.weights || {},
            heuristic: this.currentGraphData.heuristic || {},
            maxDepth: parseInt(domRefs.limitDepthInput?.value || '4')
        };

        try {
            this.setTraversalMessage('Running search...');

            const result = await APIService.searchGraph(requestData);

            if (result.error) {
                this.handleSearchError(result.error);
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
            this.handleSearchError(error.message);
        }
    }

    static setTraversalMessage(message) {
        if (domRefs.traversalList) {
            domRefs.traversalList.textContent = message;
        }
    }

    static handleSearchError(errorMessage) {
        alert(`Search failed: ${errorMessage}`);
        this.setTraversalMessage(`Error: ${errorMessage}`);
    }

    // ==================== Manual Mode Controls ====================

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
            <span id="step-counter">Step 0 / ${this.searchResult.steps.length}</span>
            <button id="next-step-btn">Next ⏭</button>
            <button id="play-auto-btn">▶ Play Auto</button>
            <button id="reset-viz-btn">🔄 Reset</button>
        `;

        document.getElementById('prev-step-btn').addEventListener('click', () => this.previousStep());
        document.getElementById('next-step-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('play-auto-btn').addEventListener('click', () => this.playAutoFromCurrent());
        document.getElementById('reset-viz-btn').addEventListener('click', () => this.resetVisualization());
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

    // ==================== Step Execution & Animation ====================

    static executeStep(stepIndex) {
        if (!this.searchResult?.steps || stepIndex < 0 || stepIndex >= this.searchResult.steps.length) {
            return;
        }

        const step = this.searchResult.steps[stepIndex];
        const {current_node: node, frontier = [], visited = [], action} = step;

        const extra = this.buildExtraData(step);

        this.updateOpenedNodes(frontier, extra);
        this.updateClosedNodes(visited, extra);

        if (this.treeVisualizer) {
            this.treeVisualizer.highlightOpenedNodes(frontier);
            this.treeVisualizer.highlightClosedNodes(visited);
        }

        if (this.shouldUpdateNodeVisual(node, action)) {
            this.graphBuilder.updateNode(node, 'node-circle visited');
        }

        this.updateStepCounter(stepIndex);

        if (action === 'goal_found') {
            this.highlightGoalPath();
        }
    }

    static buildExtraData(step) {
        return {
            costs: step.costs || {},
            parents: step.parent || {},
            heuristics: this.currentGraphData?.heuristic || {}
        };
    }

    static shouldUpdateNodeVisual(node, action) {
        return this.graphBuilder &&
            action === 'visit' &&
            node !== this.startNode &&
            !this.goalNodes.includes(node);
    }

    static updateStepCounter(stepIndex) {
        const stepCounter = document.getElementById('step-counter');
        if (stepCounter) {
            stepCounter.textContent = `Step ${stepIndex + 1} / ${this.searchResult.steps.length}`;
        }
    }

    static highlightGoalPath() {
        const path = this.searchResult.path || [];
        this.graphBuilder?.highlightPath(path);
        this.treeVisualizer?.highlightPath(path);
    }

    static async animateSearch(result, speed) {
        for (let i = 0; i < result.steps.length; i++) {
            const step = result.steps[i];
            const {current_node: node, frontier = [], visited = [], action} = step;

            const extra = this.buildExtraData(step);

            this.updateOpenedNodes(frontier, extra);
            this.updateClosedNodes(visited, extra);

            if (this.treeVisualizer) {
                this.treeVisualizer.highlightOpenedNodes(frontier);
                this.treeVisualizer.highlightClosedNodes(visited);
            }

            if (this.shouldUpdateNodeVisual(node, action)) {
                this.graphBuilder.updateNode(node, 'node-circle visited');
            }

            await this.sleep(speed);
        }

        await this.animateFinalPath(result.path, speed);
    }

    static async animateFinalPath(path = [], speed) {
        if (path.length === 0) return;

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

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ==================== Node List Updates ====================

    static updateOpenedNodes(nodes, extra = {}) {
        const safeNodes = Array.isArray(nodes) ? nodes : [];
        const algorithm = this.searchResult?.algorithm || '';
        const showCosts = this.shouldShowCosts(algorithm);

        const closedNodes = this.searchResult?.steps?.[this.currentStepIndex]?.visited || [];
        const closedNodeLabels = this.extractClosedNodeLabels(closedNodes);

        const labels = safeNodes
            .filter(n => !closedNodeLabels.has(this.getCleanLabel(this.extractNodeLabel(n))))
            .map(n => this.createNodeListItem(n, extra, showCosts, '#ff6b35'))
            .join('');

        this.setListContent(domRefs.openedListGraph, labels);
        this.setListContent(domRefs.openedListTree, labels);
    }

    static updateClosedNodes(nodes, extra = {}) {
        const algorithm = this.searchResult?.algorithm || '';
        const showCosts = this.shouldShowCosts(algorithm);

        const nodeDataMap = this.buildNodeDataMap(nodes, extra, showCosts);

        const labels = Array.from(nodeDataMap.values())
            .map(data => this.createNodeListItem(data.nodeId, extra, showCosts, '#d9534f', data.cost))
            .join('');

        this.setListContent(domRefs.closedListGraph, labels);
        this.setListContent(domRefs.closedListTree, labels);
    }

    static setListContent(element, content) {
        if (element) element.innerHTML = content;
    }

    // ==================== Helper Methods ====================

    static shouldShowCosts(algorithm) {
        return ['UniformCostSearch', 'dijkstra', 'AStarSearch', 'GreedyBestFirstSearch'].includes(algorithm);
    }

    static extractClosedNodeLabels(closedNodes) {
        const closedNodeLabels = new Set();
        closedNodes.forEach(nodeId => {
            const label = this.extractNodeLabel(nodeId);
            const cleanLabel = this.getCleanLabel(label);
            closedNodeLabels.add(cleanLabel);
        });
        return closedNodeLabels;
    }

    static buildNodeDataMap(nodes, extra, showCosts) {
        const nodeDataMap = new Map();

        nodes.forEach(n => {
            const nodeLabel = this.extractNodeLabel(n);
            const cleanLabel = this.getCleanLabel(nodeLabel);
            const cost = this.extractNodeCost(n, nodeLabel, cleanLabel, extra, showCosts);

            const existingData = nodeDataMap.get(cleanLabel);
            if (!existingData || (cost !== undefined && cost < existingData.cost)) {
                nodeDataMap.set(cleanLabel, {
                    nodeId: n,
                    nodeLabel,
                    cleanLabel,
                    cost
                });
            }
        });

        return nodeDataMap;
    }

    static extractNodeCost(nodeId, nodeLabel, cleanLabel, extra, showCosts) {
        if (!showCosts || !extra.costs) return undefined;

        let cost = extra.costs[nodeId] ?? extra.costs[nodeLabel] ?? extra.costs[cleanLabel];

        if (cost === undefined && nodeId.includes('#') && this.searchResult?.steps) {
            for (const step of this.searchResult.steps) {
                if (step.frontier?.includes(nodeId) || step.visited?.includes(nodeId)) {
                    cost = step.costs?.[cleanLabel] ?? step.path_cost?.[cleanLabel];
                    if (cost !== undefined) break;
                }
            }
        }

        return cost;
    }

    static createNodeListItem(nodeId, extra, showCosts, backgroundColor, preCalculatedCost) {
        const nodeLabel = this.extractNodeLabel(nodeId);
        const cleanLabel = this.getCleanLabel(nodeLabel);
        const cost = preCalculatedCost ?? this.extractNodeCost(nodeId, nodeLabel, cleanLabel, extra, showCosts);

        if (!showCosts || cost === undefined) {
            return `<li>${cleanLabel}</li>`;
        }

        return `<li style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span>${cleanLabel}</span>
            <span style="background: ${backgroundColor}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; font-weight: bold; min-width: 20px; text-align: center;">${cost}</span>
        </li>`;
    }

    static extractNodeLabel(nodeId) {
        if (nodeId.includes('#')) {
            return nodeId.split('#')[1].split('-')[0];
        }
        return nodeId.split('-')[0];
    }

    static getCleanLabel(label) {
        return label.replace(' (loop)', '');
    }

    // ==================== Reset & Clear Methods ====================

    static resetVisualization() {
        this.currentStepIndex = 0;
        this.resetVisualizationState();
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

        this.updateStepCounter(-1);
    }

    static resetVisualizationState() {
        if (this.graphBuilder?.svg) {
            this.resetGraphNodes();
            this.resetGraphEdges();
        }

        if (this.treeVisualizer) {
            this.resetTreeNodes();
            this.treeVisualizer.resetEdgeHighlights();
        }
    }

    static resetGraphNodes() {
        const nodes = this.graphBuilder.svg.querySelectorAll('.node-circle');
        nodes.forEach(node => {
            const nodeLabel = node.parentElement.getAttribute('data-node');
            const nodeClass = this.getNodeClass(nodeLabel);
            node.setAttribute('class', nodeClass);
        });
    }

    static getNodeClass(nodeLabel) {
        if (nodeLabel === this.startNode) {
            return 'node-circle start';
        } else if (this.goalNodes.includes(nodeLabel)) {
            return 'node-circle goal';
        }
        return 'node-circle';
    }

    static resetGraphEdges() {
        const edges = this.graphBuilder.svg.querySelectorAll('.edge-line');
        edges.forEach(edge => edge.setAttribute('class', 'edge-line'));
    }

    static resetTreeNodes() {
        if (this.treeVisualizer.svg) {
            const treeNodes = this.treeVisualizer.svg.querySelectorAll('.tree-node');
            treeNodes.forEach(node => node.setAttribute('class', 'tree-node'));
        }
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
        const lists = [
            domRefs.openedListGraph,
            domRefs.closedListGraph,
            domRefs.openedListTree,
            domRefs.closedListTree
        ];
        lists.forEach(list => {
            if (list) list.innerHTML = '';
        });
    }

    // ==================== Display Methods ====================

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
            domRefs.statsList.textContent = [
                `Nodes Explored: ${traversal.length || 0}`,
                `Path Length: ${path.length > 0 ? path.length - 1 : 0}`,
                `Algorithm: ${results.algorithm || 'N/A'}`
            ].join(' | ');
        }
    }

    // ==================== Tree Visualization Controls ====================

    static toggleTreeWeights(show) {
        if (this.treeVisualizer) {
            this.treeVisualizer.toggleWeights(show);
        }
    }

    static toggleTreeHeuristics(show) {
        if (this.treeVisualizer) {
            this.treeVisualizer.toggleHeuristics(show);
        }
    }

    static getTreeHTML() {
        return this.treeVisualizer?.getTreeHTML() || null;
    }
}
