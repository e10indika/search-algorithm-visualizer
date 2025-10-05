/**
 * Tree Visualizer
 * Generates and visualizes complete state space trees
 */

import { SVGRenderer } from './svg-renderer.js';

export class TreeVisualizer {
    constructor(container) {
        this.container = container;
        this.svg = null;
        this.treeData = null;
        this.nodePositions = new Map();
    }

    /**
     * Generate and build the complete state space tree
     */
    buildTree(graphData, startNode, maxDepth = 4) {
        // Clear container
        this.container.innerHTML = '';

        // Generate tree structure
        this.treeData = this.generateStateSpaceTree(graphData.graph, startNode, maxDepth);

        // Calculate SVG dimensions based on tree size
        const { width, height } = this.calculateTreeDimensions(this.treeData, maxDepth);

        // Create SVG
        this.svg = SVGRenderer.createSVG(width, height);
        this.container.appendChild(this.svg);

        // Calculate node positions
        this.calculateTreeLayout(this.treeData, width / 2, 40, width, 0);

        // Draw tree
        this.drawTree(this.treeData);

        return this.svg;
    }

    /**
     * Generate state space tree using BFS
     */
    generateStateSpaceTree(graph, startNode, maxDepth) {
        const root = {
            id: `${startNode}-0`,
            label: startNode,
            path: [startNode],
            depth: 0,
            children: []
        };

        const queue = [root];
        let nodeCount = 0;

        while (queue.length > 0 && nodeCount < 1000) { // Limit to prevent infinite trees
            const currentNode = queue.shift();

            // Stop expanding if we've reached max depth
            if (currentNode.depth >= maxDepth) {
                continue;
            }

            const currentLabel = currentNode.label;
            const neighbors = graph[currentLabel] || [];

            neighbors.forEach(neighbor => {
                // Create child node
                const childPath = [...currentNode.path, neighbor];
                const childId = `${neighbor}-${nodeCount++}`;

                const child = {
                    id: childId,
                    label: neighbor,
                    path: childPath,
                    depth: currentNode.depth + 1,
                    parent: currentNode,
                    children: []
                };

                currentNode.children.push(child);
                queue.push(child);
            });
        }

        return root;
    }

    /**
     * Calculate tree dimensions
     */
    calculateTreeDimensions(tree, maxDepth) {
        const leafCount = this.countLeaves(tree);
        const width = Math.max(800, leafCount * 60);
        const height = Math.max(500, (maxDepth + 1) * 100);
        return { width, height };
    }

    /**
     * Count leaf nodes
     */
    countLeaves(node) {
        if (!node.children || node.children.length === 0) {
            return 1;
        }
        return node.children.reduce((sum, child) => sum + this.countLeaves(child), 0);
    }

    /**
     * Calculate tree layout positions (using Reingold-Tilford algorithm simplified)
     */
    calculateTreeLayout(node, x, y, width, index) {
        if (!node) return;

        // Store position
        this.nodePositions.set(node.id, { x, y, label: node.label });

        const childCount = node.children.length;
        if (childCount === 0) return;

        const childWidth = width / childCount;
        const childY = y + 80;

        node.children.forEach((child, i) => {
            const childX = x - width / 2 + childWidth * (i + 0.5);
            this.calculateTreeLayout(child, childX, childY, childWidth, i);
        });
    }

    /**
     * Draw the complete tree
     */
    drawTree(node) {
        if (!node) return;

        const pos = this.nodePositions.get(node.id);
        if (!pos) return;

        // Draw links to children first
        node.children.forEach(child => {
            const childPos = this.nodePositions.get(child.id);
            if (childPos) {
                SVGRenderer.drawTreeLink(this.svg, pos.x, pos.y, childPos.x, childPos.y);
            }
        });

        // Draw node
        const pathStr = node.path.join('→');
        SVGRenderer.drawTreeNode(this.svg, pos.x, pos.y, node.label, `d:${node.depth}`, 'tree-node');

        // Recursively draw children
        node.children.forEach(child => this.drawTree(child));
    }

    /**
     * Update tree node visualization
     */
    updateTreeNode(nodeId, className) {
        const node = this.svg.querySelector(`[data-node="${nodeId}"] circle`);
        if (node) {
            node.setAttribute('class', className);
        }
    }

    /**
     * Highlight node by label at specific depth
     */
    highlightNodeByLabel(label, depth = null) {
        // Find matching nodes in positions map
        for (const [id, pos] of this.nodePositions.entries()) {
            if (pos.label === label) {
                if (depth === null || id.includes(`-${depth}`)) {
                    this.updateTreeNode(id.split('-')[0], 'tree-node current');
                }
            }
        }
    }

    /**
     * Clear the tree
     */
    clear() {
        if (this.svg) {
            SVGRenderer.clearSVG(this.svg);
        }
        this.container.innerHTML = '';
        this.nodePositions.clear();
    }
}