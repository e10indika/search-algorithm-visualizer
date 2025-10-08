/**
 * DOM Elements Manager
 */

export class DOMElements {
    constructor() {
        this.graphAlgorithmSelect = this.getElement('graph-algorithm');
        this.visualizationModeSelect = this.getElement('visualization-mode');
        this.animationSpeedSelect = this.getElement('animation-speed');
        this.exampleGraphSelect = this.getElement('example-graph');
        this.graphStartInput = this.getElement('graph-start');
        this.graphGoalInput = this.getElement('graph-goal');
        this.graphInput = this.getElement('graph-input');
        this.weightsInput = this.getElement('weights-input');
        this.heuristicInput = this.getElement('heuristic-input');
        this.startGraphButton = this.getElement('start-search');
        this.generateTreeButton = this.getElement('draw-graph');
        this.clearGraphButton = this.getElement('clear-results');
        this.treeDepthInput = this.getElement('tree-depth');
        this.graphStatsDiv = this.getElement('graph-stats');
        this.graphContainer = this.getElement('graph-container');
        this.treeContainer = this.getElement('state-space-tree-container');
    }

    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    getInputValue(element) {
        return element ? element.value.trim() : '';
    }

    parseJSONInput(element, defaultValue = {}) {
        try {
            const value = this.getInputValue(element);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('JSON parse error:', e);
            return defaultValue;
        }
    }
}

export const dom = new DOMElements();

/**
 * DOM Element References
 */

export const domRefs = {
    // Input mode toggle
    inputModeRadios: document.querySelectorAll('input[name="input-mode"]'),
    customGraphCol: document.getElementById('custom-graph-col'),
    predefinedGraphCol: document.getElementById('predefined-graph-col'),

    // Input fields
    graphInput: document.getElementById('graph-input'),
    weightsInput: document.getElementById('weights-input'),
    heuristicInput: document.getElementById('heuristic-input'),
    exampleGraphSelect: document.getElementById('example-graph'),
    examplePreview: document.getElementById('example-preview'),
    examplePreviewContent: document.getElementById('example-preview-content'),
    graphStart: document.getElementById('graph-start'),
    graphGoal: document.getElementById('graph-goal'),

    // Buttons
    drawGraphButton: document.getElementById('draw-graph'),
    startSearchButton: document.getElementById('start-search'),
    clearResultsButton: document.getElementById('clear-results'),
    manualActionButton: document.getElementById('manual-action'),

    // Visualization containers
    graphContainer: document.getElementById('graph-container'),
    stateSpaceTreeContainer: document.getElementById('state-space-tree-container'),

    // Node lists
    openedListGraph: document.getElementById('opened-list-graph'),
    closedListGraph: document.getElementById('closed-list-graph'),
    openedListTree: document.getElementById('opened-list-tree'),
    closedListTree: document.getElementById('closed-list-tree'),

    // Controls
    graphAlgorithmSelect: document.getElementById('graph-algorithm'),
    visualizationModeSelect: document.getElementById('visualization-mode'),
    animationSpeedSelect: document.getElementById('animation-speed'),
    treeDepthInput: document.getElementById('tree-depth'),
    speedControlGroup: document.getElementById('speed-control-group'),

    // Results
    graphStats: document.getElementById('graph-stats'),
    traversalList: document.getElementById('traversal-list'),
    pathList: document.getElementById('path-list'),
    statsList: document.getElementById('stats-list'),

    // Legacy references (for backward compatibility)
    startGraphButton: document.getElementById('start-search'),
    clearGraphButton: document.getElementById('clear-results'),
    generateTreeButton: document.getElementById('draw-graph')
};
