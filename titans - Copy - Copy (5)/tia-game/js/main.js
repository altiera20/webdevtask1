/**
 * main.js
 * Entry point for the game, sets up event listeners and orchestrates the modules
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing game...');
    
    // Initialize sound system if available
    if (typeof initSoundSystem === 'function') {
        initSoundSystem();
        
        // Start playing background music after a short delay
        // (Delay helps avoid browser autoplay restrictions)
        setTimeout(() => {
            if (typeof playBackgroundMusic === 'function') {
                playBackgroundMusic();
            }
        }, 1000);
    }
    
    // Set up button event listeners
    setupButtonListeners();
    
    // Initialize the grid with node event listeners
    initializeGrid();
    
    // Set initial UI state
    document.getElementById('status-message').textContent = "Press 'Start Game' to begin.";
    
    // Add sound controls to the game interface
    addSoundControls();
});

/**
 * Adds sound control buttons to the game interface
 */
function addSoundControls() {
    // Create sound control container
    const soundControls = document.createElement('div');
    soundControls.className = 'sound-controls';
    
    // Create mute toggle button
    const muteButton = document.createElement('button');
    muteButton.id = 'toggle-sound';
    muteButton.innerHTML = '🔊 Sound: ON';
    muteButton.addEventListener('click', function() {
        const isMuted = this.innerHTML.includes('OFF');
        this.innerHTML = isMuted ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        
        if (typeof setMuted === 'function') {
            setMuted(!isMuted);
        }
        
        // Play button click sound if unmuting
        if (isMuted && typeof playSound === 'function') {
            playSound('buttonClick');
        }
    });
    
    // Create master volume slider
    const volumeControl = document.createElement('div');
    volumeControl.className = 'volume-control';
    volumeControl.innerHTML = `
        <label for="volume-slider">Volume:</label>
        <input type="range" id="volume-slider" min="0" max="100" value="50">
    `;
    
    // Add event listener to volume slider
    volumeControl.querySelector('#volume-slider').addEventListener('input', function() {
        const volume = this.value / 100;
        if (typeof setMasterVolume === 'function') {
            setMasterVolume(volume);
        }
    });
    
    // Create music controls
    const musicControls = document.createElement('div');
    musicControls.className = 'music-controls';
    
    // Create music volume slider
    const musicVolumeControl = document.createElement('div');
    musicVolumeControl.className = 'volume-control';
    musicVolumeControl.innerHTML = `
        <label for="music-volume-slider">Music:</label>
        <input type="range" id="music-volume-slider" min="0" max="100" value="30">
    `;
    
    // Add event listener to music volume slider
    musicVolumeControl.querySelector('#music-volume-slider').addEventListener('input', function() {
        const volume = this.value / 100;
        if (typeof setMusicVolume === 'function') {
            setMusicVolume(volume);
        }
    });
    
    // Create music toggle button
    const musicToggleButton = document.createElement('button');
    musicToggleButton.id = 'toggle-music';
    musicToggleButton.innerHTML = '🎵 Music: ON';
    musicToggleButton.addEventListener('click', function() {
        const isMusicOff = this.innerHTML.includes('OFF');
        this.innerHTML = isMusicOff ? '🎵 Music: ON' : '🎵 Music: OFF';
        
        if (isMusicOff) {
            if (typeof playBackgroundMusic === 'function') {
                playBackgroundMusic();
            }
        } else {
            if (typeof pauseBackgroundMusic === 'function') {
                pauseBackgroundMusic();
            }
        }
        
        // Play button click sound
        if (typeof playSound === 'function') {
            playSound('buttonClick');
        }
    });
    
    // Add controls to container
    soundControls.appendChild(muteButton);
    soundControls.appendChild(volumeControl);
    musicControls.appendChild(musicToggleButton);
    musicControls.appendChild(musicVolumeControl);
    soundControls.appendChild(musicControls);
    
    // Add container to game interface
    const gameInterface = document.querySelector('.game-interface');
    if (gameInterface) {
        gameInterface.appendChild(soundControls);
    }
    
    console.log('Sound and music controls added to interface');
}

/**
 * Sets up event listeners for game control buttons
 */
function setupButtonListeners() {
    // Start Game button
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            startGame();
        });
    }
    
    // Reset Game button
    const resetGameBtn = document.getElementById('reset-game');
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            resetGame();
        });
    }
    
    // Toggle Timer button
    const toggleTimerBtn = document.getElementById('toggle-timer');
    if (toggleTimerBtn) {
        toggleTimerBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            toggleTimer();
        });
    }
    
    // Undo button
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            undoGame();
        });
    }

    // Redo button
    const redoBtn = document.getElementById('redo-btn');
    if (redoBtn) {
        redoBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            redoGame();
        });
    }
    
    // Leaderboard button
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            if (typeof showLeaderboard === 'function') {
                showLeaderboard();
            }
        });
    }
    
    // Replay button
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
        replayBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            if (typeof startReplay === 'function') {
                startReplay();
            }
        });
    }

    console.log('Button event listeners set up');
}

function undoGame() {
    if (typeof undoGameState === 'function') {
        undoGameState();
        // Force a complete UI refresh to ensure the board visually updates
        if (typeof updateGridDisplay === 'function') {
            updateGridDisplay();
        }
        console.log('Undo action performed');
    }
}

function redoGame() {
    if (typeof redoGameState === 'function') {
        redoGameState();
        // Force a complete UI refresh to ensure the board visually updates
        if (typeof updateGridDisplay === 'function') {
            updateGridDisplay();
        }
        console.log('Redo action performed');
    }
}

/**
 * Global event handler for handling key presses
 */
document.addEventListener('keydown', function(event) {
    // Example: Press 'r' to reset the game
    if (event.key === 'r' && event.ctrlKey) {
        resetGame();
    }
    
    // Example: Press 'p' to pause/resume the timer
    if (event.key === 'p' && event.ctrlKey) {
        toggleTimer();
    }
});

/**
 * Adds a CSS class to make nodes distinguishable during development
 * This is a helper function for development and can be removed in production
 */
function addDevHelpers() {
    // Add circuit names as text inside first node of each circuit
    document.getElementById('outer-0').innerHTML = '<span class="dev-text">Outer</span>';
    document.getElementById('middle-0').innerHTML = '<span class="dev-text">Middle</span>';
    document.getElementById('inner-0').innerHTML = '<span class="dev-text">Inner</span>';
    
    // Add node IDs as text inside each node
    const nodeElements = document.querySelectorAll('.node');
    nodeElements.forEach(node => {
        if (node.id !== 'outer-0' && node.id !== 'middle-0' && node.id !== 'inner-0') {
            node.innerHTML = `<span class="dev-text">${node.id.split('-')[1]}</span>`;
        }
    });
    
    console.log('Development helpers added');
}

// Uncomment the line below during development to add visual node identifiers
// document.addEventListener('DOMContentLoaded', addDevHelpers);
