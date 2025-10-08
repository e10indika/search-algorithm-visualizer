/**
 * Visualization Manager
 */

import { appState } from './state.js';
import { dom } from './dom.js';
import { Utils } from './utils.js';
import { UIBuilder } from './ui-builder.js';
import { GraphBuilder } from './graph-builder.js';
import { TreeVisualizer } from './tree-visualizer.js';
import { AnimationController } from './animation-controller.js';

export class VisualizationManager {
    static async visualize(graph, result) {
        appState.updateVisualization({
            mode: dom.visualizationModeSelect.value,
            animationDelay: parseInt(dom.animationSpeedSelect.value),
            result: result,
            currentStep: 0,
            isRunning: true
        });

        const start = dom.getInputValue(dom.graphStartInput);
        const goal = dom.getInputValue(dom.graphGoalInput);

        // Clear containers
        dom.graphContainer.innerHTML = '';
        dom.treeContainer.innerHTML = '';

        // Add titles
        dom.graphContainer.appendChild(UIBuilder.createTitle('📊 Graph Visualization'));
        dom.treeContainer.appendChild(UIBuilder.createTitle('🌳 State Space Tree'));

        // Build graph
        const graphBuilder = new GraphBuilder(dom.graphContainer, graph, start, goal);
        const graphElements = graphBuilder.build();

        // Add status div
        const statusDiv = UIBuilder.createStatusDiv();
        dom.graphContainer.appendChild(statusDiv);

        // Add manual controls if needed
        if (appState.visualization.mode === 'manual') {
            const controls = UIBuilder.createManualControls();
            dom.graphContainer.appendChild(controls);
        }

        // Initialize tree
        const treeViz = new TreeVisualizer(dom.treeContainer, result, start, goal);
        const treeElements = treeViz.initialize();

        // Store context
        const context = {
            ...graphElements,
            statusDiv,
            treeViz,
            result,
            graph,
            start,
            goal
        };

        appState.updateVisualization({ context });

        // Calculate total steps
        const visitedSteps = result.visited ? result.visited.length : 0;
        const pathSteps = result.path ? result.path.length : 0;
        appState.updateVisualization({ totalSteps: visitedSteps + pathSteps });

        if (appState.visualization.mode === 'manual') {
            this.setupManualMode();
        } else {
            await this.runAutoMode();
        }
    }

    static setupManualMode() {
        document.getElementById('total-steps').textContent = appState.visualization.totalSteps;
        document.getElementById('current-step').textContent = '0';

        document.getElementById('next-step-btn').addEventListener('click', () => this.executeNextStep());
        document.getElementById('play-auto-btn').addEventListener('click', () => this.playAutoFromCurrent());
        document.getElementById('reset-viz-btn').addEventListener('click', async () => {
            appState.resetVisualization();
            const { SearchController } = await import('./search-controller.js');
            SearchController.runSearch();
        });
    }

    static async runAutoMode() {
        const animator = new AnimationController(appState.visualization.context);
        const { result } = appState.visualization;

        // Animate visited nodes
        if (result.visited) {
            for (let i = 0; i < result.visited.length; i++) {
                if (!appState.visualization.isRunning) break;
                await animator.animateVisitNode(result.visited[i], i);
                await Utils.sleep(appState.visualization.animationDelay);
            }
        }

        await Utils.sleep(500);

        // Animate path
        if (result.path && appState.visualization.isRunning) {
            for (let i = 0; i < result.path.length; i++) {
                if (!appState.visualization.isRunning) break;
                await animator.animatePathNode(i);
                await Utils.sleep(appState.visualization.animationDelay);
            }
        }

        appState.updateVisualization({ isRunning: false });
    }

    static async executeNextStep() {
        const { currentStep, totalSteps, context, result } = appState.visualization;

        if (currentStep >= totalSteps) return;

        const animator = new AnimationController(context);
        const visitedLength = result.visited ? result.visited.length : 0;

        if (currentStep < visitedLength) {
            await animator.animateVisitNode(result.visited[currentStep], currentStep);
        } else {
            const pathIndex = currentStep - visitedLength;
            await animator.animatePathNode(pathIndex);
        }

        appState.updateVisualization({ currentStep: currentStep + 1 });
        document.getElementById('current-step').textContent = currentStep + 1;
    }

    static async playAutoFromCurrent() {
        appState.updateVisualization({ mode: 'auto', isRunning: true });
        const controls = document.getElementById('manual-controls');
        if (controls) controls.style.display = 'none';

        const animator = new AnimationController(appState.visualization.context);
        const { currentStep, totalSteps, result } = appState.visualization;
        const visitedLength = result.visited ? result.visited.length : 0;

        // Continue from current step
        for (let i = currentStep; i < totalSteps; i++) {
            if (!appState.visualization.isRunning) break;

            if (i < visitedLength) {
                await animator.animateVisitNode(result.visited[i], i);
            } else {
                const pathIndex = i - visitedLength;
                await animator.animatePathNode(pathIndex);
            }

            await Utils.sleep(appState.visualization.animationDelay);
            appState.updateVisualization({ currentStep: i + 1 });
        }

        appState.updateVisualization({ isRunning: false });
    }
}