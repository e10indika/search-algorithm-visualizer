/**
 * Utility Functions
 */

export const Utils = {
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    createSVGElement(tag, attributes = {}) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    },

    calculateCircularLayout(nodes, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;
        const positions = {};

        nodes.forEach((node, index) => {
            const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
            positions[node] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        return positions;
    },

    getEdgeKey(node1, node2) {
        return [node1, node2].sort().join('-');
    }
};

