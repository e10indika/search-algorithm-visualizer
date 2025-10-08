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

            // Store result for manual mode
            this.searchResult = result;
            this.currentStepIndex = 0;
            this.isManualMode = (visualizationMode === 'manual');

            // Display results
            this.displayResults(result);

            // Animate the search if in auto mode, otherwise setup manual controls
            if (visualizationMode === 'auto') {
                await this.animateSearch(result, animationSpeed);
            } else {
                // Manual mode - setup step-by-step controls and show first step
                this.setupManualMode();
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
     * Setup manual mode controls
     */
    static setupManualMode() {
        console.log('🎮 Setting up manual mode controls...');

        // Create controls container if it doesn't exist
        let controlsContainer = document.getElementById('manual-step-controls');
        if (!controlsContainer) {
            controlsContainer = document.createElement('div');
            controlsContainer.id = 'manual-step-controls';
            controlsContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                gap: 15px;
                align-items: center;
                z-index: 1000;
            `;
            document.body.appendChild(controlsContainer);
        }

        controlsContainer.innerHTML = `
            <button id="prev-step-btn" style="padding: 8px 16px; cursor: pointer;">⏮ Previous</button>
            <span id="step-counter" style="font-weight: bold; min-width: 120px; text-align: center;">
                Step 0 / ${this.searchResult.steps.length}
            </span>
            <button id="next-step-btn" style="padding: 8px 16px; cursor: pointer;">Next ⏭</button>
            <button id="play-auto-btn" style="padding: 8px 16px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 5px;">▶ Play Auto</button>
            <button id="reset-viz-btn" style="padding: 8px 16px; cursor: pointer;">🔄 Reset</button>
        `;

        // Add event listeners
        document.getElementById('prev-step-btn').addEventListener('click', () => this.previousStep());
        document.getElementById('next-step-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('play-auto-btn').addEventListener('click', () => this.playAutoFromCurrent());
        document.getElementById('reset-viz-btn').addEventListener('click', () => this.resetVisualization());

        // Show first step
        this.executeStep(0);
    }

    /**
     * Execute a specific step
     */
    static executeStep(stepIndex) {
        if (!this.searchResult || !this.searchResult.steps) return;

        const steps = this.searchResult.steps;
        if (stepIndex < 0 || stepIndex >= steps.length) return;

        const step = steps[stepIndex];
        const node = step.current_node;

        // Update opened/closed lists
        const openedNodes = step.frontier || [];
        const closedNodes = step.visited || [];

        console.log('⏱️ Step', stepIndex, 'Action:', step.action, 'Node:', node, 'Opened:', openedNodes, 'Closed:', closedNodes);

        this.updateOpenedNodes(openedNodes);
        this.updateClosedNodes(closedNodes);

        // Highlight opened nodes in tree with solid blue outline
        if (this.treeVisualizer) {
            this.treeVisualizer.highlightOpenedNodes(openedNodes);
            this.treeVisualizer.highlightClosedNodes(closedNodes);
        }

        // Highlight current node in graph
        if (this.graphBuilder && node !== this.startNode && !this.goalNodes.includes(node)) {
            if (step.action === 'visit') {
                this.graphBuilder.updateNode(node, 'node-circle visited');
            }
        }

        // Update step counter
        const stepCounter = document.getElementById('step-counter');
        if (stepCounter) {
            stepCounter.textContent = `Step ${stepIndex + 1} / ${steps.length}`;
        }

        // If goal found, highlight the path
        if (step.action === 'goal_found') {
            const path = this.searchResult.path || [];
            if (this.graphBuilder) {
                this.graphBuilder.highlightPath(path);
            }
            if (this.treeVisualizer) {
                this.treeVisualizer.highlightPath(path);
            }
        }
    }

    /**
     * Go to next step
     */
    static nextStep() {
        if (this.currentStepIndex < this.searchResult.steps.length - 1) {
            this.currentStepIndex++;
            this.executeStep(this.currentStepIndex);
        }
    }

    /**
     * Go to previous step
     */
    static previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.executeStep(this.currentStepIndex);
        }
    }

    /**
     * Play auto from current step
     */
    static async playAutoFromCurrent() {
        const speed = parseInt(domRefs.animationSpeedSelect?.value || '500');

        for (let i = this.currentStepIndex; i < this.searchResult.steps.length; i++) {
            this.currentStepIndex = i;
            this.executeStep(i);
            await this.sleep(speed);
        }
    }

    /**
     * Reset visualization
     */
    static resetVisualization() {
        this.currentStepIndex = 0;
        this.executeStep(0);

        // Clear graph colors
        if (this.graphBuilder) {
            // Redraw the graph to reset colors
            this.graphBuilder.buildGraph(this.currentGraphData, this.startNode, this.goalNodes);
        }

        // Clear tree colors
        if (this.treeVisualizer) {
            const maxDepth = parseInt(domRefs.treeDepthInput?.value || '4');
            this.treeVisualizer.buildTree(this.currentGraphData, this.startNode, maxDepth, this.goalNodes);
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
        for (let i = 0; i < result.steps.length; i++) {
            const step = result.steps[i];
            const node = step.current_node;

            // Update opened/closed lists
            const openedNodes = step.frontier || [];
            const closedNodes = step.visited || [];

            console.log('⏱️ Step', i + 1, 'Action:', step.action, 'Node:', node, 'Opened:', openedNodes, 'Closed:', closedNodes);

            this.updateOpenedNodes(openedNodes);
            this.updateClosedNodes(closedNodes);

            // Highlight opened nodes in tree with solid blue outline
            if (this.treeVisualizer) {
                this.treeVisualizer.highlightOpenedNodes(openedNodes);
                this.treeVisualizer.highlightClosedNodes(closedNodes);
            }

            // Highlight current node in graph
            if (this.graphBuilder && node !== this.startNode && !this.goalNodes.includes(node)) {
                if (step.action === 'visit') {
                    this.graphBuilder.updateNode(node, 'node-circle visited');
                }
            }

            // Highlight node in tree
            if (this.treeVisualizer && step.action === 'visit') {
                // this.treeVisualizer.highlightNodeByLabel(node);
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

            // Highlight full path in graph and tree
            if (this.graphBuilder) {
                this.graphBuilder.highlightPath(path);
            }

            if (this.treeVisualizer) {
                this.treeVisualizer.highlightPath(path);
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
        this.currentStepIndex = 0;
        this.searchResult = null;
        this.isManualMode = false;

        // Remove manual controls if they exist
        const controlsContainer = document.getElementById('manual-step-controls');
        if (controlsContainer) {
            controlsContainer.remove();
        }

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
        const safeNodes = Array.isArray(nodes) ? nodes : [];
        console.log('Opened Nodes:', safeNodes);

        // Extract node labels from IDs (e.g., "A#B-1" -> "B")
        const extractLabel = (nodeId) => {
            if (nodeId.includes('#')) {
                // Format: "A#B-1" -> extract "B"
                const afterHash = nodeId.split('#')[1];
                return afterHash.split('-')[0];
            } else {
                // Format: "A-0" -> extract "A"
                return nodeId.split('-')[0];
            }
        };

        if (domRefs.openedListGraph) {
            domRefs.openedListGraph.innerHTML = safeNodes.map(n => `<li>${extractLabel(n)}</li>`).join('');
        }
        if (domRefs.openedListTree) {
            domRefs.openedListTree.innerHTML = safeNodes.map(n => `<li>${extractLabel(n)}</li>`).join('');
        }
    }

    /**
     * Update closed nodes list
     */
    static updateClosedNodes(nodes) {
        // Extract node labels from IDs (e.g., "A#B-1" -> "B")
        const extractLabel = (nodeId) => {
            if (nodeId.includes('#')) {
                // Format: "A#B-1" -> extract "B"
                const afterHash = nodeId.split('#')[1];
                return afterHash.split('-')[0];
            } else {
                // Format: "A-0" -> extract "A"
                return nodeId.split('-')[0];
            }
        };

        if (domRefs.closedListGraph) {
            domRefs.closedListGraph.innerHTML = nodes.map(n => `<li>${extractLabel(n)}</li>`).join('');
        }
        if (domRefs.closedListTree) {
            domRefs.closedListTree.innerHTML = nodes.map(n => `<li>${extractLabel(n)}</li>`).join('');
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