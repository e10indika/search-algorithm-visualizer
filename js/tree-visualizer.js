/**
 * Tree Visualizer
 * Generates and visualizes complete state space trees with zoom and pan controls
 */

import {SVGRenderer} from './svg-renderer.js';

export class TreeVisualizer {
    static CONSTANTS = {
        MIN_WIDTH: 800,
        MIN_HEIGHT: 500,
        NODE_SPACING: 60,
        LEVEL_HEIGHT: 80,
        VERTICAL_PADDING: 40,
        LEVEL_SPACING: 100,
        ZOOM_IN_FACTOR: 1.2,
        ZOOM_OUT_FACTOR: 0.8,
        POSITION_TOLERANCE: 2
    };

    constructor(container) {
        this.container = container;
        this.svg = null;
        this.treeData = null;
        this.nodePositions = new Map();
        this.dragState = {
            isDragging: false,
            start: {x: 0, y: 0},
            viewBoxStart: []
        };
        this.showWeights = true;
        this.showHeuristics = true;
        this.goalNodeCounter = new Map(); // Track occurrences of goal nodes
    }

    buildTree(graphData, startNode, maxDepth = 4, goalNodes = [], options = {}) {
        this.clear();

        this.weights = options.weights || {};
        this.heuristic = options.heuristic || {};
        this.costs = options.costs || {};
        this.startNode = startNode;
        this.goalNodes = goalNodes;
        this.showWeights = options.showWeights !== undefined ? options.showWeights : true;
        this.showHeuristics = options.showHeuristics !== undefined ? options.showHeuristics : true;
        this.goalNodeCounter.clear(); // Reset counter for new tree

        this.treeData = this.generateSearchTree(graphData.graph, startNode, maxDepth, goalNodes);
        const {width, height} = this.calculateTreeDimensions(this.treeData, maxDepth);

        this.svg = SVGRenderer.createSVG(width, height);
        this.container.appendChild(this.svg);
        this.addZoomControls();

        this.computeSubtreeSizes(this.treeData);
        this.calculateTreeLayout(this.treeData, width / 2, TreeVisualizer.CONSTANTS.VERTICAL_PADDING, width);
        this.drawTree(this.treeData);

        // Adjust layout based on tree size
        this.adjustLayoutForTreeSize(width, height);

        return this.svg;
    }

    adjustLayoutForTreeSize(width, height) {
        const container = document.getElementById('visualization-container');
        const graphCol = document.getElementById('graph-viz-col');
        const treeCol = document.getElementById('tree-viz-col');
        const graphContainer = document.getElementById('graph-container');
        const treeContainer = document.getElementById('state-space-tree-container');

        if (!container || !graphCol || !treeCol) return;

        // Calculate if tree is "large"
        // Large tree: width > 1200px OR height > 600px OR (width > 800 AND height > 400)
        const isLargeTree = width > 1200 || height > 600 || (width > 800 && height > 400);

        if (isLargeTree) {
            // Stack vertically - tree below graph
            container.style.flexDirection = 'column';
            container.style.flexWrap = 'nowrap';
            graphCol.style.width = '100%';
            graphCol.style.minWidth = '100%';
            graphCol.style.maxWidth = '100%';
            graphCol.style.flex = 'none';
            treeCol.style.width = '100%';
            treeCol.style.minWidth = '100%';
            treeCol.style.maxWidth = '100%';
            treeCol.style.flex = 'none';

            // Scroll tree into view smoothly
            setTimeout(() => {
                this.container.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        } else {
            // Side-by-side layout - properly reset all properties
            container.style.flexDirection = 'row';
            container.style.flexWrap = 'wrap';
            graphCol.style.width = '';
            graphCol.style.minWidth = '';
            graphCol.style.maxWidth = '';
            graphCol.style.flex = '1';
            treeCol.style.width = '';
            treeCol.style.minWidth = '';
            treeCol.style.maxWidth = '';
            treeCol.style.flex = '1';

            // Clear the minWidth/minHeight set by syncVisualizationSizes
            if (graphContainer) {
                graphContainer.style.minWidth = '';
                graphContainer.style.minHeight = '';
            }
            if (treeContainer) {
                treeContainer.style.minWidth = '';
                treeContainer.style.minHeight = '';
            }
        }
    }

    addZoomControls() {
        this.container.addEventListener('mouseenter', () => this.showZoomControls());
        this.container.addEventListener('mouseleave', () => this.hideZoomControls());
    }

    showZoomControls() {
        if (this.container.querySelector('.zoom-controls')) return;

        const zoomControls = this.createZoomControlsElement();
        this.container.prepend(zoomControls);
        this.setupDragPan();
    }

    createZoomControlsElement() {
        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';

        const buttons = [
            {text: '+', title: 'Zoom In', factor: TreeVisualizer.CONSTANTS.ZOOM_IN_FACTOR},
            {text: '−', title: 'Zoom Out', factor: TreeVisualizer.CONSTANTS.ZOOM_OUT_FACTOR}
        ];

        buttons.forEach(({text, title, factor}) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.title = title;
            btn.onclick = () => this.zoom(factor);
            zoomControls.appendChild(btn);
        });

        return zoomControls;
    }

    hideZoomControls() {
        this.container.querySelector('.zoom-controls')?.remove();
        this.cleanupDragPan();
    }

    setupDragPan() {
        if (!this.svg) return;

        this.svg.style.cursor = 'grab';
        this.svg.onmousedown = (e) => this.handleDragStart(e);
        window.onmousemove = (e) => this.handleDragMove(e);
        window.onmouseup = () => this.handleDragEnd();
    }

    cleanupDragPan() {
        if (this.svg) {
            this.svg.onmousedown = null;
            window.onmousemove = null;
            window.onmouseup = null;
            this.svg.style.cursor = '';
        }
    }

    handleDragStart(e) {
        this.dragState.isDragging = true;
        this.svg.style.cursor = 'grabbing';
        this.dragState.start = {x: e.clientX, y: e.clientY};

        const viewBox = this.getViewBox();
        this.dragState.viewBoxStart = viewBox.split(' ').map(Number);
        e.preventDefault();
    }

    handleDragMove(e) {
        if (!this.dragState.isDragging) return;

        const dx = e.clientX - this.dragState.start.x;
        const dy = e.clientY - this.dragState.start.y;
        const [x, y, w, h] = this.dragState.viewBoxStart;

        const scaleX = w / this.svg.width.baseVal.value;
        const scaleY = h / this.svg.height.baseVal.value;
        const newX = Math.max(0, Math.min(x - dx * scaleX, this.svg.width.baseVal.value - w));
        const newY = Math.max(0, Math.min(y - dy * scaleY, this.svg.height.baseVal.value - h));

        this.svg.setAttribute('viewBox', `${newX} ${newY} ${w} ${h}`);
    }

    handleDragEnd() {
        this.dragState.isDragging = false;
        if (this.svg) this.svg.style.cursor = 'grab';
    }

    getViewBox() {
        return this.svg.getAttribute('viewBox') ||
            `0 0 ${this.svg.width.baseVal.value} ${this.svg.height.baseVal.value}`;
    }

    zoom(factor) {
        if (!this.svg) return;

        const [x, y, w, h] = this.getViewBox().split(' ').map(Number);
        const cx = x + w / 2;
        const cy = y + h / 2;
        const newW = w / factor;
        const newH = h / factor;

        this.svg.setAttribute('viewBox', `${cx - newW / 2} ${cy - newH / 2} ${newW} ${newH}`);
    }

    generateSearchTree(graph, startNode, maxDepth, goalNodes = []) {
        const root = this.createTreeNode(startNode, 0, [startNode]);
        const queue = [root];

        while (queue.length > 0) {
            const currentNode = queue.shift();

            if (goalNodes.includes(currentNode.label) || currentNode.depth >= maxDepth) {
                continue;
            }

            const neighbors = graph[currentNode.label] || [];
            neighbors.forEach(neighbor => {
                const child = this.createChildNode(currentNode, neighbor);
                currentNode.children.push(child);

                if (!child.label.includes('(loop)')) {
                    queue.push(child);
                }
            });
        }

        return root;
    }

    createTreeNode(label, depth, path) {
        return {
            id: `${label}-${depth}`,
            label,
            path,
            depth,
            children: []
        };
    }

    createChildNode(parent, neighbor) {
        const childDepth = parent.depth + 1;
        const isLoop = parent.path.includes(neighbor);
        const childPath = [...parent.path, neighbor];

        return {
            id: `${parent.path.join('')}#${neighbor}-${isLoop ? 'loop-' : ''}${childDepth}`,
            label: isLoop ? `${neighbor} (loop)` : neighbor,
            path: childPath,
            depth: childDepth,
            parent,
            children: []
        };
    }

    calculateTreeDimensions(tree, maxDepth) {
        const leafCount = this.countLeaves(tree);
        return {
            width: Math.max(TreeVisualizer.CONSTANTS.MIN_WIDTH, leafCount * TreeVisualizer.CONSTANTS.NODE_SPACING),
            height: Math.max(TreeVisualizer.CONSTANTS.MIN_HEIGHT, (maxDepth + 1) * TreeVisualizer.CONSTANTS.LEVEL_SPACING)
        };
    }

    countLeaves(node) {
        if (!node.children?.length) return 1;
        return node.children.reduce((sum, child) => sum + this.countLeaves(child), 0);
    }

    computeSubtreeSizes(node) {
        if (!node.children?.length) {
            node.subtreeSize = 1;
            return 1;
        }
        node.subtreeSize = node.children.reduce((sum, child) => sum + this.computeSubtreeSizes(child), 0);
        return node.subtreeSize;
    }

    calculateTreeLayout(node, x, y, totalWidth) {
        if (!node) return;

        this.nodePositions.set(node.id, {x, y, label: node.label});

        if (!node.children?.length) return;

        const spacing = totalWidth / node.children.reduce((sum, c) => sum + c.subtreeSize, 0);
        let currentX = x - totalWidth / 2;
        const childY = y + TreeVisualizer.CONSTANTS.LEVEL_HEIGHT;

        node.children.forEach(child => {
            const childWidth = spacing * child.subtreeSize;
            const childCenterX = currentX + childWidth / 2;
            this.calculateTreeLayout(child, childCenterX, childY, childWidth);
            currentX += childWidth;
        });
    }

    drawTree(node, parentLabel = null) {
        if (!node) return;

        const pos = this.nodePositions.get(node.id);
        if (!pos) return;

        // Draw links to children with weights
        node.children.forEach(child => {
            const childPos = this.nodePositions.get(child.id);
            if (childPos) {
                // Get the weight for this edge
                const childLabel = child.label.replace(' (loop)', '');
                const weight = this.getEdgeWeight(node.label, childLabel);
                SVGRenderer.drawTreeLink(this.svg, pos.x, pos.y, childPos.x, childPos.y, weight);
            }
        });

        // Get heuristic value for this node
        const cleanLabel = node.label.replace(' (loop)', '');
        const hValue = this.heuristic && cleanLabel in this.heuristic ? this.heuristic[cleanLabel] : null;

        // Calculate node information to display (now empty)
        const nodeInfo = this.getNodeInfo(node);

        // Determine initial node class based on whether it's start or goal
        let nodeClass = 'tree-node';
        let displayLabel = node.label;

        // Check if this is a goal node and add sequence number
        if (this.goalNodes && this.goalNodes.includes(cleanLabel)) {
            nodeClass = 'tree-node goal';

            // Increment counter for this goal node
            if (!this.goalNodeCounter.has(cleanLabel)) {
                this.goalNodeCounter.set(cleanLabel, 0);
            }
            const count = this.goalNodeCounter.get(cleanLabel) + 1;
            this.goalNodeCounter.set(cleanLabel, count);

            // Add sequence number to the display label
            displayLabel = node.label.includes(' (loop)')
                ? `${cleanLabel}${count} (loop)`
                : `${cleanLabel}${count}`;
        } else if (node.label === this.startNode) {
            nodeClass = 'tree-node start';
        }

        const nodeGroup = SVGRenderer.drawTreeNodeWithHeuristic(
            this.svg,
            pos.x,
            pos.y,
            displayLabel,
            nodeInfo,
            nodeClass,
            hValue
        );
        nodeGroup.setAttribute('data-node', node.id);

        node.children.forEach(child => this.drawTree(child, node.label));
    }

    getEdgeWeight(fromNode, toNode) {
        if (!this.weights || Object.keys(this.weights).length === 0) {
            return null;
        }

        const weight = this.weights[`${fromNode},${toNode}`] ||
            this.weights[`${toNode},${fromNode}`] ||
            1;
        return weight;
    }

    getNodeInfo(node) {
        // No longer displaying g, h, f values as separate info text
        return '';
    }

    highlightOpenedNodes(openedList) {
        if (!Array.isArray(openedList)) return;

        openedList.forEach(nodeId => {
            const circle = this.svg?.querySelector(`[data-node="${nodeId}"] circle`);
            if (circle) circle.setAttribute('class', 'tree-node opened');
        });
    }

    highlightClosedNodes(closedList) {
        if (!Array.isArray(closedList)) return;

        closedList.forEach(nodeId => {
            const circle = this.svg?.querySelector(`[data-node="${nodeId}"] circle`);
            if (circle && !circle.classList.contains('path')) {
                circle.setAttribute('class', 'tree-node visited');
            }
        });
    }

    highlightPath(path) {
        if (!path?.length) return;

        const pathNodeIds = this.findPathInTree(path);
        if (!pathNodeIds.length) return;

        this.highlightPathNodes(pathNodeIds);
        this.highlightPathEdges(pathNodeIds);
    }

    highlightPathNodes(pathNodeIds) {
        pathNodeIds.forEach(nodeId => {
            const circle = this.svg?.querySelector(`[data-node="${nodeId}"] circle`);
            if (circle) circle.setAttribute('class', 'tree-node path');
        });
    }

    highlightPathEdges(pathNodeIds) {
        for (let i = 0; i < pathNodeIds.length - 1; i++) {
            const pos1 = this.nodePositions.get(pathNodeIds[i]);
            const pos2 = this.nodePositions.get(pathNodeIds[i + 1]);

            if (pos1 && pos2) {
                this.highlightEdgeBetweenPositions(pos1, pos2);
            }
        }
    }

    highlightEdgeBetweenPositions(pos1, pos2) {
        const tolerance = TreeVisualizer.CONSTANTS.POSITION_TOLERANCE;

        this.svg.querySelectorAll('line.tree-link').forEach(link => {
            const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map(attr =>
                parseFloat(link.getAttribute(attr))
            );

            const connects =
                Math.abs(x1 - pos1.x) < tolerance &&
                Math.abs(y1 - pos1.y - 20) < tolerance &&
                Math.abs(x2 - pos2.x) < tolerance &&
                Math.abs(y2 - pos2.y + 20) < tolerance;

            if (connects) {
                link.setAttribute('class', 'tree-link path');
            }
        });
    }

    findPathInTree(searchPath) {
        if (!this.treeData || !searchPath?.length) return [];

        const pathNodeIds = [];

        const findPath = (node, targetPath, currentIndex) => {
            if (!node || node.label !== targetPath[currentIndex]) return false;

            pathNodeIds.push(node.id);

            if (currentIndex === targetPath.length - 1) return true;

            for (const child of node.children) {
                if (findPath(child, targetPath, currentIndex + 1)) return true;
            }

            pathNodeIds.pop();
            return false;
        };

        findPath(this.treeData, searchPath, 0);
        return pathNodeIds;
    }

    clear() {
        if (this.svg) SVGRenderer.clearSVG(this.svg);
        this.container.innerHTML = '';
        this.nodePositions.clear();
    }

    // Reset all tree edge highlights to default
    resetEdgeHighlights() {
        if (!this.svg) return;

        // Reset all tree links to default
        this.svg.querySelectorAll('line.tree-link').forEach(link => {
            link.setAttribute('class', 'tree-link');
        });

        // Also reset any edge-line paths (in case they were highlighted)
        this.svg.querySelectorAll('line.edge-line').forEach(link => {
            link.setAttribute('class', 'edge-line');
        });
    }

    // Toggle visibility of weights on edges
    toggleWeights(show) {
        this.showWeights = show;
        if (!this.svg) return;

        const weightLabels = this.svg.querySelectorAll('.tree-weight-label, .tree-weight-bg');
        weightLabels.forEach(label => {
            label.style.display = show ? '' : 'none';
        });
    }

    // Toggle visibility of heuristic values in node info
    toggleHeuristics(show) {
        this.showHeuristics = show;
        if (!this.svg) return;

        // Re-render all node info text
        this.updateNodeInfoVisibility();
    }

    // Update node info text based on current visibility settings
    updateNodeInfoVisibility() {
        if (!this.svg || !this.treeData) return;

        const updateNodeInfo = (node) => {
            if (!node) return;

            const nodeGroup = this.svg.querySelector(`[data-node="${node.id}"]`);
            if (nodeGroup) {
                const infoText = nodeGroup.querySelector('.tree-info-text');
                if (infoText) {
                    const newInfo = this.getNodeInfoFiltered(node);
                    infoText.textContent = newInfo;
                }
            }

            node.children.forEach(child => updateNodeInfo(child));
        };

        updateNodeInfo(this.treeData);
    }

    // Get filtered node info based on visibility settings
    getNodeInfoFiltered(node) {
        // No longer displaying g, h, f values as separate info text
        return '';
    }

    // Create a standalone version of the tree for opening in a new window
    getTreeHTML() {
        if (!this.svg) return null;

        const svgClone = this.svg.cloneNode(true);
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Tree - Standalone View</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 95vw;
            overflow: auto;
        }
        h1 {
            text-align: center;
            color: #667eea;
            margin-bottom: 20px;
        }
        svg {
            display: block;
            margin: 0 auto;
        }
        .tree-node {
            fill: #fff;
            stroke: #999;
            stroke-width: 2;
            transition: all 0.3s;
        }
        .tree-node.start {
            fill: #FFD700;
            stroke: #FFA500;
            stroke-width: 3;
        }
        .tree-node.goal {
            fill: #90EE90;
            stroke: #4CAF50;
            stroke-width: 3;
        }
        .tree-node.visited {
            fill: #bc89ad;
            stroke: #2196F3;
            stroke-width: 2;
        }
        .tree-node.path {
            fill: #4CAF50;
            stroke: #2E7D32;
            stroke-width: 3;
        }
        .tree-node.current {
            fill: #FF6B6B;
            stroke: #C92A2A;
            stroke-width: 3;
        }
        .tree-node.opened {
            stroke: #1976D2;
            stroke-width: 4;
            fill: #77a6d5;
        }
        .tree-link {
            stroke: #ccc;
            stroke-width: 2;
            fill: none;
        }
        .tree-link.path {
            stroke: #4CAF50;
            stroke-width: 4;
        }
        .tree-link.visited {
            stroke: #2196F3;
            stroke-width: 2.5;
        }
        .edge-line.path {
            stroke: #4CAF50;
            stroke-width: 4;
        }
        .tree-label {
            fill: #333;
            font-size: 14px;
            font-weight: bold;
            text-anchor: middle;
            pointer-events: none;
            user-select: none;
        }
        .tree-info-text {
            fill: #666;
            font-size: 10px;
            text-anchor: middle;
            pointer-events: none;
            user-select: none;
        }
        .tree-weight-label {
            fill: #333;
            font-size: 10px;
            text-anchor: middle;
            font-weight: bold;
            pointer-events: none;
            user-select: none;
        }
        line {
            fill: none;
        }
        circle {
            transition: all 0.3s;
        }
        text {
            pointer-events: none;
            user-select: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌳 Search Tree - Standalone View</h1>
        ${svgClone.outerHTML}
    </div>
</body>
</html>
        `;

        return html;
    }
}
