/**
 * Main Application Entry Point
 */

import { APIService } from './api.js';
import { dom, domRefs } from './dom.js';
import { SearchController } from './search-controller.js';
import { ExamplesManager } from './examples-manager.js';

class App {
    static async initialize() {
        console.log('Initializing Search Algorithms Visualizer...');

        await APIService.checkHealth();
        await ExamplesManager.loadExamples();
        this.setupEventListeners();

        console.log('Application initialized successfully!');
    }

    static setupEventListeners() {
        this.setupInputModeToggle();
        this.setupExampleSelection();
        this.setupButtons();
        this.setupVisualizationMode();
        this.setupAlgorithmSelection();

        console.log('Event listeners registered');
    }

    static setupInputModeToggle() {
        domRefs.inputModeRadios?.forEach(radio => {
            radio.addEventListener('change', (e) => this.handleInputModeChange(e.target.value));
        });
    }

    static setupExampleSelection() {
        domRefs.exampleGraphSelect?.addEventListener('change', (e) => {
            this.handleExampleSelection(e.target.value);
        });
    }

    static setupButtons() {
        domRefs.drawGraphButton?.addEventListener('click', () => this.handleDrawGraph());
        dom.startGraphButton?.addEventListener('click', () => SearchController.runSearch());
        domRefs.clearResultsButton?.addEventListener('click', () => SearchController.clearGraph());

        // Add event listener for open tree in new window button
        const openTreeWindowBtn = document.getElementById('open-tree-window');
        if (openTreeWindowBtn) {
            openTreeWindowBtn.addEventListener('click', () => this.handleOpenTreeWindow());
        }

        // Add event listeners for tree display toggles
        const showWeightsCheckbox = document.getElementById('show-tree-weights');
        const showHeuristicsCheckbox = document.getElementById('show-tree-heuristics');

        if (showWeightsCheckbox) {
            showWeightsCheckbox.addEventListener('change', (e) => {
                SearchController.toggleTreeWeights(e.target.checked);
            });
        }

        if (showHeuristicsCheckbox) {
            showHeuristicsCheckbox.addEventListener('change', (e) => {
                SearchController.toggleTreeHeuristics(e.target.checked);
            });
        }
    }

    static setupVisualizationMode() {
        domRefs.visualizationModeSelect?.addEventListener('change', (e) => {
            const isManual = e.target.value === 'manual';
            if (domRefs.speedControlGroup) {
                domRefs.speedControlGroup.classList.toggle('hidden', isManual);
            }
        });
    }

    static setupAlgorithmSelection() {
        dom.graphAlgorithmSelect?.addEventListener('change', (e) => {
            const heuristicContainer = dom.heuristicInput?.parentElement?.parentElement;
            if (heuristicContainer) {
                const needsHeuristic = ['astar', 'greedy'].includes(e.target.value);
                heuristicContainer.classList.toggle('hidden', !needsHeuristic);
            }
        });
    }

    static handleInputModeChange(mode) {
        const showCustom = mode === 'custom';
        if (domRefs.customGraphCol) {
            domRefs.customGraphCol.classList.toggle('hidden', !showCustom);
        }
        if (domRefs.predefinedGraphCol) {
            domRefs.predefinedGraphCol.classList.toggle('hidden', showCustom);
        }
    }

    static handleExampleSelection(exampleName) {
        if (!exampleName) {
            if (domRefs.examplePreview) domRefs.examplePreview.classList.add('hidden');
            return;
        }

        const example = ExamplesManager.getExample(exampleName);
        if (!example) return;

        if (domRefs.examplePreview && domRefs.examplePreviewContent) {
            domRefs.examplePreview.classList.remove('hidden');
            domRefs.examplePreviewContent.textContent = JSON.stringify(example, null, 2);
        }

        if (example.start && domRefs.graphStart) {
            domRefs.graphStart.value = example.start;
        }
        if (example.goal && domRefs.graphGoal) {
            domRefs.graphGoal.value = Array.isArray(example.goal) ? example.goal.join(',') : example.goal;
        }
    }

    static handleDrawGraph() {
        const selectedMode = document.querySelector('input[name="input-mode"]:checked')?.value;
        const graphData = selectedMode === 'predefined'
            ? this.getPredefineGraphData()
            : this.getCustomGraphData();

        if (graphData) {
            SearchController.drawGraph(graphData);
        }
    }

    static getPredefineGraphData() {
        const exampleName = domRefs.exampleGraphSelect?.value;
        if (!exampleName) {
            alert('Please select a predefined example');
            return null;
        }
        return ExamplesManager.getExample(exampleName);
    }

    static getCustomGraphData() {
        try {
            const graphData = {
                graph: JSON.parse(domRefs.graphInput?.value || '{}'),
                weights: domRefs.weightsInput?.value ? JSON.parse(domRefs.weightsInput.value) : null,
                heuristic: domRefs.heuristicInput?.value ? JSON.parse(domRefs.heuristicInput.value) : null,
                start: domRefs.graphStart?.value,
                goal: domRefs.graphGoal?.value
            };

            if (!graphData.graph || Object.keys(graphData.graph).length === 0) {
                alert('Please enter a graph definition in JSON format.\n\nExample:\n{\n  "A": ["B", "C"],\n  "B": ["A", "D"],\n  "C": ["A", "D"],\n  "D": ["B", "C"]\n}');
                return null;
            }

            return graphData;
        } catch (e) {
            alert('Invalid JSON input. Please check your graph definition.');
            console.error('JSON parse error:', e);
            return null;
        }
    }

    static handleOpenTreeWindow() {
        const treeHTML = SearchController.getTreeHTML();
        if (!treeHTML) {
            alert('Please draw the graph and tree first before opening in a new window.');
            return;
        }

        const newWindow = window.open('', '_blank', 'width=1200,height=800');
        if (newWindow) {
            newWindow.document.write(treeHTML);
            newWindow.document.close();
        } else {
            alert('Please allow pop-ups for this site to open the tree in a new window.');
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.initialize());
} else {
    App.initialize();
}
