
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing game...');
    
    
    if (typeof initSoundSystem === 'function') {
        initSoundSystem();
        

        setTimeout(() => {
            if (typeof playBackgroundMusic === 'function') {
                playBackgroundMusic();
            }
        }, 1000);
    }
    
    
    setupButtonListeners();
    
    
    initializeGrid();
    
    
    document.getElementById('status-message').textContent = "Press 'Start Game' to begin.";
    
    
    addSoundControls();
});


function addSoundControls() {
    
    const soundControls = document.createElement('div');
    soundControls.className = 'sound-controls';
    
    
    const muteButton = document.createElement('button');
    muteButton.id = 'toggle-sound';
    muteButton.innerHTML = '🔊 Sound: ON';
    muteButton.addEventListener('click', function() {
        const isMuted = this.innerHTML.includes('OFF');
        this.innerHTML = isMuted ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        
        if (typeof setMuted === 'function') {
            setMuted(!isMuted);
        }
        
        
        if (isMuted && typeof playSound === 'function') {
            playSound('buttonClick');
        }
    });
    
    
    const volumeControl = document.createElement('div');
    volumeControl.className = 'volume-control';
    volumeControl.innerHTML = `
        <label for="volume-slider">Volume:</label>
        <input type="range" id="volume-slider" min="0" max="100" value="50">
    `;
    
    
    volumeControl.querySelector('#volume-slider').addEventListener('input', function() {
        const volume = this.value / 100;
        if (typeof setMasterVolume === 'function') {
            setMasterVolume(volume);
        }
    });
    
    
    const musicControls = document.createElement('div');
    musicControls.className = 'music-controls';
    
    
    const musicVolumeControl = document.createElement('div');
    musicVolumeControl.className = 'volume-control';
    musicVolumeControl.innerHTML = `
        <label for="music-volume-slider">Music:</label>
        <input type="range" id="music-volume-slider" min="0" max="100" value="30">
    `;
    
    
    musicVolumeControl.querySelector('#music-volume-slider').addEventListener('input', function() {
        const volume = this.value / 100;
        if (typeof setMusicVolume === 'function') {
            setMusicVolume(volume);
        }
    });
    
    
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
        
        
        if (typeof playSound === 'function') {
            playSound('buttonClick');
        }
    });
    
    
    soundControls.appendChild(muteButton);
    soundControls.appendChild(volumeControl);
    musicControls.appendChild(musicToggleButton);
    musicControls.appendChild(musicVolumeControl);
    soundControls.appendChild(musicControls);
    
    
    const gameInterface = document.querySelector('.game-interface');
    if (gameInterface) {
        gameInterface.appendChild(soundControls);
    }
    
    console.log('Sound and music controls added to interface');
}


function setupButtonListeners() {
    
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            startGame();
        });
    }
    
    
    const resetGameBtn = document.getElementById('reset-game');
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            resetGame();
        });
    }
    
    
    const toggleTimerBtn = document.getElementById('toggle-timer');
    if (toggleTimerBtn) {
        toggleTimerBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            toggleTimer();
        });
    }
    
    
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            undoGame();
        });
    }

    
    const redoBtn = document.getElementById('redo-btn');
    if (redoBtn) {
        redoBtn.addEventListener('click', function() {
            if (typeof playSound === 'function') {
                playSound('buttonClick');
            }
            redoGame();
        });
    }
    
    
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


