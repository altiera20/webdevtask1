/**
 * sounds.js
 * Manages sound effects and background music for the Titans game
 */

// Sound effect configuration
const SOUNDS = {
    // Game state sounds
    startGame: 'sounds/start-game.mp3',
    endGame: 'sounds/end-game.mp3',
    
    // Player actions
    placeTitan: 'sounds/place-titan.mp3',
    moveTitan: 'sounds/move-titan.mp3',
    selectTitan: 'sounds/select-titan.mp3',
    invalidMove: 'sounds/invalid-move.mp3',
    
    // Game events
    unlockCircuit: 'sounds/unlock-circuit.mp3',
    scorePoints: 'sounds/score-points.mp3',
    winGame: 'sounds/win-game.mp3',
    eliminateTitan: 'sounds/shotgun.mp3', // New shotgun sound for titan elimination
    
    // UI interactions
    buttonClick: 'sounds/button-click.mp3',
    switchPlayer: 'sounds/switch-player.mp3',
    
    // Background music
    backgroundMusic: 'sounds/background-music.mp3'
};

// Volume controls (0.0 to 1.0)
let masterVolume = 0.5;
let musicVolume = 0.3; // Lower default volume for background music

// Sound cache to preload and store audio objects
const soundCache = {};

// Background music element
let backgroundMusic = null;

/**
 * Initializes the sound system by preloading all sound effects and setting up background music
 */
function initSoundSystem() {
    console.log('Initializing sound system...');
    
    // Preload all sounds except background music
    for (const [key, path] of Object.entries(SOUNDS)) {
        if (key !== 'backgroundMusic') {
            try {
                const audio = new Audio(path);
                audio.volume = masterVolume;
                soundCache[key] = audio;
                
                // Preload by forcing a load attempt
                audio.load();
            } catch (error) {
                console.error(`Failed to load sound: ${path}`, error);
            }
        }
    }
    
    // Set up background music separately
    try {
        backgroundMusic = new Audio(SOUNDS.backgroundMusic);
        backgroundMusic.volume = musicVolume;
        backgroundMusic.loop = true; // Enable looping for background music
    } catch (error) {
        console.error(`Failed to load background music: ${SOUNDS.backgroundMusic}`, error);
    }
    
    console.log('Sound system initialized');
}

/**
 * Plays a sound effect by its key name
 * @param {string} soundKey - The key of the sound to play from SOUNDS object
 * @param {number} [volumeModifier=1.0] - Optional volume modifier (0.0 to 1.0)
 */
function playSound(soundKey, volumeModifier = 1.0) {
    // Check if sound exists in cache
    if (!soundCache[soundKey]) {
        console.warn(`Sound not found: ${soundKey}`);
        return;
    }
    
    try {
        // Create a new audio instance from the cached audio
        // This allows multiple instances of the same sound to play simultaneously
        const sound = soundCache[soundKey].cloneNode();
        
        // Apply volume settings
        sound.volume = Math.min(1.0, Math.max(0.0, masterVolume * volumeModifier));
        
        // Play the sound
        sound.play().catch(error => {
            console.warn(`Failed to play sound: ${soundKey}`, error);
        });
    } catch (error) {
        console.error(`Error playing sound: ${soundKey}`, error);
    }
}

/**
 * Sets the master volume for all sound effects
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
function setMasterVolume(volume) {
    // Ensure volume is between 0 and 1
    masterVolume = Math.min(1.0, Math.max(0.0, volume));
    
    // Update volume for all cached sounds
    for (const sound of Object.values(soundCache)) {
        sound.volume = masterVolume;
    }
    
    // Also update background music volume, but keep it proportionally lower
    if (backgroundMusic) {
        backgroundMusic.volume = masterVolume * (musicVolume / 0.5);
    }
    
    console.log(`Master volume set to: ${masterVolume}`);
}

/**
 * Sets the music volume specifically
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
function setMusicVolume(volume) {
    // Ensure volume is between 0 and 1
    musicVolume = Math.min(1.0, Math.max(0.0, volume));
    
    // Update background music volume
    if (backgroundMusic) {
        backgroundMusic.volume = musicVolume;
    }
    
    console.log(`Music volume set to: ${musicVolume}`);
}

/**
 * Mutes or unmutes all game sounds
 * @param {boolean} muted - True to mute, false to unmute
 */
function setMuted(muted) {
    // If muting, store current volume and set to 0
    if (muted) {
        if (masterVolume > 0) {
            localStorage.setItem('previousVolume', masterVolume);
            localStorage.setItem('previousMusicVolume', musicVolume);
            setMasterVolume(0);
            setMusicVolume(0);
        }
    } else {
        // If unmuting, restore previous volume or set to default
        const previousVolume = parseFloat(localStorage.getItem('previousVolume') || 0.5);
        const previousMusicVolume = parseFloat(localStorage.getItem('previousMusicVolume') || 0.3);
        setMasterVolume(previousVolume);
        setMusicVolume(previousMusicVolume);
    }
}

/**
 * Plays the background music
 */
function playBackgroundMusic() {
    console.log('Attempting to play background music...');
    
    // Check if the background music element exists
    if (!backgroundMusic) {
        console.error('Background music element is not initialized!');
        // Try to initialize it again
        try {
            backgroundMusic = new Audio(SOUNDS.backgroundMusic);
            backgroundMusic.volume = musicVolume;
            backgroundMusic.loop = true;
            console.log('Re-initialized background music element');
        } catch (error) {
            console.error('Failed to initialize background music:', error);
            return;
        }
    }
    
    // Check if the file exists by preloading it
    const testAudio = new Audio();
    testAudio.addEventListener('error', function() {
        console.error('Background music file could not be loaded:', SOUNDS.backgroundMusic);
        alert('Could not load background music file. Please check that the file exists at: ' + SOUNDS.backgroundMusic);
    });
    
    // Try to play the background music
    try {
        // Reset to beginning
        backgroundMusic.currentTime = 0;
        
        // Use the play() method which returns a Promise
        const playPromise = backgroundMusic.play();
        
        // Handle the Promise
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Background music started playing successfully!');
                })
                .catch(error => {
                    console.error('Failed to play background music:', error);
                    
                    // Check if this is an autoplay policy error
                    if (error.name === 'NotAllowedError') {
                        console.warn('Autoplay was prevented by the browser. Adding a play button.');
                        
                        // Create a temporary play button that appears in the middle of the screen
                        const playButton = document.createElement('button');
                        playButton.textContent = '▶️ Play Music';
                        playButton.style.position = 'fixed';
                        playButton.style.top = '50%';
                        playButton.style.left = '50%';
                        playButton.style.transform = 'translate(-50%, -50%)';
                        playButton.style.zIndex = '9999';
                        playButton.style.padding = '20px';
                        playButton.style.fontSize = '24px';
                        playButton.style.backgroundColor = '#3498db';
                        playButton.style.color = 'white';
                        playButton.style.border = 'none';
                        playButton.style.borderRadius = '8px';
                        playButton.style.cursor = 'pointer';
                        
                        playButton.onclick = function() {
                            backgroundMusic.play()
                                .then(() => {
                                    console.log('Background music started after user interaction');
                                    document.body.removeChild(playButton);
                                })
                                .catch(err => {
                                    console.error('Still failed to play after user interaction:', err);
                                });
                        };
                        
                        document.body.appendChild(playButton);
                    }
                });
        }
    } catch (error) {
        console.error('Error attempting to play background music:', error);
    }
}

/**
 * Pauses the background music
 */
function pauseBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

// Export sound functions
window.initSoundSystem = initSoundSystem;
window.playSound = playSound;
window.setMasterVolume = setMasterVolume;
window.setMusicVolume = setMusicVolume;
window.setMuted = setMuted;
window.playBackgroundMusic = playBackgroundMusic;
window.pauseBackgroundMusic = pauseBackgroundMusic;
