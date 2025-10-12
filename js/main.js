/**
 * Main Application Entry Point
 */

import {APIService} from './api.js';
import {dom, domRefs} from './dom.js';
import {SearchController} from './search-controller.js';
import {ExamplesManager} from './examples-manager.js';

class App {
    static async initialize() {
        await APIService.checkHealth();
        await ExamplesManager.loadExamples();
        this.setupEventListeners();
    }

    static setupEventListeners() {
        this.setupInputModeToggle();
        this.setupExampleSelection();
        this.setupButtons();
        this.setupVisualizationMode();
        this.setupAlgorithmSelection();
        this.setupExampleEditing();
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

        const openTreeWindowBtn = document.getElementById('open-tree-window');
        if (openTreeWindowBtn) {
            openTreeWindowBtn.addEventListener('click', () => this.handleOpenTreeWindow());
        }

        this.setupTreeDisplayToggles();
    }

    static setupTreeDisplayToggles() {
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
            if (domRefs.depthControlGroup) {
                domRefs.depthControlGroup.classList.toggle('hidden', e.target.value !== 'limited-dfs');
            }
        });
        domRefs.depthControlGroup?.classList.add('hidden');
    }

    static setupExampleEditing() {
        const editBtn = document.getElementById('edit-example-btn');
        const saveBtn = document.getElementById('save-example-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const previewContent = document.getElementById('example-preview-content');
        const errorMessage = document.getElementById('edit-error-message');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                previewContent.contentEditable = 'true';
                previewContent.style.background = '#fffef0';
                previewContent.style.border = '2px solid #667eea';
                editBtn.classList.add('hidden');
                saveBtn.classList.remove('hidden');
                cancelBtn.classList.remove('hidden');
                errorMessage.classList.add('hidden');
                errorMessage.textContent = '';
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const exampleName = domRefs.exampleGraphSelect?.value;
                if (!exampleName) return;

                try {
                    const editedData = JSON.parse(previewContent.textContent);

                    // Validate the edited data
                    if (!editedData.graph || typeof editedData.graph !== 'object') {
                        throw new Error('Invalid graph structure. Must have a "graph" property.');
                    }

                    // Save the edited example
                    ExamplesManager.saveEditedExample(exampleName, editedData);

                    // Update the preview display
                    previewContent.textContent = JSON.stringify(editedData, null, 2);

                    // Update form fields with new values
                    if (editedData.start && domRefs.graphStart) {
                        domRefs.graphStart.value = editedData.start;
                    }
                    if (editedData.goal && domRefs.graphGoal) {
                        domRefs.graphGoal.value = Array.isArray(editedData.goal) ? editedData.goal.join(',') : editedData.goal;
                    }
                    if (editedData.treeDepth && domRefs.treeDepthInput) {
                        domRefs.treeDepthInput.value = editedData.treeDepth;
                    }

                    // Exit edit mode
                    previewContent.contentEditable = 'false';
                    previewContent.style.background = 'white';
                    previewContent.style.border = 'none';
                    editBtn.classList.remove('hidden');
                    saveBtn.classList.add('hidden');
                    cancelBtn.classList.add('hidden');
                    errorMessage.classList.add('hidden');
                    errorMessage.textContent = '';

                    // Show success message briefly
                    const tempSuccess = document.createElement('div');
                    tempSuccess.textContent = '✓ Changes saved successfully!';
                    tempSuccess.style.cssText = 'color: #2e7d32; background: #e8f5e9; padding: 8px; border-radius: 5px; margin-top: 10px; font-size: 0.85em;';
                    previewContent.parentElement.appendChild(tempSuccess);
                    setTimeout(() => tempSuccess.remove(), 3000);

                } catch (e) {
                    errorMessage.textContent = '❌ Error: ' + e.message + '. Please check your JSON syntax.';
                    errorMessage.classList.remove('hidden');
                    console.error('Error saving edited example:', e);
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                const exampleName = domRefs.exampleGraphSelect?.value;
                if (!exampleName) return;

                // Reload the original (or previously saved) example
                const example = ExamplesManager.getExample(exampleName);
                if (example) {
                    previewContent.textContent = JSON.stringify(example, null, 2);
                }

                // Exit edit mode
                previewContent.contentEditable = 'false';
                previewContent.style.background = 'white';
                previewContent.style.border = 'none';
                editBtn.classList.remove('hidden');
                saveBtn.classList.add('hidden');
                cancelBtn.classList.add('hidden');
                errorMessage.classList.add('hidden');
                errorMessage.textContent = '';
            });
        }
    }

    static handleInputModeChange(mode) {
        const showCustom = mode === 'custom';
        domRefs.customGraphCol?.classList.toggle('hidden', !showCustom);
        domRefs.predefinedGraphCol?.classList.toggle('hidden', showCustom);
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
        if (example.treeDepth && domRefs.treeDepthInput) {
            domRefs.treeDepthInput.value = example.treeDepth;
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
