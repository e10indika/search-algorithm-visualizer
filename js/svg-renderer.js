/**
 * SVG Renderer
 * Handles rendering of graphs and trees using SVG
 */

export class SVGRenderer {
    /**
     * Create an SVG element with the given attributes
     */
    static createSVG(width, height) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Add arrow marker for directed edges
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3, 0 6');
        polygon.setAttribute('fill', '#999');

        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);

        return svg;
    }

    /**
     * Draw a node (circle with label and optional heuristic)
     */
    static drawNode(svg, x, y, label, nodeClass = 'node-circle', radius = 25, heuristic = null) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('data-node', label);

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.setAttribute('class', nodeClass);

        // Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 5);
        text.setAttribute('class', 'node-label');
        text.textContent = label;

        group.appendChild(circle);
        group.appendChild(text);

        // Add heuristic value if provided
        if (heuristic !== null && heuristic !== undefined) {
            const heuristicText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            heuristicText.setAttribute('x', x);
            heuristicText.setAttribute('y', y + radius + 15);
            heuristicText.setAttribute('class', 'node-heuristic');
            heuristicText.setAttribute('font-size', '11');
            heuristicText.setAttribute('fill', '#0066cc');
            heuristicText.setAttribute('text-anchor', 'middle');
            heuristicText.textContent = `h:${heuristic}`;
            group.appendChild(heuristicText);
        }

        svg.appendChild(group);

        return group;
    }

    /**
     * Draw an edge (line between two nodes)
     */
    static drawEdge(svg, x1, y1, x2, y2, weight = null, directed = false, edgeClass = 'edge-line') {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'edge-group');

        // Calculate the shortened line to account for node radius
        const radius = 25;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const startX = x1 + radius * Math.cos(angle);
        const startY = y1 + radius * Math.sin(angle);
        const endX = x2 - radius * Math.cos(angle);
        const endY = y2 - radius * Math.sin(angle);

        // Line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('class', edgeClass);
        line.setAttribute('data-edge', `${x1},${y1}-${x2},${y2}`);
        if (directed) {
            line.classList.add('directed');
        }

        group.appendChild(line);

        // Weight label
        if (weight !== null) {
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            const weightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            weightText.setAttribute('x', midX);
            weightText.setAttribute('y', midY - 5);
            weightText.setAttribute('class', 'edge-weight');
            weightText.textContent = weight;

            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bg.setAttribute('x', midX - 10);
            bg.setAttribute('y', midY - 15);
            bg.setAttribute('width', '20');
            bg.setAttribute('height', '15');
            bg.setAttribute('fill', 'white');
            bg.setAttribute('opacity', '0.8');

            group.appendChild(bg);
            group.appendChild(weightText);
        }

        svg.insertBefore(group, svg.firstChild);
        return group;
    }

    /**
     * Draw a tree node with additional info
     */
    static drawTreeNode(svg, x, y, label, info = '', nodeClass = 'tree-node', radius = 20) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('data-node', label);

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.setAttribute('class', nodeClass);

        // Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 4);
        text.setAttribute('class', 'tree-label');
        text.textContent = label;

        group.appendChild(circle);
        group.appendChild(text);

        // Additional info (like cost, heuristic)
        if (info) {
            const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            infoText.setAttribute('x', x);
            infoText.setAttribute('y', y + radius + 15);
            infoText.setAttribute('class', 'tree-label tree-info-text');
            infoText.setAttribute('font-size', '10');
            infoText.setAttribute('fill', '#666');
            infoText.textContent = info;
            group.appendChild(infoText);
        }

        svg.appendChild(group);
        return group;
    }

    /**
     * Draw a tree node with heuristic value in the label
     */
    static drawTreeNodeWithHeuristic(svg, x, y, label, info = '', nodeClass = 'tree-node', heuristic = null, radius = 20) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('data-node', label);

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.setAttribute('class', nodeClass);

        group.appendChild(circle);

        // Label with heuristic
        if (heuristic !== null && heuristic !== undefined) {
            // Main label (node name) - positioned higher to make room for heuristic
            const mainLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            mainLabel.setAttribute('x', x);
            mainLabel.setAttribute('y', y - 5);  // Moved up more to create gap
            mainLabel.setAttribute('class', 'tree-label');
            mainLabel.setAttribute('text-anchor', 'middle');
            mainLabel.setAttribute('dominant-baseline', 'middle');
            mainLabel.textContent = label;

            // Heuristic value - with increased gap from node label
            const heuristicLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            heuristicLabel.setAttribute('x', x);
            heuristicLabel.setAttribute('y', y + 11);  // Increased gap (was y + 10)
            heuristicLabel.setAttribute('class', 'tree-heuristic-label');
            heuristicLabel.setAttribute('text-anchor', 'middle');
            heuristicLabel.setAttribute('font-size', '13');
            heuristicLabel.setAttribute('font-weight', 'bold');
            heuristicLabel.setAttribute('fill', '#35038a');
            heuristicLabel.textContent = `${heuristic}`;

            group.appendChild(mainLabel);
            group.appendChild(heuristicLabel);
        } else {
            // Label without heuristic
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y + 4);
            text.setAttribute('class', 'tree-label');
            text.textContent = label;
            group.appendChild(text);
        }

        // Additional info (now empty but kept for compatibility)
        if (info) {
            const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            infoText.setAttribute('x', x);
            infoText.setAttribute('y', y + radius + 15);
            infoText.setAttribute('class', 'tree-label tree-info-text');
            infoText.setAttribute('font-size', '10');
            infoText.setAttribute('fill', '#666');
            infoText.textContent = info;
            group.appendChild(infoText);
        }

        svg.appendChild(group);
        return group;
    }

    /**
     * Draw a tree link (parent to child) with optional weight
     */
    static drawTreeLink(svg, x1, y1, x2, y2, weight = null, linkClass = 'tree-link') {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1 + 20);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2 - 20);
        line.setAttribute('class', linkClass);
        line.setAttribute('data-link', `${x1},${y1}-${x2},${y2}`);

        group.appendChild(line);

        // Add weight label if provided
        if (weight !== null && weight !== undefined) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + 20 + y2 - 20) / 2;

            const weightBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            weightBg.setAttribute('cx', midX);
            weightBg.setAttribute('cy', midY);
            weightBg.setAttribute('r', '10');
            weightBg.setAttribute('fill', '#e0e0e0');  // Changed to grey
            weightBg.setAttribute('stroke', '#999');
            weightBg.setAttribute('stroke-width', '1');

            const weightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            weightText.setAttribute('x', midX);
            weightText.setAttribute('y', midY + 4);
            weightText.setAttribute('class', 'tree-weight-label');
            weightText.setAttribute('font-size', '10');
            weightText.setAttribute('fill', '#333');
            weightText.setAttribute('text-anchor', 'middle');
            weightText.textContent = weight;

            group.appendChild(weightBg);
            group.appendChild(weightText);
        }

        svg.insertBefore(group, svg.firstChild);
        return group;
    }

    /**
     * Clear SVG content
     */
    static clearSVG(svg) {
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
    }

    /**
     * Update node class (for animation)
     */
    static updateNodeClass(svg, nodeLabel, newClass) {
        const node = svg.querySelector(`[data-node="${nodeLabel}"] circle`);
        if (node) {
            node.setAttribute('class', newClass);
        }
    }

    /**
     * Highlight path edges in graph
     */
    static highlightPathEdges(svg, path, positions) {
        if (!path || path.length < 2) return;

        for (let i = 0; i < path.length - 1; i++) {
            const node1 = path[i];
            const node2 = path[i + 1];
            const pos1 = positions[node1];
            const pos2 = positions[node2];

            if (pos1 && pos2) {
                // Find the edge line element
                const lines = svg.querySelectorAll('line.edge-line');
                lines.forEach(line => {
                    const x1 = parseFloat(line.getAttribute('x1'));
                    const y1 = parseFloat(line.getAttribute('y1'));
                    const x2 = parseFloat(line.getAttribute('x2'));
                    const y2 = parseFloat(line.getAttribute('y2'));

                    // Check if this line connects the two nodes (in either direction)
                    const connects = (
                        (Math.abs(x1 - pos1.x) < 30 && Math.abs(y1 - pos1.y) < 30 &&
                         Math.abs(x2 - pos2.x) < 30 && Math.abs(y2 - pos2.y) < 30) ||
                        (Math.abs(x1 - pos2.x) < 30 && Math.abs(y1 - pos2.y) < 30 &&
                         Math.abs(x2 - pos1.x) < 30 && Math.abs(y2 - pos1.y) < 30)
                    );

                    if (connects) {
                        line.classList.add('path');
                    }
                });
            }
        }
    }

    /**
     * Highlight path in tree
     */
    static highlightTreePath(svg, pathNodes, nodePositions) {
        if (!pathNodes || pathNodes.length < 2) return;

        // For each consecutive pair in the path, highlight the link
        for (let i = 0; i < pathNodes.length - 1; i++) {
            const node1Label = pathNodes[i];
            const node2Label = pathNodes[i + 1];

            // Find positions for these nodes in the tree
            let node1Pos = null;
            let node2Pos = null;

            for (const [id, pos] of nodePositions.entries()) {
                if (pos.label === node1Label && !node1Pos) {
                    node1Pos = pos;
                }
                if (pos.label === node2Label && !node2Pos) {
                    node2Pos = pos;
                }
            }

            if (node1Pos && node2Pos) {
                // Find and highlight the link between these positions
                const links = svg.querySelectorAll('line.tree-link');
                links.forEach(link => {
                    const x1 = parseFloat(link.getAttribute('x1'));
                    const y1 = parseFloat(link.getAttribute('y1'));
                    const x2 = parseFloat(link.getAttribute('x2'));
                    const y2 = parseFloat(link.getAttribute('y2'));

                    // Check if this link connects the two positions
                    const connects = (
                        (Math.abs(x1 - node1Pos.x) < 5 && Math.abs(y1 - node1Pos.y - 20) < 5 &&
                         Math.abs(x2 - node2Pos.x) < 5 && Math.abs(y2 - node2Pos.y + 20) < 5) ||
                        (Math.abs(x1 - node2Pos.x) < 5 && Math.abs(y1 - node2Pos.y - 20) < 5 &&
                         Math.abs(x2 - node1Pos.x) < 5 && Math.abs(y2 - node1Pos.y + 20) < 5)
                    );

                    if (connects) {
                        link.classList.add('path');
                    }
                });
            }
        }
    }

    /**
     * Highlight path
     */
    static highlightPath(svg, path) {
        path.forEach(node => {
            this.updateNodeClass(svg, node, 'node-circle path');
        });
    }
}
