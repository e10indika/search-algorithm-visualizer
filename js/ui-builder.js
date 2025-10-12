/**
 * UI Component Builders
 */

import { dom } from './dom.js';

export class UIBuilder {
    static createTitle(text) {
        const title = document.createElement('h3');
        title.textContent = text;
        title.style.textAlign = 'center';
        title.style.marginBottom = '15px';
        title.style.color = '#333';
        return title;
    }

    static createStatusDiv() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'traversal-status';
        statusDiv.style.marginTop = '15px';
        statusDiv.style.padding = '15px';
        statusDiv.style.background = '#e3f2fd';
        statusDiv.style.borderRadius = '8px';
        statusDiv.style.fontWeight = 'bold';
        statusDiv.style.fontSize = '1.1em';
        statusDiv.style.textAlign = 'center';
        statusDiv.innerHTML = '🚀 Starting algorithm...';
        return statusDiv;
    }

    static createManualControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'manual-controls';
        controlsDiv.style.marginTop = '15px';
        controlsDiv.style.padding = '15px';
        controlsDiv.style.background = '#fff3cd';
        controlsDiv.style.borderRadius = '8px';
        controlsDiv.style.textAlign = 'center';
        controlsDiv.innerHTML = `
            <h4 style="margin-top: 0; color: #856404;">Manual Mode Controls</h4>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button id="next-step-btn" class="btn btn-primary" style="padding: 10px 20px;">
                    ▶ Next Step
                </button>
                <button id="play-auto-btn" class="btn btn-success" style="padding: 10px 20px;">
                    ⏩ Play Auto
                </button>
                <button id="reset-viz-btn" class="btn btn-secondary" style="padding: 10px 20px;">
                    🔄 Reset
                </button>
            </div>
            <p style="margin-top: 10px; margin-bottom: 0; color: #856404; font-size: 0.9em;">
                Step <span id="current-step">0</span> of <span id="total-steps">0</span>
            </p>
        `;
        return controlsDiv;
    }

    static createLegend(items) {
        const legend = document.createElement('div');
        legend.style.marginTop = '20px';
        legend.style.padding = '15px';
        legend.style.background = '#f8f9fa';
        legend.style.borderRadius = '8px';

        let html = '<h4 style="margin-bottom: 10px;">Graph Legend</h4>';
        html += '<div style="display: flex; gap: 20px; flex-wrap: wrap;">';

        items.forEach(item => {
            html += `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: ${item.width || '20px'}; height: ${item.height || '20px'}; 
                                background: ${item.color}; border-radius: ${item.borderRadius || '50%'}; 
                                border: 2px solid ${item.borderColor || item.color};"></div>
                    <span>${item.label}</span>
                </div>
            `;
        });

        html += '</div>';
        legend.innerHTML = html;
        return legend;
    }

    static displayResults(result) {
        const algorithm = dom.graphAlgorithmSelect.value.toUpperCase();
        const pathStr = result.path ? result.path.join(' → ') : 'No path found';
        const visitedStr = result.visited ? result.visited.join(', ') : 'None';

        dom.graphStatsDiv.innerHTML = `
            <h3>Search Results</h3>
            <p><strong>Algorithm:</strong> ${result.algorithm || algorithm}</p>
            <p><strong>Success:</strong> ${result.success ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Path:</strong> ${pathStr}</p>
            <p><strong>Path Length:</strong> ${result.path ? result.path.length : 0} nodes</p>
            <p><strong>Nodes Visited:</strong> ${result.visited ? result.visited.length : 0}</p>
            <p><strong>Visited Order:</strong> ${visitedStr}</p>
            ${result.cost !== undefined ? `<p><strong>Total Cost:</strong> ${result.cost}</p>` : ''}
            ${result.distance !== undefined ? `<p><strong>Distance:</strong> ${result.distance}</p>` : ''}
        `;
    }
}

