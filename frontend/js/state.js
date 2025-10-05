/**
 * State Management
 */

export class AppState {
    constructor() {
        this.examplesData = null;
        this.visualization = {
            mode: 'auto',
            currentStep: 0,
            totalSteps: 0,
            isPaused: false,
            result: null,
            animationDelay: 500,
            isRunning: false,
            context: null
        };
    }

    updateVisualization(updates) {
        this.visualization = { ...this.visualization, ...updates };
    }

    resetVisualization() {
        this.visualization = {
            ...this.visualization,
            currentStep: 0,
            isPaused: false,
            isRunning: false
        };
    }
}

export const appState = new AppState();

