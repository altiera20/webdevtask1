
const replayController = {
    isActive: false,
    currentStep: 0,
    totalSteps: 0,
    autoplayInterval: null,
    autoplaySpeed: 1000, 
    originalGameState: null,
    replayStates: []
};


let originalGameState = null;

let originalBoardState = {};


function createInitialGameState() {
    
    const initialState = {
        
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
        
        
        currentPlayer: CONFIG.initialPlayerTurn,
        currentPhase: CONFIG.initialPhase,
        selectedNode: null,
        unlockedCircuits: [...CONFIG.initialUnlockedCircuits],
        
        
        controlledEdges: {
            red: [],
            blue: []
        },
        
        
        moveHistory: {
            red: [],
            blue: []
        }
    };
    
    
    CONFIG.circuits.forEach(circuit => {
        for (let i = 0; i < CONFIG.nodesPerCircuit; i++) {
            const nodeId = `${circuit}-${i}`;
            initialState.board[nodeId] = null;
        }
    });
    
    return initialState;
}

function startReplay() {
    console.log('Starting replay mode...');
    
    
    if (replayController.isActive) {
        console.log('Already in replay mode, ignoring request');
        return;
    }
    
    
    if (!gameHistory || gameHistory.length === 0) {
        alert('No game history available to replay. Play a game first!');
        console.log('No game history available');
        return;
    }
    
    console.log(`Found ${gameHistory.length} states in game history`);
    
    
    originalGameState = JSON.parse(JSON.stringify(gameState));
    
    
    originalBoardState = {};
    for (const nodeId in gameState.board) {
        originalBoardState[nodeId] = gameState.board[nodeId];
    }
    
    
    replayController.replayStates = [];
    
    
    for (let i = 0; i < gameHistory.length; i++) {
        replayController.replayStates.push(JSON.parse(JSON.stringify(gameHistory[i])));
    }
    
    
    replayController.isActive = true;
    replayController.currentStep = 0;
    replayController.totalSteps = replayController.replayStates.length - 1;
    
    console.log(`Replay setup with ${replayController.replayStates.length} states, totalSteps: ${replayController.totalSteps}`);
    
    
    const gameButtons = document.querySelectorAll('.game-controls button');
    gameButtons.forEach(button => {
        if (button.id !== 'replay-btn') {
            button.disabled = true;
        }
    });
    
    
    showReplayControls();
    
    
    if (replayController.replayStates.length > 0) {
        loadReplayState(0);
    }
    
    
    document.getElementById('status-message').textContent = 'Replay Mode: Step 0 of ' + replayController.totalSteps;
    
    
    if (typeof playSound === 'function') {
        playSound('buttonClick');
    }
}

function endReplay() {
    console.log('Ending replay mode...');
    
    if (!replayController.isActive) {
        console.log('Not in replay mode, ignoring request');
        return;
    }
    
    
    stopAutoplay();
    
    
    hideReplayControls();
    
    
    if (originalGameState) {
        console.log('Restoring original game state');
        
        
        document.querySelectorAll('.node').forEach(node => {
            node.classList.remove('red-occupied', 'blue-occupied', 'selected');
        });
        
        
        gameState.currentPlayer = originalGameState.currentPlayer;
        gameState.currentPhase = originalGameState.currentPhase;
        gameState.selectedNode = originalGameState.selectedNode;
        gameState.unlockedCircuits = [...originalGameState.unlockedCircuits];
        
        
        gameState.players.red.score = originalGameState.players.red.score;
        gameState.players.red.titansPlaced = originalGameState.players.red.titansPlaced;
        gameState.players.red.titansRemaining = originalGameState.players.red.titansRemaining;
        gameState.players.blue.score = originalGameState.players.blue.score;
        gameState.players.blue.titansPlaced = originalGameState.players.blue.titansPlaced;
        gameState.players.blue.titansRemaining = originalGameState.players.blue.titansRemaining;
        
        
        gameState.controlledEdges.red = [...originalGameState.controlledEdges.red];
        gameState.controlledEdges.blue = [...originalGameState.controlledEdges.blue];
        
        
        gameState.moveHistory.red = [...originalGameState.moveHistory.red];
        gameState.moveHistory.blue = [...originalGameState.moveHistory.blue];
        
        
        for (const nodeId in gameState.board) {
            gameState.board[nodeId] = null; 
        }
        for (const nodeId in originalBoardState) {
            gameState.board[nodeId] = originalBoardState[nodeId];
        }
        
        
        if (typeof updateGridDisplay === 'function') {
            updateGridDisplay();
        } else {
            
            for (const nodeId in gameState.board) {
                updateNodeDisplay(nodeId);
            }
        }
        
        
        updateUIFromState();
        
        
        if (typeof updateMoveHistoryDisplay === 'function') {
            updateMoveHistoryDisplay();
        }
    } else {
        console.error('No original game state to restore!');
    }
    
    
    replayController.isActive = false;
    replayController.currentStep = 0;
    replayController.totalSteps = 0;
    replayController.replayStates = [];
    
    
    originalGameState = null;
    originalBoardState = {};
    
    
    const gameButtons = document.querySelectorAll('.game-controls button');
    gameButtons.forEach(button => {
        button.disabled = false;
    });
    
    
    document.getElementById('status-message').textContent = 'Replay ended. You can continue your game now.';
    
    
    if (typeof playSound === 'function') {
        playSound('buttonClick');
    }
    
    console.log('Replay mode ended successfully - game can be continued');
}

function loadReplayState(stepIndex) {
    if (!replayController.isActive) {
        console.log('Not in replay mode, cannot load state');
        return;
    }
    
    if (stepIndex < 0 || stepIndex > replayController.totalSteps) {
        console.error(`Invalid step index: ${stepIndex}. Valid range: 0-${replayController.totalSteps}`);
        return;
    }
    
    console.log(`Loading replay state ${stepIndex} of ${replayController.totalSteps}`);
    
    
    replayController.currentStep = stepIndex;
    
    
    const stateToLoad = replayController.replayStates[stepIndex];
    if (stateToLoad) {
        
        for (const nodeId in gameState.board) {
            gameState.board[nodeId] = null;
        }
        
        
        gameState = JSON.parse(JSON.stringify(stateToLoad));
        
        console.log('Loaded board state:', gameState.board);
        
        
        try {
            
            document.querySelectorAll('.node').forEach(node => {
                node.classList.remove('red-occupied', 'blue-occupied', 'selected');
            });
            
            
            for (const nodeId in gameState.board) {
                const occupiedBy = gameState.board[nodeId];
                const nodeElement = document.getElementById(nodeId);
                
                if (nodeElement) {
                    
                    nodeElement.classList.remove('red-occupied', 'blue-occupied', 'selected');
                    
                    
                    if (occupiedBy === 'red') {
                        nodeElement.classList.add('red-occupied');
                    } else if (occupiedBy === 'blue') {
                        nodeElement.classList.add('blue-occupied');
                    }
                    
                    
                    if (nodeId === gameState.selectedNode) {
                        nodeElement.classList.add('selected');
                    }
                }
            }
            
            // Update the unlocked circuits display
            highlightUnlockedCircuits();
            
        } catch (error) {
            console.error('Error updating board display:', error);
        }
        
        // Update the rest of the UI
        updateUIFromState();
        
        // Update move history display
        if (typeof updateMoveHistoryDisplay === 'function') {
            updateMoveHistoryDisplay();
        }
    } else {
        console.error(`Failed to load replay state at index ${stepIndex}`);
    }
    
    
    updateReplayProgress();
    
    
    let statusText = `Replay Mode: Step ${stepIndex} of ${replayController.totalSteps}`;
    
    
    if (stepIndex === 0) {
        statusText += ' - Initial board setup';
    } else {
        statusText += ` - ${gameState.currentPlayer.toUpperCase()}'s turn (${gameState.currentPhase} phase)`;
    }
    
    document.getElementById('status-message').textContent = statusText;
}

function nextReplayStep() {
    if (!replayController.isActive) {
        return;
    }
    
    const nextStep = replayController.currentStep + 1;
    if (nextStep <= replayController.totalSteps) {
        loadReplayState(nextStep);
        
        
        if (typeof playSound === 'function') {
            playSound('buttonClick');
        }
    } else {
        
        if (replayController.autoplayInterval) {
            stopAutoplay(); 
        }
    }
}

function prevReplayStep() {
    if (!replayController.isActive) {
        return;
    }
    
    const prevStep = replayController.currentStep - 1;
    if (prevStep >= 0) {
        loadReplayState(prevStep);
        
        
        if (typeof playSound === 'function') {
            playSound('buttonClick');
        }
    }
}

function firstReplayStep() {
    if (!replayController.isActive) {
        return;
    }
    
    loadReplayState(0);
    
    // Play sound effect
    if (typeof playSound === 'function') {
        playSound('buttonClick');
    }
}

function lastReplayStep() {
    if (!replayController.isActive) {
        return;
    }
    
    loadReplayState(replayController.totalSteps);
    
    // Play sound effect
    if (typeof playSound === 'function') {
        playSound('buttonClick');
    }
}

function startAutoplay() {
    if (!replayController.isActive || replayController.autoplayInterval) {
        return;
    }
    
    
    if (replayController.currentStep >= replayController.totalSteps) {
        loadReplayState(0);
    }
    
    // Start autoplay interval
    replayController.autoplayInterval = setInterval(() => {
        const nextStep = replayController.currentStep + 1;
        if (nextStep <= replayController.totalSteps) {
            loadReplayState(nextStep);
        } else {
            stopAutoplay(); 
        }
    }, replayController.autoplaySpeed);
    
    // Update button text
    const autoplayBtn = document.getElementById('replay-autoplay');
    if (autoplayBtn) {
        autoplayBtn.textContent = '⏸ Pause';
    }
    
    // Play sound effect
    if (typeof playSound === 'function') {
        playSound('buttonClick');
    }
}

function stopAutoplay() {
    if (!replayController.isActive || !replayController.autoplayInterval) {
        return;
    }
    
    // Clear the interval
    clearInterval(replayController.autoplayInterval);
    replayController.autoplayInterval = null;
    
    // Update button text
    const autoplayBtn = document.getElementById('replay-autoplay');
    if (autoplayBtn) {
        autoplayBtn.textContent = '▶ Play';
    }
}

function toggleAutoplay() {
    if (!replayController.isActive) {
        return;
    }
    
    if (replayController.autoplayInterval) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

function setAutoplaySpeed(speed) {
    if (!replayController.isActive) {
        return;
    }
    
    // Set the new speed
    replayController.autoplaySpeed = speed;
    
    // If autoplay is active, restart it with the new speed
    if (replayController.autoplayInterval) {
        stopAutoplay();
        startAutoplay();
    }
    
    // Update speed display
    updateSpeedDisplay();
}

function updateSpeedDisplay() {
    const speedDisplay = document.getElementById('replay-speed-display');
    if (speedDisplay) {
        
        let speedText = '';
        if (replayController.autoplaySpeed >= 2000) {
            speedText = (replayController.autoplaySpeed / 1000) + 's (Slow)';
        } else if (replayController.autoplaySpeed >= 1000) {
            speedText = (replayController.autoplaySpeed / 1000) + 's (Normal)';
        } else if (replayController.autoplaySpeed >= 500) {
            speedText = (replayController.autoplaySpeed / 1000) + 's (Fast)';
        } else {
            speedText = (replayController.autoplaySpeed / 1000) + 's (Very Fast)';
        }
        
        speedDisplay.textContent = speedText;
    }
}

function updateReplayProgress() {
    const progressBar = document.getElementById('replay-progress-bar');
    const progressText = document.getElementById('replay-progress-text');
    
    if (progressBar && progressText) {
        
        const progressPercent = (replayController.currentStep / replayController.totalSteps) * 100;
        progressBar.style.width = progressPercent + '%';
        
        
        progressText.textContent = `${replayController.currentStep} / ${replayController.totalSteps}`;
    }
}

function showReplayControls() {
    console.log('Showing replay controls');
    
    // Remove existing controls if they exist
    hideReplayControls();
    
    // Create replay controls container
    const replayControls = document.createElement('div');
    replayControls.id = 'replay-controls';
    document.body.appendChild(replayControls);
    
    // Style the container
    replayControls.style.position = 'fixed';
    replayControls.style.bottom = '20px';
    replayControls.style.left = '50%';
    replayControls.style.transform = 'translateX(-50%)';
    replayControls.style.backgroundColor = '#34495e';
    replayControls.style.color = '#ecf0f1';
    replayControls.style.padding = '15px';
    replayControls.style.borderRadius = '10px';
    replayControls.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    replayControls.style.zIndex = '1000';
    replayControls.style.display = 'flex';
    replayControls.style.flexDirection = 'column';
    replayControls.style.alignItems = 'center';
    replayControls.style.gap = '10px';
    replayControls.style.width = '80%';
    replayControls.style.maxWidth = '600px';
    
    // Create controls content
    replayControls.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #f1c40f;">Game Replay</h3>
        
        <div style="width: 100%; background-color: #2c3e50; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 5px;">
            <div id="replay-progress-bar" style="height: 100%; width: 0%; background-color: #f1c40f; transition: width 0.3s;"></div>
        </div>
        <div id="replay-progress-text" style="margin-bottom: 10px;">0 / ${replayController.totalSteps}</div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <button id="replay-first" style="padding: 8px 12px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">⏮ First</button>
            <button id="replay-prev" style="padding: 8px 12px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">◀ Prev</button>
            <button id="replay-autoplay" style="padding: 8px 12px; background-color: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">▶ Play</button>
            <button id="replay-next" style="padding: 8px 12px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Next ▶</button>
            <button id="replay-last" style="padding: 8px 12px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Last ⏭</button>
        </div>
        
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span>Speed:</span>
            <button id="replay-speed-slow" style="padding: 5px 10px; background-color: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;">Slow</button>
            <button id="replay-speed-normal" style="padding: 5px 10px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Normal</button>
            <button id="replay-speed-fast" style="padding: 5px 10px; background-color: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;">Fast</button>
            <span id="replay-speed-display">1s (Normal)</span>
        </div>
        
        <button id="replay-exit" style="padding: 8px 16px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Exit Replay</button>
    `;
    
    // Add event listeners
    document.getElementById('replay-first').addEventListener('click', firstReplayStep);
    document.getElementById('replay-prev').addEventListener('click', prevReplayStep);
    document.getElementById('replay-autoplay').addEventListener('click', toggleAutoplay);
    document.getElementById('replay-next').addEventListener('click', nextReplayStep);
    document.getElementById('replay-last').addEventListener('click', lastReplayStep);
    document.getElementById('replay-exit').addEventListener('click', endReplay);
    
    // Speed controls
    document.getElementById('replay-speed-slow').addEventListener('click', () => setAutoplaySpeed(2000));
    document.getElementById('replay-speed-normal').addEventListener('click', () => setAutoplaySpeed(1000));
    document.getElementById('replay-speed-fast').addEventListener('click', () => setAutoplaySpeed(500));
    
    // Initialize speed display
    updateSpeedDisplay();
    
    // Initialize progress
    updateReplayProgress();
}

function hideReplayControls() {
    const replayControls = document.getElementById('replay-controls');
    if (replayControls) {
        replayControls.remove();
    }
}

// Export functions
window.startReplay = startReplay;
window.endReplay = endReplay;
