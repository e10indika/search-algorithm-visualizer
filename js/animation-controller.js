/**
 * Animation Controller
 */

import { CONFIG } from './config.js';
import { Utils } from './utils.js';
import { SVGRenderer } from './svg-renderer.js';
import { UIBuilder } from './ui-builder.js';
import { dom } from './dom.js';

export class AnimationController {
    constructor(context) {
        this.ctx = context;
    }

    async animateVisitNode(node, index) {
        const { nodeElements, statusDiv, treeViz, result, start, goal } = this.ctx;
        const nodeEl = nodeElements[node];

        statusDiv.innerHTML = `📊 Algorithm: ${result.algorithm}<br>👀 Visiting node: <strong>${node}</strong> (${index + 1}/${result.visited.length})`;

        if (nodeEl && node !== start && node !== goal) {
            nodeEl.setAttribute('fill', CONFIG.COLORS.VISITED_NODE);
            nodeEl.setAttribute('stroke', CONFIG.COLORS.VISITED_STROKE);
            nodeEl.setAttribute('stroke-width', '3');

            // Pulse animation
            nodeEl.setAttribute('r', CONFIG.SVG_DIMENSIONS.NODE_RADIUS + 5);
            await Utils.sleep(CONFIG.ANIMATION.PULSE_DURATION);
            nodeEl.setAttribute('r', CONFIG.SVG_DIMENSIONS.NODE_RADIUS);
        }

        await treeViz.updateNode(node);
    }

    async animatePathNode(pathIndex) {
        const { nodeElements, edgeElements, nodePositions, statusDiv, treeViz, result, svg, start, goal } = this.ctx;

        if (!result.path || pathIndex >= result.path.length) return;

        const node = result.path[pathIndex];
        const nodeEl = nodeElements[node];

        if (pathIndex === 0) {
            statusDiv.innerHTML = `✅ Path found! Highlighting the solution path...`;
            await Utils.sleep(300);
        }

        if (nodeEl && node !== start && node !== goal) {
            nodeEl.setAttribute('fill', CONFIG.COLORS.PATH_NODE);
            nodeEl.setAttribute('stroke', CONFIG.COLORS.PATH_STROKE);
            nodeEl.setAttribute('stroke-width', '4');

            // Pulse animation
            nodeEl.setAttribute('r', CONFIG.SVG_DIMENSIONS.NODE_RADIUS + 7);
            await Utils.sleep(150);
            nodeEl.setAttribute('r', CONFIG.SVG_DIMENSIONS.NODE_RADIUS);
        }

        // Highlight edge to next node
        if (pathIndex < result.path.length - 1) {
            const nextNode = result.path[pathIndex + 1];
            const edgeKey = Utils.getEdgeKey(node, nextNode);
            const edgeEl = edgeElements[edgeKey];

            if (edgeEl) {
                edgeEl.setAttribute('stroke', CONFIG.COLORS.PATH_STROKE);
                edgeEl.setAttribute('stroke-width', '4');
                edgeEl.setAttribute('opacity', '1');

                const pos1 = nodePositions[node];
                const pos2 = nodePositions[nextNode];
                SVGRenderer.drawArrow(svg, pos1, pos2);
            }

            statusDiv.innerHTML = `🎯 Path: ${result.path.slice(0, pathIndex + 2).join(' → ')}`;
        }

        treeViz.highlightPath(result.path);

        if (pathIndex === result.path.length - 1) {
            this.displayFinalResults();
        }
    }

    displayFinalResults() {
        const { statusDiv, result, graph } = this.ctx;

        statusDiv.innerHTML = `✅ <strong>Success!</strong> Path found: ${result.path.join(' → ')}`;
        statusDiv.style.background = '#c8e6c9';

        UIBuilder.displayResults(result);
        this.addLegendAndInfo(graph, result);
    }

    addLegendAndInfo(graph, result) {
        const legendItems = [
            { color: CONFIG.COLORS.START_NODE, borderColor: CONFIG.COLORS.START_NODE, label: 'Start Node' },
            { color: CONFIG.COLORS.GOAL_NODE, borderColor: CONFIG.COLORS.GOAL_NODE, label: 'Goal Node' },
            { color: CONFIG.COLORS.VISITED_NODE, borderColor: CONFIG.COLORS.VISITED_STROKE, label: 'Visited Node' },
            { color: CONFIG.COLORS.PATH_NODE, borderColor: CONFIG.COLORS.PATH_STROKE, label: 'Path Node' },
            { color: CONFIG.COLORS.PATH_STROKE, borderColor: CONFIG.COLORS.PATH_STROKE,
              label: 'Path Edge', width: '30px', height: '3px', borderRadius: '0' }
        ];

        dom.graphContainer.appendChild(UIBuilder.createLegend(legendItems));

        // Add adjacency list
        const path = new Set(result.path || []);
        const nodes = Object.keys(graph);
        const adjList = document.createElement('div');
        adjList.style.marginTop = '20px';
        adjList.style.padding = '15px';
        adjList.style.background = '#f8f9fa';
        adjList.style.borderRadius = '8px';
        adjList.innerHTML = '<h4>Adjacency List</h4><ul style="columns: 2; margin-top: 10px;">';

        nodes.forEach(node => {
            const className = path.has(node) ? 'style="color: #ffa500; font-weight: bold;"' : '';
            adjList.innerHTML += `<li ${className}><strong>${node}:</strong> [${graph[node].join(', ')}]</li>`;
        });

        adjList.innerHTML += '</ul>';
        dom.graphContainer.appendChild(adjList);

        // Add tree legend
        const treeLegend = document.createElement('div');
        treeLegend.className = 'tree-info';
        treeLegend.style.marginTop = '15px';
        treeLegend.innerHTML = `
            <h4>State Space Tree Legend</h4>
            <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                <strong>Real-time Exploration:</strong> Nodes appear as they are discovered during traversal.
            </p>
        `;
        dom.treeContainer.appendChild(treeLegend);
    }
}

