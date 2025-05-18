
let gameTimerInterval = null;
let turnTimerInterval = null;
let gameTimeRemaining = 0;
let turnTimeRemaining = 0;
let timerPaused = false;

function startOverallTimer(duration) {
    
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
    }
    
    
    gameTimeRemaining = duration;
    updateGameTimerDisplay();
    
    
    gameTimerInterval = setInterval(() => {
        if (!timerPaused) {
            gameTimeRemaining--;
            updateGameTimerDisplay();
            
            
            if (gameTimeRemaining <= 0) {
                clearInterval(gameTimerInterval);
                handleGameTimeExpired();
            }
        }
    }, 1000);
}

function startTurnTimer(duration) {
    
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
    }
    
    
    turnTimeRemaining = duration;
    updateTurnTimerDisplay();
    
    
    turnTimerInterval = setInterval(() => {
        if (!timerPaused) {
            turnTimeRemaining--;
            updateTurnTimerDisplay();
            
            
            if (turnTimeRemaining <= 0) {
                clearInterval(turnTimerInterval);
                handleTurnTimeExpired();
            }
        }
    }, 1000);
}

function resetTurnTimer() {
    startTurnTimer(CONFIG.turnTimerDuration);
}

function pauseTimer() {
    timerPaused = true;
    document.getElementById('toggle-timer').textContent = 'Resume Timer';
    
    
    if (typeof playSound === 'function') {
        playSound('buttonClick');
    }
}

function resumeTimer() {
    timerPaused = false;
    document.getElementById('toggle-timer').textContent = 'Pause Timer';
    
    
    if (typeof playSound === 'function') {
        playSound('startGame');
    }
}

function toggleTimer() {
    if (timerPaused) {
        resumeTimer();
    } else {
        pauseTimer();
    }
}

function resetTimers() {
    
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
    
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
        turnTimerInterval = null;
    }
    
    
    gameTimeRemaining = 0;
    turnTimeRemaining = 0;
    timerPaused = false;
    
    
    updateGameTimerDisplay();
    updateTurnTimerDisplay();
    
    
    document.getElementById('toggle-timer').textContent = 'Pause Timer';
}

function updateGameTimerDisplay() {
    const minutes = Math.floor(gameTimeRemaining / 60);
    const seconds = gameTimeRemaining % 60;
    
    
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('game-timer').textContent = formattedTime;
}

function updateTurnTimerDisplay() {
    const minutes = Math.floor(turnTimeRemaining / 60);
    const seconds = turnTimeRemaining % 60;
    
    
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('turn-timer').textContent = formattedTime;
}

function handleGameTimeExpired() {
    
    let winner;
    
    if (gameState.players.red.score > gameState.players.blue.score) {
        winner = 'red';
    } else if (gameState.players.blue.score > gameState.players.red.score) {
        winner = 'blue';
    } else {
        winner = 'tie';
    }
    
    
    if (winner === 'tie') {
        document.getElementById('status-message').textContent = "Game Over! It's a tie!";
    } else {
        endGame(winner);
    }
}

function handleTurnTimeExpired() {
    
    document.getElementById('status-message').textContent = `Time's up! Switching to next player.`;
    
    
    resetTurnTimer();
    
    
    switchPlayer();
    
    
    updateUIFromState();
}
