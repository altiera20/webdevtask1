
const gameHistory = [];
const redoStack = [];


const gameState = {
    
    board: {},
    
    
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
    
    
    currentPlayer: null,
    currentPhase: null,
    selectedNode: null,
    unlockedCircuits: [],
    
    
    controlledEdges: {
        red: [],
        blue: []
    },
    
    
    moveHistory: {
        red: [],
        blue: []
    },
    
    
    moveHistoryElements: {
        red: null,
        blue: null
    }
};


function deepCopyGameState(state) {
    return JSON.parse(JSON.stringify(state));
}

function initializeGameState() {
    
    CONFIG.circuits.forEach(circuit => {
        for (let i = 0; i < CONFIG.nodesPerCircuit; i++) {
            const nodeId = `${circuit}-${i}`;
            gameState.board[nodeId] = null;
        }
    });
    
    
    gameState.players.red.score = 0;
    gameState.players.red.titansPlaced = 0;
    gameState.players.red.titansRemaining = CONFIG.totalTitansPerPlayer;
    
    gameState.players.blue.score = 0;
    gameState.players.blue.titansPlaced = 0;
    gameState.players.blue.titansRemaining = CONFIG.totalTitansPerPlayer;
    
    
    gameState.currentPlayer = CONFIG.initialPlayerTurn;
    gameState.currentPhase = CONFIG.initialPhase;
    gameState.selectedNode = null;
    gameState.unlockedCircuits = [...CONFIG.initialUnlockedCircuits];
    
    
    gameState.controlledEdges.red = [];
    gameState.controlledEdges.blue = [];
    
    
    gameState.moveHistory = {
        red: [],
        blue: []
    };
    
    
    clearMoveHistoryDisplay();
    
    
    updateUIFromState();
    
    
    gameHistory.length = 0;
    redoStack.length = 0;
    gameHistory.push(deepCopyGameState(gameState));
    
    
    updateMoveHistoryDisplay();
}

function updateStateForPlacement(nodeId) {
    
    gameHistory.push(deepCopyGameState(gameState));
    redoStack.length = 0; 
    
    gameState.board[nodeId] = gameState.currentPlayer;
    
    
    gameState.players[gameState.currentPlayer].titansPlaced++;
    gameState.players[gameState.currentPlayer].titansRemaining--;
    
    
    addMoveToHistory(gameState.currentPlayer, `Placed titan at ${nodeId}`, 'placement');
    
    
    if (gameState.players.red.titansPlaced >= 2 && 
        gameState.players.blue.titansPlaced >= 2 && 
        !gameState.unlockedCircuits.includes('middle')) {
        gameState.unlockedCircuits.push('middle');
    }
    
    
    if (gameState.players.red.titansPlaced >= 3 && 
        gameState.players.blue.titansPlaced >= 3 && 
        !gameState.unlockedCircuits.includes('inner')) {
        gameState.unlockedCircuits.push('inner');
    }
    
    
    console.log(`[updateStateForPlacement] Red titansPlaced: ${gameState.players.red.titansPlaced}, Blue titansPlaced: ${gameState.players.blue.titansPlaced}`);

    checkControlledEdges();
    
    
    updateMoveHistoryDisplay();
    
    
    console.log('Current move history:', gameState.moveHistory);
}

function updateStateForMovement(fromNodeId, toNodeId) {
    
    gameHistory.push(deepCopyGameState(gameState));
    redoStack.length = 0; 
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

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
    gameState.selectedNode = null; 
}

function undoGameState() {
    if (gameHistory.length > 1) {
        console.log('Performing undo operation...');
        redoStack.push(deepCopyGameState(gameState));
        gameHistory.pop(); 
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
                    
                    nodeElement.classList.remove('red-occupied', 'blue-occupied', 'selected', 'valid-move', 'invalid');
                    
                    
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
        
        
        updateMoveHistoryDisplay();
    }
}

function redoGameState() {
    if (redoStack.length > 0) {
        console.log('Performing redo operation...');
        gameHistory.push(deepCopyGameState(gameState));
        const nextState = redoStack.pop();
        
        
        console.log('Board state before redo:', JSON.stringify(gameState.board));
        
        
        restoreGameState(nextState);
        
        console.log('Board state after redo:', JSON.stringify(gameState.board));
        
        
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
        
        
        updateMoveHistoryDisplay();
    }
}


function restoreGameState(stateSnapshot) {
    
    Object.keys(stateSnapshot).forEach(key => {
        if (typeof stateSnapshot[key] === 'object' && stateSnapshot[key] !== null) {
            gameState[key] = JSON.parse(JSON.stringify(stateSnapshot[key]));
        } else {
            gameState[key] = stateSnapshot[key];
        }
    });
    updateUIFromState();
    
    if (typeof updateGridDisplay === 'function') updateGridDisplay();
}


function addMoveToHistory(player, moveDescription, moveType) {
    
    const move = {
        description: moveDescription,
        type: moveType,
        turn: gameState.players.red.titansPlaced + gameState.players.blue.titansPlaced,
        timestamp: new Date().toLocaleTimeString()
    };
    
    
    console.log(`Adding move to history: Player=${player}, Type=${moveType}, Description=${moveDescription}`);
    
    
    if (!gameState.moveHistory) {
        gameState.moveHistory = { red: [], blue: [] };
    }
    if (!gameState.moveHistory[player]) {
        gameState.moveHistory[player] = [];
    }
    
    
    gameState.moveHistory[player].push(move);
    
    
    console.log('Current move history:', JSON.stringify(gameState.moveHistory, null, 2));
    
    
    updateMoveHistoryDisplay();
}

function updateMoveHistoryDisplay() {
    
    const redHistoryList = gameState.moveHistoryElements.red;
    const blueHistoryList = gameState.moveHistoryElements.blue;
    
    if (!redHistoryList || !blueHistoryList) {
        console.error('Move history list elements not found');
        return;
    }
    
    
    redHistoryList.innerHTML = '';
    blueHistoryList.innerHTML = '';
    
    
    function createMoveItem(move, index, player) {
        const listItem = document.createElement('li');
        listItem.className = `move-item ${move.type}-move`;
        
        
        const typeIndicator = document.createElement('span');
        typeIndicator.className = 'move-type';
        let icon = '⚡'; 
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

function clearMoveHistoryDisplay() {
    // Store the history elements in gameState
    gameState.moveHistoryElements.red = document.getElementById('red-history-list');
    gameState.moveHistoryElements.blue = document.getElementById('blue-history-list');
    
    if (!gameState.moveHistoryElements.red || !gameState.moveHistoryElements.blue) {
        
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

function getEdgeKey(node1, node2) {
    // Sort the nodes to ensure consistent edge keys
    return [node1, node2].sort().join('-');
}

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
