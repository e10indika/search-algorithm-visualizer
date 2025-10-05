/**
 * Graph Builder
 * Builds and visualizes graph structures
 */

import { SVGRenderer } from './svg-renderer.js';

export class GraphBuilder {
    constructor(container) {
        this.container = container;
        this.graph = null;
        this.weights = null;
        this.positions = {};
        this.svg = null;
    }

    /**
     * Build and render the graph
     */
    buildGraph(graphData, startNode = null, goalNodes = []) {
        this.graph = graphData.graph;
        this.weights = graphData.weights || {};

        // Clear container
        this.container.innerHTML = '';

        // Calculate positions for nodes
        this.calculatePositions();

        // Create SVG
        this.svg = SVGRenderer.createSVG(800, 600);
        this.container.appendChild(this.svg);

        // Draw edges first (so they appear behind nodes)
        this.drawEdges();

        // Draw nodes
        this.drawNodes(startNode, goalNodes);

        return this.svg;
    }

    /**
     * Calculate positions for nodes using circular layout
     */
    calculatePositions() {
        const nodes = Object.keys(this.graph);
        const width = 800;
        const height = 600;
        const padding = 80;

        // Simple circular layout
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - padding;

        nodes.forEach((node, index) => {
            const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
            this.positions[node] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
    }

    /**
     * Draw all edges
     */
    drawEdges() {
        const drawn = new Set();

        Object.keys(this.graph).forEach(node => {
            const neighbors = this.graph[node];
            neighbors.forEach(neighbor => {
                const edgeKey1 = `${node}-${neighbor}`;
                const edgeKey2 = `${neighbor}-${node}`;

                // Avoid drawing duplicate edges for undirected graphs
                if (!drawn.has(edgeKey1) && !drawn.has(edgeKey2)) {
                    const pos1 = this.positions[node];
                    const pos2 = this.positions[neighbor];

                    if (pos1 && pos2) {
                        const weight = this.weights[edgeKey1] || this.weights[edgeKey2] || null;
                        SVGRenderer.drawEdge(
                            this.svg,
                            pos1.x,
                            pos1.y,
                            pos2.x,
                            pos2.y,
                            weight,
                            false
                        );
                        drawn.add(edgeKey1);
                        drawn.add(edgeKey2);
                    }
                }
            });
        });
    }

    /**
     * Draw all nodes
     */
    drawNodes(startNode, goalNodes) {
        Object.keys(this.positions).forEach(node => {
            const pos = this.positions[node];
            let nodeClass = 'node-circle';

            if (node === startNode) {
                nodeClass = 'node-circle start';
            } else if (goalNodes.includes(node)) {
                nodeClass = 'node-circle goal';
            }

            SVGRenderer.drawNode(this.svg, pos.x, pos.y, node, nodeClass);
        });
    }

    /**
     * Get node position
     */
    getNodePosition(node) {
        return this.positions[node];
    }

    /**
     * Update node visualization
     */
    updateNode(node, className) {
        SVGRenderer.updateNodeClass(this.svg, node, className);
    }

    /**
     * Highlight path
     */
    highlightPath(path) {
        SVGRenderer.highlightPath(this.svg, path);
    }

    /**
     * Clear the graph
     */
    clear() {
        if (this.svg) {
            SVGRenderer.clearSVG(this.svg);
        }
        this.container.innerHTML = '';
    }
}
