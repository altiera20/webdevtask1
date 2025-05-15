/**
 * timer.js
 * Handles game timers functionality
 */

// Timer variables
let gameTimerInterval = null;
let turnTimerInterval = null;
let gameTimeRemaining = 0;
let turnTimeRemaining = 0;
let timerPaused = false;

/**
 * Starts the overall game timer
 * @param {number} duration - Duration in seconds
 */
function startOverallTimer(duration) {
    // Clear any existing game timer
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
    }
    
    // Initialize timer value
    gameTimeRemaining = duration;
    updateGameTimerDisplay();
    
    // Set up interval to update timer every second
    gameTimerInterval = setInterval(() => {
        if (!timerPaused) {
            gameTimeRemaining--;
            updateGameTimerDisplay();
            
            // Check if time has run out
            if (gameTimeRemaining <= 0) {
                clearInterval(gameTimerInterval);
                handleGameTimeExpired();
            }
        }
    }, 1000);
}

/**
 * Starts the turn timer
 * @param {number} duration - Duration in seconds
 */
function startTurnTimer(duration) {
    // Clear any existing turn timer
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
    }
    
    // Initialize timer value
    turnTimeRemaining = duration;
    updateTurnTimerDisplay();
    
    // Set up interval to update timer every second
    turnTimerInterval = setInterval(() => {
        if (!timerPaused) {
            turnTimeRemaining--;
            updateTurnTimerDisplay();
            
            // Check if time has run out
            if (turnTimeRemaining <= 0) {
                clearInterval(turnTimerInterval);
                handleTurnTimeExpired();
            }
        }
    }, 1000);
}

/**
 * Resets the turn timer
 */
function resetTurnTimer() {
    startTurnTimer(CONFIG.turnTimerDuration);
}

/**
 * Pauses both game and turn timers
 */
function pauseTimer() {
    timerPaused = true;
    document.getElementById('toggle-timer').textContent = 'Resume Timer';
    
    // Play sound effect when pausing
    if (typeof playSound === 'function') {
        playSound('buttonClick');
    }
}

/**
 * Resumes both game and turn timers
 */
function resumeTimer() {
    timerPaused = false;
    document.getElementById('toggle-timer').textContent = 'Pause Timer';
    
    // Play sound effect when resuming
    if (typeof playSound === 'function') {
        playSound('startGame');
    }
}

/**
 * Toggles between paused and resumed states
 */
function toggleTimer() {
    if (timerPaused) {
        resumeTimer();
    } else {
        pauseTimer();
    }
}

/**
 * Resets all timers
 */
function resetTimers() {
    // Clear existing intervals
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
    
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
        turnTimerInterval = null;
    }
    
    // Reset timer values
    gameTimeRemaining = 0;
    turnTimeRemaining = 0;
    timerPaused = false;
    
    // Update displays
    updateGameTimerDisplay();
    updateTurnTimerDisplay();
    
    // Reset button text
    document.getElementById('toggle-timer').textContent = 'Pause Timer';
}

/**
 * Updates the game timer display with current time remaining
 */
function updateGameTimerDisplay() {
    const minutes = Math.floor(gameTimeRemaining / 60);
    const seconds = gameTimeRemaining % 60;
    
    // Format as MM:SS with leading zeros
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('game-timer').textContent = formattedTime;
}

/**
 * Updates the turn timer display with current time remaining
 */
function updateTurnTimerDisplay() {
    const minutes = Math.floor(turnTimeRemaining / 60);
    const seconds = turnTimeRemaining % 60;
    
    // Format as MM:SS with leading zeros
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('turn-timer').textContent = formattedTime;
}

/**
 * Handles what happens when the game timer expires
 */
function handleGameTimeExpired() {
    // Determine winner based on current scores
    let winner;
    
    if (gameState.players.red.score > gameState.players.blue.score) {
        winner = 'red';
    } else if (gameState.players.blue.score > gameState.players.red.score) {
        winner = 'blue';
    } else {
        winner = 'tie';
    }
    
    // End the game with appropriate message
    if (winner === 'tie') {
        document.getElementById('status-message').textContent = "Game Over! It's a tie!";
    } else {
        endGame(winner);
    }
}

/**
 * Handles what happens when a turn timer expires
 */
function handleTurnTimeExpired() {
    // Auto-switch to next player when turn time expires
    document.getElementById('status-message').textContent = `Time's up! Switching to next player.`;
    
    // Reset turn timer for next player
    resetTurnTimer();
    
    // Switch player
    switchPlayer();
    
    // Update UI
    updateUIFromState();
}
