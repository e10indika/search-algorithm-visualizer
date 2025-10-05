/**
 * Main Application Entry Point
 */

import { APIService } from './api.js';
import { dom, domRefs } from './dom.js';
import { SearchController } from './search-controller.js';
import { ExamplesManager } from './examples-manager.js';

class App {
    static async initialize() {
        console.log('🚀 Initializing Search Algorithms Visualizer...');

        // Check backend health
        await APIService.checkHealth();

        // Load examples
        await ExamplesManager.loadExamples();

        // Setup event listeners
        this.setupEventListeners();

        console.log('✅ Application initialized successfully!');
    }

    static setupEventListeners() {
        // Input mode toggle
        if (domRefs.inputModeRadios) {
            domRefs.inputModeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => this.handleInputModeChange(e.target.value));
            });
        }

        // Example graph selection with preview
        if (domRefs.exampleGraphSelect) {
            domRefs.exampleGraphSelect.addEventListener('change', (e) => {
                this.handleExampleSelection(e.target.value);
            });
        }

        // Draw button
        if (domRefs.drawGraphButton) {
            domRefs.drawGraphButton.addEventListener('click', () => this.handleDrawGraph());
        }

        // Search button
        if (dom.startGraphButton) {
            dom.startGraphButton.addEventListener('click', () => SearchController.runSearch());
        }

        // Clear results button
        if (domRefs.clearResultsButton) {
            domRefs.clearResultsButton.addEventListener('click', () => SearchController.clearGraph());
        }

        // Visualization mode change (show/hide speed control and manual button)
        if (domRefs.visualizationModeSelect) {
            domRefs.visualizationModeSelect.addEventListener('change', (e) => {
                const isManual = e.target.value === 'manual';
                if (domRefs.speedControlGroup) {
                    domRefs.speedControlGroup.style.display = isManual ? 'none' : 'flex';
                }
                if (domRefs.manualActionButton) {
                    domRefs.manualActionButton.style.display = isManual ? 'inline-block' : 'none';
                }
            });
        }

        // Algorithm change handler (show/hide heuristic input)
        if (dom.graphAlgorithmSelect) {
            dom.graphAlgorithmSelect.addEventListener('change', (e) => {
                const algorithm = e.target.value;
                const heuristicContainer = dom.heuristicInput?.parentElement?.parentElement;

                if (heuristicContainer) {
                    // Show heuristic input for A* and Greedy
                    if (algorithm === 'astar' || algorithm === 'greedy') {
                        heuristicContainer.style.display = 'block';
                    } else {
                        heuristicContainer.style.display = 'none';
                    }
                }
            });
        }

        console.log('✅ Event listeners registered');
    }

    static handleInputModeChange(mode) {
        console.log(`📋 Input mode changed to: ${mode}`);

        if (mode === 'custom') {
            // Show custom graph inputs
            if (domRefs.customGraphCol) domRefs.customGraphCol.style.display = 'block';
            if (domRefs.predefinedGraphCol) domRefs.predefinedGraphCol.style.display = 'none';
        } else if (mode === 'predefined') {
            // Show predefined example selector
            if (domRefs.customGraphCol) domRefs.customGraphCol.style.display = 'none';
            if (domRefs.predefinedGraphCol) domRefs.predefinedGraphCol.style.display = 'block';
        }
    }

    static handleExampleSelection(exampleName) {
        if (!exampleName) {
            if (domRefs.examplePreview) {
                domRefs.examplePreview.style.display = 'none';
            }
            return;
        }

        console.log(`📚 Loading example: ${exampleName}`);

        // Get example data from ExamplesManager
        const example = ExamplesManager.getExample(exampleName);

        if (example && domRefs.examplePreview && domRefs.examplePreviewContent) {
            // Show preview
            domRefs.examplePreview.style.display = 'block';
            domRefs.examplePreviewContent.textContent = JSON.stringify(example, null, 2);

            // Auto-fill start and goal if available
            if (example.start && domRefs.graphStart) {
                domRefs.graphStart.value = example.start;
            }
            if (example.goal && domRefs.graphGoal) {
                domRefs.graphGoal.value = Array.isArray(example.goal) ? example.goal.join(',') : example.goal;
            }
        }
    }

    static handleDrawGraph() {
        console.log('🎨 Drawing graph and state space tree...');

        // Get current input mode
        const selectedMode = document.querySelector('input[name="input-mode"]:checked')?.value;

        let graphData = null;

        if (selectedMode === 'predefined') {
            // Use predefined example
            const exampleName = domRefs.exampleGraphSelect?.value;
            if (!exampleName) {
                alert('Please select a predefined example');
                return;
            }
            graphData = ExamplesManager.getExample(exampleName);
        } else {
            // Use custom input
            try {
                graphData = {
                    graph: JSON.parse(domRefs.graphInput?.value || '{}'),
                    weights: domRefs.weightsInput?.value ? JSON.parse(domRefs.weightsInput.value) : null,
                    heuristic: domRefs.heuristicInput?.value ? JSON.parse(domRefs.heuristicInput.value) : null,
                    start: domRefs.graphStart?.value,
                    goal: domRefs.graphGoal?.value
                };
            } catch (e) {
                alert('Invalid JSON input. Please check your graph definition.');
                console.error('JSON parse error:', e);
                return;
            }
        }

        // Call the draw function (to be implemented in SearchController or GraphBuilder)
        if (SearchController.drawGraph) {
            SearchController.drawGraph(graphData);
        } else {
            console.log('Graph data ready:', graphData);
            // Placeholder: actual drawing logic will be implemented
            alert('Graph drawing functionality will be implemented in the next step');
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.initialize());
} else {
    App.initialize();
}
