/**
 * config.js
 * Contains game constants and configuration settings
 */

const CONFIG = {
    // Circuit configurations
    circuits: ['outer', 'middle', 'inner'],
    nodesPerCircuit: 6,
    
    // Game rules
    totalTitansPerPlayer: 4,
    initialPlayerTurn: 'red',
    initialPhase: 'placement',
    initialUnlockedCircuits: ['outer'],
    
    // Timer settings (in seconds)
    turnTimerDuration: 30,
    gameTimerDuration: 600, // 10 minutes
    
    // Edge weights for scoring
    edgeWeights: {
        // Outer circuit connections (weight 1)
        "outer-0-outer-1": 2, "outer-1-outer-2": 1, "outer-2-outer-3": 1,
        "outer-3-outer-4": 3, "outer-4-outer-5": 2, "outer-0-outer-5": 1,
        
        // Middle circuit connections (weight 2)
        "middle-0-middle-1": 4, "middle-1-middle-2": 5, "middle-2-middle-3": 6,
        "middle-3-middle-4": 4, "middle-4-middle-5": 5, "middle-0-middle-5": 6,
        
        // Inner circuit connections (weight 3)
        "inner-0-inner-1": 9, "inner-1-inner-2": 8, "inner-2-inner-3": 8,
        "inner-3-inner-4": 9, "inner-4-inner-5": 8, "inner-0-inner-5": 8,
        
        // Cross-circuit connections (higher weights toward center)
        "middle-0-outer-0": 1, "middle-2-outer-2": 1, "middle-4-outer-4": 1,
    "inner-1-middle-1": 1,
    "inner-3-middle-3": 1, "inner-5-middle-5": 1
    },
    
    // Adjacency list - defines which nodes are connected
    adjacencyList: {
        // Outer circuit nodes
        "outer-0": ["outer-1", "outer-5", "middle-0"],
        "outer-1": ["outer-0", "outer-2"],
        "outer-2": ["outer-1", "outer-3", "middle-2"],
        "outer-3": ["outer-2", "outer-4"],
        "outer-4": ["outer-3", "outer-5", "middle-4"],
        "outer-5": ["outer-4", "outer-0"],
        
        // Middle circuit nodes
        "middle-0": ["middle-1", "middle-5", "outer-0"],
        "middle-1": ["middle-0", "middle-2", "inner-1"],
        "middle-2": ["middle-1", "middle-3", "outer-2"],
        "middle-3": ["middle-2", "middle-4", "inner-3"],
        "middle-4": ["middle-3", "middle-5", "outer-4"],
        "middle-5": ["middle-4", "middle-0", "inner-5"],
        
        // Inner circuit nodes
        "inner-0": ["inner-1", "inner-5"],
        "inner-1": ["inner-0", "inner-2", "middle-1"],
        "inner-2": ["inner-1", "inner-3"],
        "inner-3": ["inner-2", "inner-4", "middle-3"],
        "inner-4": ["inner-3", "inner-5"],
        "inner-5": ["inner-4", "inner-0", "middle-5"]
    }
};
