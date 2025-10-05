/**
 * Configuration and Constants
 */

export const CONFIG = {
    API_BASE_URL: 'http://localhost:5001/api',
    SVG_DIMENSIONS: {
        GRAPH_WIDTH: 600,
        GRAPH_HEIGHT: 500,
        NODE_RADIUS: 25,
        TREE_NODE_RADIUS: 20
    },
    COLORS: {
        START_NODE: '#28a745',
        GOAL_NODE: '#dc3545',
        VISITED_NODE: '#87ceeb',
        VISITED_STROKE: '#4682b4',
        PATH_NODE: '#ffd700',
        PATH_STROKE: '#ffa500',
        DEFAULT_NODE: 'white',
        DEFAULT_STROKE: '#667eea',
        EDGE: '#999'
    },
    ANIMATION: {
        PULSE_DURATION: 100,
        PATH_DELAY: 500
    }
};

