/**
 * Tree Visualizer
 * Generates and visualizes complete state space trees
 */

import {SVGRenderer} from './svg-renderer.js';

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
    buildTree(graphData, startNode, maxDepth = 4, goalNodes = []) {
        // Clear container
        this.container.innerHTML = '';

        // Generate tree structure
        this.treeData = this.generateSearchTree(graphData.graph, startNode, maxDepth, goalNodes);

        // Calculate SVG dimensions based on tree size
        const {width, height} = this.calculateTreeDimensions(this.treeData, maxDepth);

        // Create SVG
        this.svg = SVGRenderer.createSVG(width, height);
        this.container.appendChild(this.svg);
        this.addZoomControls();

        // Calculate node positions
        this.computeSubtreeSizes(this.treeData);
        this.calculateTreeLayout(this.treeData, width / 2, 40, width, 0);

        // Draw tree
        this.drawTree(this.treeData);

        return this.svg;
    }

    /**
     * Add zoom in/out buttons to the container
     */
    addZoomControls() {
        let isDragging = false;
        let dragStart = {x: 0, y: 0};
        let viewBoxStart = [0, 0, 0, 0];

        this.container.addEventListener('mouseenter', () => {
            if (this.container.querySelector('.zoom-controls')) return;
            const zoomControls = document.createElement('div');
            zoomControls.className = 'zoom-controls';
            zoomControls.style.display = 'flex';
            zoomControls.style.gap = '8px';
            zoomControls.style.marginBottom = '8px';
            zoomControls.style.position = 'absolute';
            zoomControls.style.top = '8px';
            zoomControls.style.right = '8px';
            zoomControls.style.zIndex = '10';

            const zoomInBtn = document.createElement('button');
            zoomInBtn.textContent = '+';
            zoomInBtn.title = 'Zoom In';
            zoomInBtn.onclick = (e) => {
                this.zoomSVG(1.2, e);
            };

            const zoomOutBtn = document.createElement('button');
            zoomOutBtn.textContent = '−';
            zoomOutBtn.title = 'Zoom Out';
            zoomOutBtn.onclick = (e) => {
                this.zoomSVG(0.8, e);
            };

            zoomControls.appendChild(zoomInBtn);
            zoomControls.appendChild(zoomOutBtn);
            this.container.prepend(zoomControls);

            // Add drag support
            if (this.svg) {
                this.svg.style.cursor = 'grab';
                this.svg.onmousedown = (e) => {
                    isDragging = true;
                    this.svg.style.cursor = 'grabbing';
                    dragStart = {x: e.clientX, y: e.clientY};
                    const viewBox = this.svg.getAttribute('viewBox') || `0 0 ${this.svg.width.baseVal.value} ${this.svg.height.baseVal.value}`;
                    viewBoxStart = viewBox.split(' ').map(Number);
                    e.preventDefault();
                };
                window.onmousemove = (e) => {
                    if (!isDragging) return;
                    const dx = e.clientX - dragStart.x;
                    const dy = e.clientY - dragStart.y;
                    // Move only if zoomed in (viewBox smaller than SVG)
                    if (viewBoxStart.length === 4) {
                        let [x, y, w, h] = viewBoxStart;
                        const scaleX = w / this.svg.width.baseVal.value;
                        const scaleY = h / this.svg.height.baseVal.value;
                        let newX = x - dx * scaleX;
                        let newY = y - dy * scaleY;
                        // Prevent moving out of bounds
                        newX = Math.max(0, Math.min(newX, this.svg.width.baseVal.value - w));
                        newY = Math.max(0, Math.min(newY, this.svg.height.baseVal.value - h));
                        this.svg.setAttribute('viewBox', `${newX} ${newY} ${w} ${h}`);
                    }
                };
                window.onmouseup = () => {
                    isDragging = false;
                    if (this.svg) this.svg.style.cursor = 'grab';
                };
            }
        });

        this.container.addEventListener('mouseleave', () => {
            const controls = this.container.querySelector('.zoom-controls');
            if (controls) controls.remove();
            if (this.svg) {
                this.svg.onmousedown = null;
                window.onmousemove = null;
                window.onmouseup = null;
                this.svg.style.cursor = '';
            }
        });
    }

    /**
     * Zoom the SVG by scaling the viewBox
     */
    zoomSVG(factor) {
        if (!this.svg) return;
        const viewBox = this.svg.getAttribute('viewBox') || `0 0 ${this.svg.width.baseVal.value} ${this.svg.height.baseVal.value}`;
        const [x, y, w, h] = viewBox.split(' ').map(Number);
        const cx = x + w / 2;
        const cy = y + h / 2;
        const newW = w / factor;
        const newH = h / factor;
        this.svg.setAttribute('viewBox', `${cx - newW / 2} ${cy - newH / 2} ${newW} ${newH}`);
    }

    /**
     * Generate state space graph
     */
    generateSearchTree(graph, startNode, maxDepth, goalNodes = []) {
        const root = {
            id: `${startNode}-0`, label: startNode, path: [startNode], depth: 0, children: []
        };

        const queue = [root];
        let goalFound = false;

        while (queue.length > 0 && !goalFound) { // Stop when goal is found
            const currentNode = queue.shift();

            // Check if current node is a goal node
            if (goalNodes.includes(currentNode.label)) {
                console.log(`🎯 Goal node "${currentNode.label}" found in state space tree!`);
                // goalFound = true;
                continue; // Don't expand goal nodes
            }

            // Stop expanding if we've reached max depth
            if (currentNode.depth >= maxDepth) {
                continue;
            }

            const currentLabel = currentNode.label;
            const neighbors = graph[currentLabel] || [];

            neighbors.forEach(neighbor => {
                // Skip if neighbor is already in the path (prevent backward/cyclic nodes)
                const lastNode = currentNode.path[currentNode.path.length - 1];
                if (!(lastNode && lastNode.label && lastNode.label.endsWith('(loop)')) && currentNode.path.includes(neighbor)) {
                    // Add neighbor to path and label as loop node
                    const childDepth = currentNode.depth + 1;
                    const loopChild = {
                        id: `${currentNode.path.join('')}#${neighbor}-loop-${childDepth}`,
                        label: `${neighbor} (loop)`,
                        path: [...currentNode.path, neighbor],
                        depth: childDepth,
                        parent: currentNode,
                        children: []
                    };
                    currentNode.children.push(loopChild);
                    console.log(`🔁 Loop node "${loopChild.label}" added (Path: ${loopChild.path.join('→')})`);
                    return;
                }

                // Create child node with depth-based ID
                const childPath = [...currentNode.path, neighbor];
                const childDepth = currentNode.depth + 1;
                const childId = `${currentNode.path.join('')}#${neighbor}-${childDepth}`;
                console.log(`currentNode Path: `, currentNode.path, 'Child Path:', childPath, `Child ID: ${childId}`);

                const child = {
                    id: childId,
                    label: neighbor,
                    path: childPath,
                    depth: childDepth,
                    parent: currentNode,
                    children: []
                };

                currentNode.children.push(child);
                console.log(`➕ Added node "${child.label}" at depth ${child.depth} (Path: ${child.path.join('→')})`);

                // Only add to queue if goal hasn't been found yet
                if (!goalFound) {
                    queue.push(child);
                }
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
        return {width, height};
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
    calculateTreeLayoutOld(node, x, y, width, index) {
        if (!node) return;

        // Store position
        this.nodePositions.set(node.id, {x, y, label: node.label});

        const childCount = node.children.length;
        if (childCount === 0) return;

        const childWidth = width / childCount;
        const childY = y + 80;

        node.children.forEach((child, i) => {
            // Position children from leftmost, evenly spaced
            const childX = x - width / 2 + childWidth * (i + 0.5);
            this.calculateTreeLayout(child, childX, childY, childWidth, i);
        });

        // const childWidth = width / childCount;
        // const childY = y + 80;
        //
        // node.children.forEach((child, i) => {
        //     const childX = x - width / 2 + childWidth * (i + 0.5);
        //     this.calculateTreeLayout(child, childX, childY, childWidth, i);
        // });
    }

// Step 1: Compute subtree sizes (number of leaves under each node)
    computeSubtreeSizes(node) {
        if (!node.children || node.children.length === 0) {
            node.subtreeSize = 1;
            return 1;
        }
        let size = 0;
        for (const child of node.children) {
            size += this.computeSubtreeSizes(child);
        }
        node.subtreeSize = size;
        return size;
    }

// Step 2: Layout calculation using subtree sizes
    calculateTreeLayout(node, x, y, totalWidth) {
        if (!node) return;

        this.nodePositions.set(node.id, {x, y, label: node.label});

        if (!node.children || node.children.length === 0) return;

        const totalSubtreeSize = node.children.reduce((sum, c) => sum + c.subtreeSize, 0);
        const spacing = totalWidth / totalSubtreeSize;
        let currentX = x - totalWidth / 2;

        const childY = y + 80;

        for (const child of node.children) {
            const childWidth = spacing * child.subtreeSize;
            const childCenterX = currentX + childWidth / 2;

            this.calculateTreeLayout(child, childCenterX, childY, childWidth);
            currentX += childWidth;
        }
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

        // Draw node - use node.id for data-node attribute so we can find it later
        const pathStr = node.path.join('→');
        const nodeGroup = SVGRenderer.drawTreeNode(this.svg, pos.x, pos.y, node.label, `d:${node.depth}`, 'tree-node');
        // Update the data-node attribute to use the full node ID instead of just the label
        nodeGroup.setAttribute('data-node', node.id);

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
    highlightNodeByLabel(label, depth = null, className = 'tree-node current') {
        // Find matching nodes in positions map
        for (const [id, pos] of this.nodePositions.entries()) {
            if (pos.label === label) {
                if (depth === null || id.includes(`-${depth}`)) {
                    this.updateTreeNode(id.split('-')[0], className);
                }
            }
        }
    }

    /**
     * Highlight nodes in the opened list with solid blue outline
     */
    highlightOpenedNodes(openedList) {
        if (!openedList || !Array.isArray(openedList)) return;

        // Add 'opened' class to nodes in the opened list
        openedList.forEach(nodeId => {
            const nodeGroup = this.svg.querySelector(`[data-node="${nodeId}"]`);
            if (nodeGroup) {
                const circle = nodeGroup.querySelector('circle');
                if (circle) {
                    circle.setAttribute('class', 'tree-node opened');
                }
            }
        });
    }

    /**
     * Highlight nodes in the closed list
     */
    highlightClosedNodes(closedList) {
        if (!closedList || !Array.isArray(closedList)) return;

        closedList.forEach(nodeId => {
            const nodeGroup = this.svg.querySelector(`[data-node="${nodeId}"]`);
            if (nodeGroup) {
                const circle = nodeGroup.querySelector('circle');
                if (circle && !circle.classList.contains('path')) {
                    // Remove 'opened' class if it exists and add 'visited'
                    circle.classList.remove('opened');
                    circle.setAttribute('class', 'tree-node visited');
                }
            }
        });
    }

    /**
     * Highlight path in the tree (both nodes and edges)
     */
    highlightPath(path) {
        if (!path || path.length === 0) return;

        console.log('🎯 Highlighting path in tree:', path);

        // Find the actual path through the tree by matching the sequence
        const pathNodeIds = this.findPathInTree(path);

        if (pathNodeIds.length === 0) {
            console.warn('⚠️ Could not find path in tree');
            return;
        }

        console.log('✅ Path nodes found:', pathNodeIds);

        // Highlight path nodes
        pathNodeIds.forEach(nodeId => {
            const node = this.svg.querySelector(`[data-node="${nodeId}"] circle`);
            if (node) {
                node.setAttribute('class', 'tree-node path');
            }
        });

        // Highlight path edges by connecting consecutive nodes in pathNodeIds
        for (let i = 0; i < pathNodeIds.length - 1; i++) {
            const nodeId1 = pathNodeIds[i];
            const nodeId2 = pathNodeIds[i + 1];
            const pos1 = this.nodePositions.get(nodeId1);
            const pos2 = this.nodePositions.get(nodeId2);

            if (pos1 && pos2) {
                // Find and highlight the link between these specific positions
                const links = this.svg.querySelectorAll('line.tree-link');
                links.forEach(link => {
                    const x1 = parseFloat(link.getAttribute('x1'));
                    const y1 = parseFloat(link.getAttribute('y1'));
                    const x2 = parseFloat(link.getAttribute('x2'));
                    const y2 = parseFloat(link.getAttribute('y2'));

                    // Check if this link connects the two positions
                    const connects = (
                        Math.abs(x1 - pos1.x) < 2 && Math.abs(y1 - pos1.y - 20) < 2 &&
                        Math.abs(x2 - pos2.x) < 2 && Math.abs(y2 - pos2.y + 20) < 2
                    );

                    if (connects) {
                        // link.classList.add('path');
                        link.setAttribute('class', 'edge-line path');
                    }
                });
            }
        }

        console.log('✅ Path highlighted successfully');
    }

    /**
     * Find the actual path through the tree matching the search result path
     */
    findPathInTree(searchPath) {
        if (!this.treeData || !searchPath || searchPath.length === 0) return [];

        // Start from root and traverse to find matching path
        const pathNodeIds = [];

        // Recursive function to find path
        const findPath = (node, targetPath, currentIndex) => {
            if (!node) return false;

            // Check if current node matches the target at this index
            if (node.label !== targetPath[currentIndex]) {
                return false;
            }

            // Add this node to the path
            pathNodeIds.push(node.id);

            // If we've matched the entire path, we're done
            if (currentIndex === targetPath.length - 1) {
                return true;
            }

            // Try to find the next node in the path among children
            for (const child of node.children) {
                if (findPath(child, targetPath, currentIndex + 1)) {
                    return true;
                }
            }

            // If no child matched, backtrack
            pathNodeIds.pop();
            return false;
        };

        // Start the search from root
        findPath(this.treeData, searchPath, 0);

        return pathNodeIds;
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