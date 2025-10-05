/**
 * API Service
 */

import { CONFIG } from './config.js';

export class APIService {
    static async fetchExamples() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/examples/graph`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading examples:', error);
            throw error;
        }
    }

    static async searchGraph(requestData) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/search/graph`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error running graph search:', error);
            throw error;
        }
    }

    static async generateTree(requestData) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/generate-tree`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error generating tree:', error);
            throw error;
        }
    }

    static async checkHealth() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/health`);
            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
            return true;
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            alert(`Warning: Cannot connect to backend server at ${CONFIG.API_BASE_URL}\n\nPlease make sure the Flask server is running on port 5001.`);
            return false;
        }
    }
}

