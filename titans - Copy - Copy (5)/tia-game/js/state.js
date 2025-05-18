/**
 * state.js
 * Manages the game state and provides functions to modify it
 */

// Undo/Redo stacks
const gameHistory = [];
const redoStack = [];

// Game state object
const gameState = {
    // Board state - tracks which nodes are occupied by which player
    board: {},
    
    // Player information
    players: {
        red: { 
            score: 0, 
            titansPlaced: 0,
            titansRemaining: CONFIG.totalTitansPerPlayer
        },
        blue: { 
            score: 0, 
            titansPlaced: 0,
            titansRemaining: CONFIG.totalTitansPerPlayer
        }
    },
    
    // Game flow control
    currentPlayer: null,
    currentPhase: null,
    selectedNode: null,
    unlockedCircuits: [],
    
    // Edge control and scoring
    controlledEdges: {
        red: [],
        blue: []
    },
    
    // Move history tracking
    moveHistory: {
        red: [],
        blue: []
    },
    
    // Initialize move history display elements
    moveHistoryElements: {
        red: null,
        blue: null
    }
};

// Deep copy utility for game state
function deepCopyGameState(state) {
    return JSON.parse(JSON.stringify(state));
}

/**
 * Initializes the game state to starting values
 */
function initializeGameState() {
    // Initialize board state - set all nodes to empty (null)
    CONFIG.circuits.forEach(circuit => {
        for (let i = 0; i < CONFIG.nodesPerCircuit; i++) {
            const nodeId = `${circuit}-${i}`;
            gameState.board[nodeId] = null;
        }
    });
    
    // Reset player information
    gameState.players.red.score = 0;
    gameState.players.red.titansPlaced = 0;
    gameState.players.red.titansRemaining = CONFIG.totalTitansPerPlayer;
    
    gameState.players.blue.score = 0;
    gameState.players.blue.titansPlaced = 0;
    gameState.players.blue.titansRemaining = CONFIG.totalTitansPerPlayer;
    
    // Set initial game flow values
    gameState.currentPlayer = CONFIG.initialPlayerTurn;
    gameState.currentPhase = CONFIG.initialPhase;
    gameState.selectedNode = null;
    gameState.unlockedCircuits = [...CONFIG.initialUnlockedCircuits];
    
    // Clear controlled edges
    gameState.controlledEdges.red = [];
    gameState.controlledEdges.blue = [];
    
    // Initialize move history
    gameState.moveHistory = {
        red: [],
        blue: []
    };
    
    // Clear move history display
    clearMoveHistoryDisplay();
    
    // Update UI to reflect initial state
    updateUIFromState();
    
    // Clear history on new game
    gameHistory.length = 0;
    redoStack.length = 0;
    gameHistory.push(deepCopyGameState(gameState));
    
    // Force update of move history display
    updateMoveHistoryDisplay();
}

/**
 * Updates the state when a titan is placed on a node
 * @param {string} nodeId - The ID of the node where the titan is placed
 */
function updateStateForPlacement(nodeId) {
    // Save current state to history before making a change
    gameHistory.push(deepCopyGameState(gameState));
    redoStack.length = 0; // Clear redo on new action
    // Update board state
    gameState.board[nodeId] = gameState.currentPlayer;
    
    // Update player's titans count
    gameState.players[gameState.currentPlayer].titansPlaced++;
    gameState.players[gameState.currentPlayer].titansRemaining--;
    
    // Record this move in the history
    addMoveToHistory(gameState.currentPlayer, `Placed titan at ${nodeId}`, 'placement');
    
    // Check if we should unlock middle circuit
    if (gameState.players.red.titansPlaced >= 2 && 
        gameState.players.blue.titansPlaced >= 2 && 
        !gameState.unlockedCircuits.includes('middle')) {
        gameState.unlockedCircuits.push('middle');
    }
    
    // Check if we should unlock inner circuit
    if (gameState.players.red.titansPlaced >= 3 && 
        gameState.players.blue.titansPlaced >= 3 && 
        !gameState.unlockedCircuits.includes('inner')) {
        gameState.unlockedCircuits.push('inner');
    }
    
    // Check if placement phase is complete
    console.log(`[updateStateForPlacement] Red titansPlaced: ${gameState.players.red.titansPlaced}, Blue titansPlaced: ${gameState.players.blue.titansPlaced}`);
    // Phase switch logic moved to handlePlacementPhaseClick in gameLogic.js
    // No phase switch here.
    
    // Check for controlled edges after placement
    checkControlledEdges();
    
    // Force update of move history display
    updateMoveHistoryDisplay();
    
    // Debug log the current move history
    console.log('Current move history:', gameState.moveHistory);
}

/**
 * Updates the state when a titan is moved from one node to another
 * @param {string} fromNodeId - The ID of the source node
 * @param {string} toNodeId - The ID of the destination node
 */
function updateStateForMovement(fromNodeId, toNodeId) {
    // Save current state to history before making a change
    gameHistory.push(deepCopyGameState(gameState));
    redoStack.length = 0; // Clear redo on new action
    // Update board state
    gameState.board[toNodeId] = gameState.board[fromNodeId];
    gameState.board[fromNodeId] = null;
    
    // Clear selected node
    gameState.selectedNode = null;
    
    // Record this move in the history
    addMoveToHistory(gameState.currentPlayer, `Moved titan from ${fromNodeId} to ${toNodeId}`, 'movement');
    
    // Check for controlled edges after movement
    checkControlledEdges();
    
    // Force update of move history display
    updateMoveHistoryDisplay();
    
    // Debug log the current move history
    console.log('Current move history:', gameState.moveHistory);
}

/**
 * Switches to the next player's turn
 */
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
    gameState.selectedNode = null; // Clear any selection when switching players
}

/**
 * Undo the last move
 */
function undoGameState() {
    if (gameHistory.length > 1) {
        console.log('Performing undo operation...');
        redoStack.push(deepCopyGameState(gameState));
        gameHistory.pop(); // Remove current state
        const prevState = gameHistory[gameHistory.length - 1];
        
        // Log the board state before and after for debugging
        console.log('Board state before undo:', JSON.stringify(gameState.board));
        
        // Restore the previous state
        restoreGameState(prevState);
        
        console.log('Board state after undo:', JSON.stringify(gameState.board));
        
        // Force a complete refresh of all nodes
        CONFIG.circuits.forEach(circuit => {
            for (let i = 0; i < CONFIG.nodesPerCircuit; i++) {
                const nodeId = `${circuit}-${i}`;
                const nodeElement = document.getElementById(nodeId);
                if (nodeElement) {
                    // First, remove ALL possible state classes
                    nodeElement.classList.remove('red-occupied', 'blue-occupied', 'selected', 'valid-move', 'invalid');
                    
                    // Then add the correct class based on the restored state
                    const occupiedBy = gameState.board[nodeId];
                    if (occupiedBy) {
                        nodeElement.classList.add(`${occupiedBy}-occupied`);
                        console.log(`Node ${nodeId} should be ${occupiedBy}-occupied`);
                    } else {
                        console.log(`Node ${nodeId} should be empty`);
                    }
                }
            }
        });
        
        // Also update the move history display
        updateMoveHistoryDisplay();
    }
}

// Redo the last undone move
function redoGameState() {
    if (redoStack.length > 0) {
        console.log('Performing redo operation...');
        gameHistory.push(deepCopyGameState(gameState));
        const nextState = redoStack.pop();
        
        // Log the board state before and after for debugging
        console.log('Board state before redo:', JSON.stringify(gameState.board));
        
        // Restore the next state
        restoreGameState(nextState);
        
        console.log('Board state after redo:', JSON.stringify(gameState.board));
        
        // Force a complete refresh of all nodes
        CONFIG.circuits.forEach(circuit => {
            for (let i = 0; i < CONFIG.nodesPerCircuit; i++) {
                const nodeId = `${circuit}-${i}`;
                const nodeElement = document.getElementById(nodeId);
                if (nodeElement) {
                    // First, remove ALL possible state classes
                    nodeElement.classList.remove('red-occupied', 'blue-occupied', 'selected', 'valid-move', 'invalid');
                    
                    // Then add the correct class based on the restored state
                    const occupiedBy = gameState.board[nodeId];
                    if (occupiedBy) {
                        nodeElement.classList.add(`${occupiedBy}-occupied`);
                        console.log(`Node ${nodeId} should be ${occupiedBy}-occupied`);
                    } else {
                        console.log(`Node ${nodeId} should be empty`);
                    }
                }
            }
        });
        
        // Also update the move history display
        updateMoveHistoryDisplay();
    }
}

// Restore game state from a snapshot
function restoreGameState(stateSnapshot) {
    // Copy properties deeply
    Object.keys(stateSnapshot).forEach(key => {
        if (typeof stateSnapshot[key] === 'object' && stateSnapshot[key] !== null) {
            gameState[key] = JSON.parse(JSON.stringify(stateSnapshot[key]));
        } else {
            gameState[key] = stateSnapshot[key];
        }
    });
    updateUIFromState();
    // Force a full grid visual refresh to match the restored board
    if (typeof updateGridDisplay === 'function') updateGridDisplay();
}

/**
 * Adds a move to the player's move history and updates the display
 * @param {string} player - The player ('red' or 'blue')
 * @param {string} moveDescription - Description of the move
 * @param {string} moveType - Type of move ('placement', 'movement', or 'elimination')
 */
function addMoveToHistory(player, moveDescription, moveType) {
    // Create a move object with timestamp
    const move = {
        description: moveDescription,
        type: moveType,
        turn: gameState.players.red.titansPlaced + gameState.players.blue.titansPlaced,
        timestamp: new Date().toLocaleTimeString()
    };
    
    // Log the move being added for debugging
    console.log(`Adding move to history: Player=${player}, Type=${moveType}, Description=${moveDescription}`);
    
    // Initialize move history if needed
    if (!gameState.moveHistory) {
        gameState.moveHistory = { red: [], blue: [] };
    }
    if (!gameState.moveHistory[player]) {
        gameState.moveHistory[player] = [];
    }
    
    // Add to player's move history
    gameState.moveHistory[player].push(move);
    
    // Debug log the current state of move history
    console.log('Current move history:', JSON.stringify(gameState.moveHistory, null, 2));
    
    // Update the display
    updateMoveHistoryDisplay();
}

/**
 * Updates the move history display in the UI
 */
function updateMoveHistoryDisplay() {
    // Use stored history elements from gameState
    const redHistoryList = gameState.moveHistoryElements.red;
    const blueHistoryList = gameState.moveHistoryElements.blue;
    
    if (!redHistoryList || !blueHistoryList) {
        console.error('Move history list elements not found');
        return;
    }
    
    // Clear current display
    redHistoryList.innerHTML = '';
    blueHistoryList.innerHTML = '';
    
    // Helper function to create move item
    function createMoveItem(move, index, player) {
        const listItem = document.createElement('li');
        listItem.className = `move-item ${move.type}-move`;
        
        // Create move type indicator with icon
        const typeIndicator = document.createElement('span');
        typeIndicator.className = 'move-type';
        let icon = '⚡'; // Default icon
        if (move.type === 'placement') icon = '➕';
        else if (move.type === 'movement') icon = '➡️';
        else if (move.type === 'elimination') icon = '❌';
        typeIndicator.textContent = `${icon} ${move.type.charAt(0).toUpperCase() + move.type.slice(1)}`;
        typeIndicator.style.backgroundColor = player === 'red' ? '#e74c3c' : '#3498db';
        typeIndicator.style.color = 'white';
        typeIndicator.style.padding = '2px 6px';
        typeIndicator.style.borderRadius = '3px';
        typeIndicator.style.marginRight = '8px';
        
        // Create move description
        const moveDesc = document.createElement('span');
        moveDesc.className = 'move-description';
        moveDesc.textContent = `${index + 1}. ${move.description}`;
        moveDesc.style.marginRight = '8px';
        
        // Create timestamp
        const timestamp = document.createElement('span');
        timestamp.className = 'move-timestamp';
        timestamp.textContent = `(${move.timestamp})`;
        timestamp.style.color = '#95a5a6';
        timestamp.style.fontSize = '0.9em';
        
        // Append elements
        listItem.appendChild(typeIndicator);
        listItem.appendChild(moveDesc);
        listItem.appendChild(timestamp);
        
        // Add hover effect
        listItem.style.transition = 'all 0.2s ease';
        listItem.style.padding = '8px';
        listItem.style.margin = '4px 0';
        listItem.style.borderRadius = '4px';
        listItem.style.backgroundColor = 'rgba(0,0,0,0.02)';
        listItem.onmouseover = () => {
            listItem.style.backgroundColor = 'rgba(0,0,0,0.05)';
        };
        listItem.onmouseout = () => {
            listItem.style.backgroundColor = 'rgba(0,0,0,0.02)';
        };
        
        return listItem;
    }
    
    // Add red player moves
    if (gameState.moveHistory && gameState.moveHistory.red && gameState.moveHistory.red.length > 0) {
        console.log('Adding red moves:', gameState.moveHistory.red);
        gameState.moveHistory.red.forEach((move, index) => {
            const listItem = createMoveItem(move, index, 'red');
            redHistoryList.appendChild(listItem);
        });
    }
    
    // Add blue player moves
    if (gameState.moveHistory && gameState.moveHistory.blue && gameState.moveHistory.blue.length > 0) {
        console.log('Adding blue moves:', gameState.moveHistory.blue);
        gameState.moveHistory.blue.forEach((move, index) => {
            const listItem = createMoveItem(move, index, 'blue');
            blueHistoryList.appendChild(listItem);
        });
    }
    
    // Scroll to the bottom to show latest moves
    redHistoryList.scrollTop = redHistoryList.scrollHeight;
    blueHistoryList.scrollTop = blueHistoryList.scrollHeight;
    
    // Debug log
    console.log('Move history display updated');
}

/**
 * Clears the move history display
 */
function clearMoveHistoryDisplay() {
    // Store the history elements in gameState
    gameState.moveHistoryElements.red = document.getElementById('red-history-list');
    gameState.moveHistoryElements.blue = document.getElementById('blue-history-list');
    
    if (!gameState.moveHistoryElements.red || !gameState.moveHistoryElements.blue) {
        // If elements don't exist, create them
        const redHistory = document.createElement('ul');
        redHistory.id = 'red-history-list';
        redHistory.className = 'history-list';
        document.querySelector('.red-history').appendChild(redHistory);
        gameState.moveHistoryElements.red = redHistory;
        
        const blueHistory = document.createElement('ul');
        blueHistory.id = 'blue-history-list';
        blueHistory.className = 'history-list';
        document.querySelector('.blue-history').appendChild(blueHistory);
        gameState.moveHistoryElements.blue = blueHistory;
    }
    
    // Clear their contents
    gameState.moveHistoryElements.red.innerHTML = '';
    gameState.moveHistoryElements.blue.innerHTML = '';
}

/**
 * Helper function to get a key for an edge between two nodes
 * @param {string} node1 - First node ID
 * @param {string} node2 - Second node ID
 * @returns {string} - Standardized edge key
 */
function getEdgeKey(node1, node2) {
    // Sort the nodes to ensure consistent edge keys
    return [node1, node2].sort().join('-');
}

/**
 * Updates UI elements to reflect the current game state
 */
function updateUIFromState() {
    // Update player scores
    document.getElementById('red-score').textContent = gameState.players.red.score;
    document.getElementById('blue-score').textContent = gameState.players.blue.score;
    
    // Update titans remaining
    document.getElementById('red-titans').textContent = gameState.players.red.titansRemaining;
    document.getElementById('blue-titans').textContent = gameState.players.blue.titansRemaining;
    
    // Update current player and phase display
    document.getElementById('current-player').textContent = 
        gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1);
    document.getElementById('current-phase').textContent = 
        gameState.currentPhase.charAt(0).toUpperCase() + gameState.currentPhase.slice(1);
    
    // Update status message based on game state
    let statusMessage = '';
    if (gameState.currentPhase === 'placement') {
        statusMessage = `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)} player, place your titan on the ${gameState.unlockedCircuits.join('/')} circuit`;
    } else {
        statusMessage = gameState.selectedNode ? 
            `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)} player, select a destination for your titan` :
            `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)} player, select a titan to move`;
    }
    
    // Add special message when switching to movement phase
    if (gameState.currentPhase === 'movement' && gameState.players.red.titansRemaining === 0 && gameState.players.blue.titansRemaining === 0) {
        statusMessage = `Movement phase begins! ${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)} player, select a titan to move`;
    }
    
    document.getElementById('status-message').textContent = statusMessage;
}
