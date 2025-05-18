
const SOUNDS = {
    
    startGame: 'sounds/start-game.mp3',
    endGame: 'sounds/end-game.mp3',
    
    
    placeTitan: 'sounds/place-titan.mp3',
    moveTitan: 'sounds/move-titan.mp3',
    selectTitan: 'sounds/select-titan.mp3',
    invalidMove: 'sounds/invalid-move.mp3',
    
    // Game events
    unlockCircuit: 'sounds/unlock-circuit.mp3',
    scorePoints: 'sounds/score-points.mp3',
    winGame: 'sounds/win-game.mp3',
    eliminateTitan: 'sounds/shotgun.mp3', 
    
    // UI interactions
    buttonClick: 'sounds/button-click.mp3',
    switchPlayer: 'sounds/switch-player.mp3',
    
    // Background music
    backgroundMusic: 'sounds/background-music.mp3'
};


let masterVolume = 0.5;
let musicVolume = 0.3; 

const soundCache = {};

let backgroundMusic = null;

function initSoundSystem() {
    console.log('Initializing sound system...');
    
    // Preload all sounds except background music
    for (const [key, path] of Object.entries(SOUNDS)) {
        if (key !== 'backgroundMusic') {
            try {
                const audio = new Audio(path);
                audio.volume = masterVolume;
                soundCache[key] = audio;
                
                
                audio.load();
            } catch (error) {
                console.error(`Failed to load sound: ${path}`, error);
            }
        }
    }
    
    
    try {
        backgroundMusic = new Audio(SOUNDS.backgroundMusic);
        backgroundMusic.volume = musicVolume;
        backgroundMusic.loop = true; 
    } catch (error) {
        console.error(`Failed to load background music: ${SOUNDS.backgroundMusic}`, error);
    }
    
    console.log('Sound system initialized');
}

function playSound(soundKey, volumeModifier = 1.0) {
    
    if (!soundCache[soundKey]) {
        console.warn(`Sound not found: ${soundKey}`);
        return;
    }
    
    try {

        const sound = soundCache[soundKey].cloneNode();
        
        
        sound.volume = Math.min(1.0, Math.max(0.0, masterVolume * volumeModifier));
        
        
        sound.play().catch(error => {
            console.warn(`Failed to play sound: ${soundKey}`, error);
        });
    } catch (error) {
        console.error(`Error playing sound: ${soundKey}`, error);
    }
}

function setMasterVolume(volume) {
    
    masterVolume = Math.min(1.0, Math.max(0.0, volume));
    
    
    for (const sound of Object.values(soundCache)) {
        sound.volume = masterVolume;
    }
    
    
    if (backgroundMusic) {
        backgroundMusic.volume = masterVolume * (musicVolume / 0.5);
    }
    
    console.log(`Master volume set to: ${masterVolume}`);
}

function setMusicVolume(volume) {
    // Ensure volume is between 0 and 1
    musicVolume = Math.min(1.0, Math.max(0.0, volume));
    
    // Update background music volume
    if (backgroundMusic) {
        backgroundMusic.volume = musicVolume;
    }
    
    console.log(`Music volume set to: ${musicVolume}`);
}

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
        
        const previousVolume = parseFloat(localStorage.getItem('previousVolume') || 0.5);
        const previousMusicVolume = parseFloat(localStorage.getItem('previousMusicVolume') || 0.3);
        setMasterVolume(previousVolume);
        setMusicVolume(previousMusicVolume);
    }
}

function playBackgroundMusic() {
    console.log('Attempting to play background music...');
    
    
    if (!backgroundMusic) {
        console.error('Background music element is not initialized!');
        
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
    
    
    const testAudio = new Audio();
    testAudio.addEventListener('error', function() {
        console.error('Background music file could not be loaded:', SOUNDS.backgroundMusic);
        alert('Could not load background music file. Please check that the file exists at: ' + SOUNDS.backgroundMusic);
    });
    
    
    try {
        
        backgroundMusic.currentTime = 0;
        
        
        const playPromise = backgroundMusic.play();
        
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Background music started playing successfully!');
                })
                .catch(error => {
                    console.error('Failed to play background music:', error);
                    
                    
                    if (error.name === 'NotAllowedError') {
                        console.warn('Autoplay was prevented by the browser. Adding a play button.');
                        
                        
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

function pauseBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

window.initSoundSystem = initSoundSystem;
window.playSound = playSound;
window.setMasterVolume = setMasterVolume;
window.setMusicVolume = setMusicVolume;
window.setMuted = setMuted;
window.playBackgroundMusic = playBackgroundMusic;
window.pauseBackgroundMusic = pauseBackgroundMusic;
