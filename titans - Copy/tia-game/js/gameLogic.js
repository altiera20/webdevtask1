/**
 * gameLogic.js
 * Contains the core game rules and logic for the hexagonal strategy game
 */

/**
 * Starts a new game, initializing the game state and UI
 */
function startGame() {
    // Initialize game state
    initializeGameState();
    
    // Initialize grid UI
    updateGridDisplay();
    
    // Start timers
    startOverallTimer(CONFIG.gameTimerDuration);
    startTurnTimer(CONFIG.turnTimerDuration);
    
    // Enable controls
    enableGameControls();
    
    // Initialize move history display
    if (typeof clearMoveHistoryDisplay === 'function') {
        clearMoveHistoryDisplay();
    }
    
    // Play start game sound
    if (typeof playSound === 'function') {
        playSound('startGame');
    }
    
    // Update status message
    const statusMessage = "Game started! Red player, place your titan on the outer circuit.";
    document.getElementById('status-message').textContent = statusMessage;
    console.log(statusMessage);
}

/**
 * Handles a click on a node based on the current game phase and state
 * @param {string} nodeId - The ID of the clicked node
 */
function handleNodeClick(nodeId) {
    console.log(`Node clicked: ${nodeId}`);
    
    // If game hasn't started yet, do nothing
    if (!gameState.currentPlayer) {
        return;
    }
    
    // Placement Phase Logic
    if (gameState.currentPhase === 'placement') {
        handlePlacementPhaseClick(nodeId);
    }
    // Movement Phase Logic
    else if (gameState.currentPhase === 'movement') {
        handleMovementPhaseClick(nodeId);
    }
}

/**
 * Handles node clicks during the placement phase
 * @param {string} nodeId - The ID of the clicked node
 */
function handlePlacementPhaseClick(nodeId) {
    // Check if the placement is valid
    if (isValidPlacement(nodeId)) {
        // Place titan on the node
        placeTitan(nodeId);
        
        // Check and unlock the next circuit if conditions are met
        checkAndUnlockNextCircuit(); 
        
        // After placement, check if both players have placed all titans
        const total = CONFIG.totalTitansPerPlayer;
        const redDone = gameState.players.red.titansPlaced >= total;
        const blueDone = gameState.players.blue.titansPlaced >= total;
        
        console.log(`Checking phase transition - Red titans: ${gameState.players.red.titansPlaced}/${total}, Blue titans: ${gameState.players.blue.titansPlaced}/${total}`);
        
        if (redDone && blueDone) {
            console.log("Switching to movement phase!");
            gameState.currentPhase = 'movement';
            resetTurnTimer();
            updateUIFromState();
            document.getElementById('status-message').textContent = 
                `Movement phase begins! ${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)} player, select a titan to move`;
        } else {
            // Still in placement phase, switch to next player
            switchPlayer();
            updateUIFromState();
        }
    } else {
        const statusMessage = "Invalid placement. Select an empty node on an unlocked circuit.";
        document.getElementById('status-message').textContent = statusMessage;
        // console.log(statusMessage); // Logging from isValidPlacement gives more detail
    }
}

/**
 * Handles node clicks during the movement phase
 * @param {string} nodeId - The ID of the clicked node
 */
function handleMovementPhaseClick(nodeId) {
    // If no node is currently selected
    if (!gameState.selectedNode) {
        // Check if the clicked node has the current player's titan
        if (gameState.board[nodeId] === gameState.currentPlayer) {
            // Select this node
            gameState.selectedNode = nodeId;
            
            // Update node display to show selection
            updateNodeDisplay(nodeId);
            
            // Play select titan sound
            if (typeof playSound === 'function') {
                playSound('selectTitan');
            }
            
            // Highlight valid move destinations
            highlightValidMoves(nodeId);
            
            // Update status message
            const statusMessage = `Select a destination for your titan from ${nodeId}`;
            document.getElementById('status-message').textContent = statusMessage;
        } else {
            const statusMessage = "Select one of your own titans to move.";
            document.getElementById('status-message').textContent = statusMessage;
        }
    }
    // If a node is already selected
    else {
        // Check if the clicked node is a valid move destination
        if (isValidMove(gameState.selectedNode, nodeId)) {
            // Move the titan
            moveTitan(gameState.selectedNode, nodeId);
            
            // Update UI to reflect all changes from the move and score updates
            updateUIFromState(); 
            
            // Reset turn timer and switch to the next player
            // gameState.selectedNode is cleared in updateStateForMovement, which is called by moveTitan
            switchPlayer();
            resetTurnTimer(); // Reset for the new player's turn
        }
        // If clicked on the same node, deselect it
        else if (nodeId === gameState.selectedNode) {
            gameState.selectedNode = null;
            clearAllHighlights();
            updateNodeDisplay(nodeId);
            
            // Update status message
            const statusMessage = `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)} player, select a titan to move`;
            document.getElementById('status-message').textContent = statusMessage;
        }
        // If clicked on an invalid destination
        else {
            const statusMessage = "Invalid move. Titans can only move to adjacent empty nodes.";
            document.getElementById('status-message').textContent = statusMessage;
            
            // Play invalid move sound
            if (typeof playSound === 'function') {
                playSound('invalidMove');
            }
        }
    }
}

/**
 * Places a titan on a node during the placement phase
 * @param {string} nodeId - The ID of the node to place the titan on
 */
function placeTitan(nodeId) {
    // Update game state for placement
    updateStateForPlacement(nodeId);
    
    // Update visual display
    updateNodeDisplay(nodeId);
    
    // Animate the placement
    animateNodeAction(nodeId);
    
    // Play placement sound
    if (typeof playSound === 'function') {
        playSound('placeTitan');
    }
    
    // Check for surrounded titans and eliminate them
    checkForSurroundedTitans();
    
    // Check for controlled edges and update scores
    checkControlledEdges();
    
    // Check if game should end
    checkWinConditions();
    
    console.log(`${gameState.currentPlayer} player placed a titan on ${nodeId}`);
}

/**
 * Moves a titan from one node to another during the movement phase
 * @param {string} fromNodeId - The ID of the source node
 * @param {string} toNodeId - The ID of the destination node
 */
function moveTitan(fromNodeId, toNodeId) {
    // Update game state for movement
    updateStateForMovement(fromNodeId, toNodeId);
    
    // Update visual display of both nodes
    updateNodeDisplay(fromNodeId);
    updateNodeDisplay(toNodeId);
    
    // Animate the movement
    animateNodeAction(fromNodeId, toNodeId);
    
    // Play movement sound
    if (typeof playSound === 'function') {
        playSound('moveTitan');
    }
    
    // Explicitly record this move in history and update display
    if (typeof addMoveToHistory === 'function') {
        addMoveToHistory(gameState.currentPlayer, `Moved titan from ${fromNodeId} to ${toNodeId}`, 'movement');
    }
    
    // Check for surrounded titans and eliminate them
    checkForSurroundedTitans();
    
    // Check if game should end
    checkWinConditions();
    
    console.log(`${gameState.currentPlayer} player moved a titan from ${fromNodeId} to ${toNodeId}`);
}

/**
 * Checks if a placement on a node is valid during the placement phase
 * @param {string} nodeId - The ID of the node to check
 * @returns {boolean} - True if the placement is valid, false otherwise
 */
function isValidPlacement(nodeId) {
    console.log(`[isValidPlacement] Checking node: ${nodeId}`);
    
    // New: Check if player has any titans left to place
    if (gameState.players[gameState.currentPlayer].titansRemaining <= 0) {
        console.log(`[isValidPlacement] Player ${gameState.currentPlayer} has no titans remaining. Returning false.`);
        return false;
    }

    // Node must be empty
    if (gameState.board[nodeId] !== null) {
        console.log(`[isValidPlacement] Node ${nodeId} is NOT empty (contains: ${gameState.board[nodeId]}). Returning false.`);
        return false;
    }
    console.log(`[isValidPlacement] Node ${nodeId} is empty.`);
    
    // Node must be on an unlocked circuit
    const circuit = nodeId.split('-')[0];
    console.log(`[isValidPlacement] Extracted circuit: '${circuit}' for node ${nodeId}.`);
    console.log(`[isValidPlacement] Current gameState.unlockedCircuits: ${JSON.stringify(gameState.unlockedCircuits)}`);
    
    if (!gameState.unlockedCircuits.includes(circuit)) {
        console.log(`[isValidPlacement] Circuit '${circuit}' is NOT in unlockedCircuits. Returning false.`);
        return false;
    }
    console.log(`[isValidPlacement] Circuit '${circuit}' IS in unlockedCircuits. Placement is valid.`);
    
    return true;
}

/**
 * Checks if a move from one node to another is valid during the movement phase
 * @param {string} fromNodeId - The ID of the source node
 * @param {string} toNodeId - The ID of the destination node
 * @returns {boolean} - True if the move is valid, false otherwise
 */
function isValidMove(fromNodeId, toNodeId) {
    // Source node must have the current player's titan
    if (gameState.board[fromNodeId] !== gameState.currentPlayer) {
        return false;
    }
    
    // Destination node must be empty
    if (gameState.board[toNodeId] !== null) {
        return false;
    }
    
    // Destination must be adjacent to source
    const adjacentNodes = CONFIG.adjacencyList[fromNodeId] || [];
    if (!adjacentNodes.includes(toNodeId)) {
        return false;
    }
    
    return true;
}

/**
 * Updates the game state after a titan is placed on a node.
 * @param {string} nodeId - The ID of the node.
 */
function updateStateForPlacement(nodeId) {
    if (!nodeId) {
        console.error("updateStateForPlacement: nodeId is null/undefined.");
        return;
    }

    // Update game state for placement
    gameState.board[nodeId] = gameState.currentPlayer;
    gameState.players[gameState.currentPlayer].titansRemaining -= 1;
    gameState.players[gameState.currentPlayer].titansPlaced += 1;  

    // Check for new controlled edges and update scores
    checkControlledEdges();
}

/**
 * Updates the game state after a titan moves from one node to another.
 * @param {string} fromNodeId - The ID of the source node.
 * @param {string} toNodeId - The ID of the destination node.
 */
function updateStateForMovement(fromNodeId, toNodeId) {
    if (!fromNodeId || !toNodeId) {
        console.error("updateStateForMovement: fromNodeId or toNodeId is null/undefined.");
        return;
    }
    const player = gameState.board[fromNodeId];
    if (!player) {
        console.error(`updateStateForMovement: No player found on source node ${fromNodeId}.`);
        return;
    }

    gameState.board[toNodeId] = player;      // Move player to the new node
    gameState.board[fromNodeId] = null;    // Empty the old node
    gameState.selectedNode = null;         // Clear selection after move is committed

    // Check for new controlled edges and update scores
    checkControlledEdges(); 
}

/**
 * Switches the current player and updates the game state for the new turn.
 */
function switchPlayer() {
    gameState.currentPlayer = (gameState.currentPlayer === 'red') ? 'blue' : 'red';
    // gameState.selectedNode = null; // Already cleared in updateStateForMovement or deselect logic

    // Play switch player sound
    if (typeof playSound === 'function') {
        playSound('switchPlayer');
    }

    // Determine current phase for status message
    let phaseMessagePart = "";
    if (gameState.currentPhase === 'placement') {
        const titansRemaining = gameState.players[gameState.currentPlayer]?.titansRemaining || CONFIG.totalTitansPerPlayer;
        phaseMessagePart = `place a titan. (${titansRemaining} remaining)`;
    } else if (gameState.currentPhase === 'movement') {
        phaseMessagePart = "move a titan.";
    } else {
        phaseMessagePart = "take your turn."; // Generic fallback
    }
    
    const statusMessage = `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)} player, ${phaseMessagePart}`;
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = statusMessage;
    } else {
        console.warn("Status message element not found.");
    }

    console.log(`Switched to ${gameState.currentPlayer}'s turn. Phase: ${gameState.currentPhase}`);
    // resetTurnTimer(); // This is called after switchPlayer in handleMovementPhaseClick and handlePlacementPhaseClick
}

/**
 * Checks and updates controlled edges after a titan is placed or moved
 */
function checkControlledEdges() {
    // Track previous scores and controlled edges
    const previousEdges = {
        red: [...gameState.controlledEdges.red],
        blue: [...gameState.controlledEdges.blue]
    };

    // Clear current controlled edges
    gameState.controlledEdges.red = [];
    gameState.controlledEdges.blue = [];

    // Helper to get canonical edge key for weight lookup, as CONFIG.edgeWeights might use sorted keys
    // This local getEdgeKey is specifically for this function's context and might differ from global one if any.
    const getCanonicalEdgeKey = (node1, node2) => [node1, node2].sort().join('-');

    // Check all possible edges
    Object.keys(CONFIG.adjacencyList).forEach(nodeId1 => {
        const adjacentNodes = CONFIG.adjacencyList[nodeId1];
        
        adjacentNodes.forEach(nodeId2 => {
            // Ensure we only process each edge once (e.g., A-B, not B-A as well)
            if (nodeId1 < nodeId2) { 
                const playerOnNode1 = gameState.board[nodeId1];
                const playerOnNode2 = gameState.board[nodeId2];
                
                // Check if both nodes are controlled by the same player
                if (playerOnNode1 && playerOnNode1 === playerOnNode2) {
                    const edgeKey = getCanonicalEdgeKey(nodeId1, nodeId2);
                    gameState.controlledEdges[playerOnNode1].push(edgeKey);
                }
            }
        });
    });

    // Calculate score changes
    const calculateScoreChanges = (player) => {
        const previousPlayerEdges = new Set(previousEdges[player]);
        const currentPlayerEdges = new Set(gameState.controlledEdges[player]);

        // Edges lost are those in 'previous' but not in 'current'
        const lostEdges = [...previousPlayerEdges].filter(edge => !currentPlayerEdges.has(edge));
        // Edges gained are those in 'current' but not in 'previous'
        const gainedEdges = [...currentPlayerEdges].filter(edge => !previousPlayerEdges.has(edge));

        // Use the canonical key for weight lookup
        const sumEdgeWeights = (edges) => edges.reduce((sum, edge) => {
            // edge is already a canonical key string like "node1-node2"
            return sum + (CONFIG.edgeWeights[edge] || 1); 
        }, 0);

        return {
            lost: sumEdgeWeights(lostEdges),
            gained: sumEdgeWeights(gainedEdges)
        };
    };

    // Update scores for both players
    ['red', 'blue'].forEach(player => {
        const changes = calculateScoreChanges(player);
        if (changes.gained > 0) {
            updateScore(player, changes.gained, true);
        }
        if (changes.lost > 0) {
            updateScore(player, changes.lost, false);
        }
    });

    highlightControlledEdges(); // Visually update controlled edges (if implemented)
}

/**
 * Updates a player's score
 * @param {string} player - The player ('red' or 'blue')
 * @param {number} points - The number of points to add or subtract
 * @param {boolean} isAdding - True to add points, false to subtract
 */
function updateScore(player, points, isAdding) {
    const currentScore = gameState.players[player].score;
    // const validPoints = Math.max(0, points); // Temporarily removing this line for debugging
    const newScore = currentScore + (isAdding ? points : -points); // Using points directly

    console.log(`[updateScore] Player: ${player}, PointsArg: ${points}, isAdding: ${isAdding}`);
    console.log(`[updateScore] CurrentScore: ${currentScore}, Calculated NewScoreBeforeMax: ${newScore}`);
    
    gameState.players[player].score = Math.max(newScore, 0); 
    console.log(`[updateScore] Final Score for ${player} (after Math.max(0)): ${gameState.players[player].score}`);
    
    // Play score sound if points are added
    if (isAdding && points > 0 && typeof playSound === 'function') {
        playSound('scorePoints');
    }
    
    // Update score display
    const scoreElement = document.getElementById(`${player}-score`);
    if (scoreElement) {
        scoreElement.textContent = gameState.players[player].score;
    } else {
        console.warn(`Score element for player ${player} not found.`);
    }
    
    // Check win conditions after score update
    checkWinConditions();
}

/**
 * Checks if any win conditions have been met
 */
function checkWinConditions() {
    console.log('Checking win conditions...');
    
    // Check if inner circuit is fully occupied
    if (isInnerCircuitFull()) {
        console.log('INNER CIRCUIT IS FULL - Determining winner...');
        // Calculate winner based on score
        const redScore = gameState.players.red.score;
        const blueScore = gameState.players.blue.score;
        console.log(`Scores: Red=${redScore}, Blue=${blueScore}`);
        
        if (redScore > blueScore) {
            console.log('Red wins!');
            endGame('red');
        } else if (blueScore > redScore) {
            console.log('Blue wins!');
            endGame('blue');
        } else {
            console.log('Game is a draw!');
            endGame('draw');
        }
        return;
    }

    // Check score-based win condition
    if (gameState.players.red.score >= 20) {
        console.log('Red wins by score!');
        endGame('red');
    } else if (gameState.players.blue.score >= 20) {
        console.log('Blue wins by score!');
        endGame('blue');
    }
}

/**
 * Checks if the inner circuit is fully occupied
 * @returns {boolean} - True if inner circuit is fully occupied, false otherwise
 */
function isInnerCircuitFull() {
    const nodesPerCircuit = CONFIG.nodesPerCircuit;
    console.log(`Checking inner circuit fullness. Nodes per circuit: ${nodesPerCircuit}`);
    
    for (let i = 0; i < nodesPerCircuit; i++) {
        const nodeId = `inner-${i}`;
        console.log(`Checking node ${nodeId}: ${gameState.board[nodeId]}`);
        if (gameState.board[nodeId] === null) {
            console.log(`Node ${nodeId} is empty. Inner circuit is not full.`);
            return false;
        }
    }
    
    console.log('All inner circuit nodes are occupied. Game should end.');
    return true;
}

/**
 * Ends the game and declares a winner
 * @param {string} winner - The winning player ('red' or 'blue')
 */
function endGame(winner) {
    // Update status message
    let statusMessage;
    if (winner === 'draw') {
        statusMessage = 'Game Over! The game ended in a draw!';
    } else {
        const winnerColor = winner === 'red' ? 'RED' : 'BLUE';
        statusMessage = `Game Over! ${winner.charAt(0).toUpperCase() + winner.slice(1)} player wins!\n\nWinner: <span class="team-color">${winnerColor}</span> Team`;
    }
    
    // Play end game sound
    if (typeof playSound === 'function') {
        playSound('endGame');
    }
    
    // For actual wins (not draws), add special celebration effects
    if (winner !== 'draw') {
        // Launch confetti celebration directly
        console.log('Attempting to launch confetti...');
        try {
            // Delay slightly to ensure DOM is ready
            setTimeout(() => {
                if (typeof launchConfetti === 'function') {
                    console.log('Confetti function found, launching...');
                    launchConfetti();
                } else {
                    console.error('launchConfetti function not found!');
                    alert('Confetti function not available. Check if confetti.js is loaded properly.');
                }
            }, 500);
        } catch (error) {
            console.error('Error launching confetti:', error);
        }
        
        // Play victory sound if available
        try {
            if (typeof playSound === 'function') {
                // Play the win-game.mp3 sound with increased volume for emphasis
                setTimeout(() => playSound('winGame', 1.5), 1000);
            }
        } catch (error) {
            console.error('Error playing victory sound:', error);
        }
        
        // Check if score qualifies for leaderboard
        const winnerScore = gameState.players[winner].score;
        if (typeof leaderboard !== 'undefined' && typeof showNameEntryForm !== 'undefined') {
            // Delay to allow celebration effects to play first
            setTimeout(() => {
                if (leaderboard.isHighScore(winnerScore)) {
                    // Show name entry form and then show leaderboard
                    showNameEntryForm(winner, winnerScore, showLeaderboard);
                } else {
                    // Just show the leaderboard
                    showLeaderboard();
                }
            }, 3000); // Show after 3 seconds to allow celebration effects to complete
        }
    }
    
    // Get the game status container
    const statusContainer = document.querySelector('.game-status');
    if (statusContainer) {
        // Clear all existing content
        statusContainer.innerHTML = `<p>${statusMessage}</p>`;
        
        // Add game over class
        statusContainer.classList.add('game-over');
        
        // Style the message
        const messageElement = statusContainer.querySelector('p');
        if (messageElement) {
            messageElement.style.textAlign = 'center';
            messageElement.style.padding = '20px';
            messageElement.style.margin = '20px 0';
            messageElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            messageElement.style.borderRadius = '8px';
            messageElement.style.fontSize = '1.5em';
            messageElement.style.lineHeight = '1.6';
            messageElement.style.color = '#ecf0f1';
        }
    }
    
    // Stop timers
    pauseTimer();
    
    // Disable game controls
    disableGameControls();
}

/**
 * Resets the game to starting state
 */
function resetGame() {
    // Reset game state
    initializeGameState();
    
    // Reset UI
    updateGridDisplay();
    
    // Reset timers
    resetTimers();
    
    // Play start game sound
    if (typeof playSound === 'function') {
        playSound('startGame');
    }
    
    // Update status message
    const statusMessage = "Game reset. Press 'Start Game' to begin.";
    document.getElementById('status-message').textContent = statusMessage;
    console.log(statusMessage);
    
    // Disable game controls until game starts again
    disableGameControls();
}

/**
 * Enables game controls
 */
function enableGameControls() {
    // This is a placeholder for enabling game controls
    // Will be implemented in a future iteration
    document.getElementById('reset-game').disabled = false;
    document.getElementById('toggle-timer').disabled = false;
}

/**
 * Disables game controls
 */
function disableGameControls() {
    // Disable all game control buttons
    const buttons = document.querySelectorAll('.game-controls button');
    buttons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.5';
    });
    
    // Disable all nodes (make them non-interactive)
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(node => {
        node.style.pointerEvents = 'none';
        node.style.opacity = '0.5'; // Make them visually indicate they're disabled
    });
}

/**
 * Checks game state and unlocks the next circuit in sequence if conditions are met.
 * Outer must be full to unlock Middle.
 * Middle must be full to unlock Inner.
 */
function checkAndUnlockNextCircuit() {
    const currentlyUnlocked = gameState.unlockedCircuits;

    // Try to unlock MIDDLE circuit
    // Condition: 'outer' is filled AND 'middle' is not yet unlocked.
    if (currentlyUnlocked.includes('outer') && !currentlyUnlocked.includes('middle')) {
        let outerCircuitFilled = true;
        for (let i = 0; i < CONFIG.nodesPerCircuit; i++) {
            if (gameState.board[`outer-${i}`] === null) {
                outerCircuitFilled = false;
                break;
            }
        }
        if (outerCircuitFilled) {
            gameState.unlockedCircuits.push('middle');
            console.log("Middle circuit has been unlocked (because outer circuit is full)!");
            
            // Play unlock circuit sound
            if (typeof playSound === 'function') {
                playSound('unlockCircuit');
            }
            
            // Update status message or UI if needed, e.g., through updateUIFromState() or a specific message.
        }
    }

    if (currentlyUnlocked.includes('middle') && !currentlyUnlocked.includes('inner')) {
        let middleCircuitFilled = true;
        for (let i = 0; i < CONFIG.nodesPerCircuit; i++) {
            if (gameState.board[`middle-${i}`] === null) {
                middleCircuitFilled = false;
                break;
            }
        }
        if (middleCircuitFilled) {
            gameState.unlockedCircuits.push('inner');
            console.log("Inner circuit has been unlocked (because middle circuit is full)!");
            
            // Play unlock circuit sound
            if (typeof playSound === 'function') {
                playSound('unlockCircuit', 1.2); // Slightly louder for inner circuit unlock
            }
        }
    }
}

/**
 * Checks for surrounded titans and eliminates them
 * A titan is considered surrounded if all adjacent nodes are occupied by opponent titans
 */
/**
 * Displays a dramatic "TITAN ELIMINATED" message when a titan is eliminated
 * @param {string} nodeId - The ID of the node where the titan was eliminated
 * @param {string} player - The player whose titan was eliminated ('red' or 'blue')
 */
function displayTitanEliminatedMessage(nodeId, player) {
    // Get the node's position for positioning the message
    const nodeElement = document.getElementById(nodeId);
    if (!nodeElement) return;
    
    // Create the message element
    const messageElement = document.createElement('div');
    messageElement.className = 'elimination-message';
    messageElement.textContent = 'TITAN ELIMINATED';
    
    // Style the message
    messageElement.style.position = 'absolute';
    messageElement.style.zIndex = '9999';
    messageElement.style.color = player === 'red' ? '#e74c3c' : '#3498db';
    messageElement.style.fontWeight = 'bold';
    messageElement.style.fontSize = '24px';
    messageElement.style.textShadow = '0 0 10px #000';
    messageElement.style.fontFamily = '"Impact", sans-serif';
    messageElement.style.textTransform = 'uppercase';
    messageElement.style.letterSpacing = '2px';
    messageElement.style.padding = '10px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    messageElement.style.border = `2px solid ${player === 'red' ? '#e74c3c' : '#3498db'}`;
    messageElement.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    messageElement.style.animation = 'eliminationMessage 2s forwards';
    
    // Position the message near the eliminated titan
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
        gameBoard.appendChild(messageElement);
        
        // Position the message relative to the node
        const nodeBounds = nodeElement.getBoundingClientRect();
        const boardBounds = gameBoard.getBoundingClientRect();
        
        messageElement.style.left = `${nodeBounds.left - boardBounds.left - 50}px`;
        messageElement.style.top = `${nodeBounds.top - boardBounds.top - 40}px`;
        
        // Add animation style if it doesn't exist
        if (!document.getElementById('elimination-animation-style')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'elimination-animation-style';
            styleElement.textContent = `
                @keyframes eliminationMessage {
                    0% { transform: scale(0.5); opacity: 0; }
                    10% { transform: scale(1.2); opacity: 1; }
                    20% { transform: scale(1); }
                    80% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Remove the message after animation completes
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 2000);
    }
}

function checkForSurroundedTitans() {
    console.log('Checking for surrounded titans...');
    
    // Track eliminated titans for reporting
    const eliminatedTitans = [];
    
    // Check each node on the board
    Object.keys(gameState.board).forEach(nodeId => {
        const occupiedBy = gameState.board[nodeId];
        
        // Skip empty nodes
        if (!occupiedBy) return;
        
        // Get adjacent nodes from the adjacency list
        const adjacentNodes = CONFIG.adjacencyList[nodeId] || [];
        
        // If no adjacent nodes, can't be surrounded
        if (adjacentNodes.length === 0) return;
        
        // Check if all adjacent nodes are occupied by the opponent
        const opponent = occupiedBy === 'red' ? 'blue' : 'red';
        
        // Count how many adjacent nodes are occupied by the opponent
        let opponentCount = 0;
        let totalOccupied = 0;
        
        adjacentNodes.forEach(adjNodeId => {
            if (gameState.board[adjNodeId] === opponent) {
                opponentCount++;
                totalOccupied++;
            } else if (gameState.board[adjNodeId] !== null) {
                totalOccupied++;
            }
        });
        
        // A titan is surrounded if all adjacent nodes are occupied AND all are by the opponent
        const isSurrounded = (opponentCount > 0) && (opponentCount === totalOccupied) && (opponentCount === adjacentNodes.length);
        
        // If surrounded, eliminate the titan
        if (isSurrounded) {
            console.log(`Titan at ${nodeId} is surrounded and will be eliminated!`);
            
            // Save current state to history before making a change
            gameHistory.push(deepCopyGameState(gameState));
            redoStack.length = 0; // Clear redo stack on new action
            
            // Clear the node
            gameState.board[nodeId] = null;
            
            // Update the node display
            updateNodeDisplay(nodeId);
            
            // Add to eliminated list
            eliminatedTitans.push({
                nodeId: nodeId,
                player: occupiedBy
            });
            
            // Play shotgun sound for elimination
            if (typeof playSound === 'function') {
                playSound('eliminateTitan', 1.5); // Play shotgun sound at higher volume
            }
            
            // Create and display a TITAN ELIMINATED message
            displayTitanEliminatedMessage(nodeId, occupiedBy);
            
            // Give points to the player who surrounded the titan
            updateScore(opponent, 2, true); // Award 2 points for eliminating a titan
            
            // Add to move history
            if (typeof addMoveToHistory === 'function') {
                addMoveToHistory(opponent, `Eliminated ${occupiedBy} titan at ${nodeId}`, 'elimination');
            }
            
            // Animate the elimination
            animateNodeAction(nodeId);
        }
    });
    
    // If any titans were eliminated, update the UI
    if (eliminatedTitans.length > 0) {
        // Update UI to reflect changes
        updateUIFromState();
        
        // Play the place titan sound
        if (typeof playSound === 'function') {
            playSound('placeTitan');
        }
        
        // Check for surrounded titans
        checkForSurroundedTitans();
        
        // Show message about eliminations
        const message = eliminatedTitans.length === 1 ?
            `A titan was eliminated at ${eliminatedTitans[0].nodeId}!` :
            `${eliminatedTitans.length} titans were eliminated!`;
        
        document.getElementById('status-message').textContent = message;
        
        console.log(`Eliminated ${eliminatedTitans.length} titans:`, eliminatedTitans);
    }
}
