/**
 * confetti.js
 * Provides confetti animation for victory celebrations
 */

const CONFETTI_CONFIG = {
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22']
};

/**
 * creating confetti particles that go BOOM

 */
function createConfettiParticle() {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    
    // Random properties
    const size = Math.random() * 10 + 5; // 5-15px
    const color = CONFETTI_CONFIG.colors[Math.floor(Math.random() * CONFETTI_CONFIG.colors.length)];
    const rotation = Math.random() * 360;
    const isCircle = Math.random() > 0.5;
    
    // Apply styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.transform = `rotate(${rotation}deg)`;
    
    if (isCircle) {
        particle.style.borderRadius = '50%';
    }
    
    return particle;
}

/**
 * makes cinfetti BOOM
 * @param {HTMLElement} particle - The confetti particle to animate
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 */
function animateConfettiParticle(particle, startX, startY) {
    // Random movement properties
    const duration = Math.random() * 3 + 2; // 2-5 seconds
    const endX = startX + (Math.random() * CONFETTI_CONFIG.spread * 2 - CONFETTI_CONFIG.spread);
    const endY = window.innerHeight + 100; // Ensure it goes off-screen
    
    // Apply initial position
    particle.style.position = 'fixed';
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.zIndex = '9999';
    
  
    particle.style.transition = `all ${duration}s ease-out`;
    
    setTimeout(() => {
        particle.style.left = `${endX}px`;
        particle.style.top = `${endY}px`;
        particle.style.opacity = '0';
        
        // REMOVES
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }, 10);
}

/**
 * create n launch
 */
function launchConfetti() {
    console.log('Launching confetti celebration!');
    
    // Create container for confetti particles
    const container = document.createElement('div');
    container.className = 'confetti-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none'; // Don't interfere with user interaction
    container.style.zIndex = '9998';
    
    document.body.appendChild(container);
    
    // Create a simple test particle to verify the animation is working
    const testParticle = document.createElement('div');
    testParticle.style.width = '20px';
    testParticle.style.height = '20px';
    testParticle.style.backgroundColor = '#ff0000';
    testParticle.style.position = 'fixed';
    testParticle.style.top = '50%';
    testParticle.style.left = '50%';
    testParticle.style.zIndex = '9999';
    container.appendChild(testParticle);
    
    // Create and animate particles
    for (let i = 0; i < CONFETTI_CONFIG.particleCount; i++) {
        const particle = createConfettiParticle();
        container.appendChild(particle);
        
        //  starting position
        const startX = Math.random() * window.innerWidth;
        const startY = CONFETTI_CONFIG.origin.y * window.innerHeight;
        
        setTimeout(() => {
            animateConfettiParticle(particle, startX, startY);
        }, Math.random() * 500); // Stagger up to 0.5 seconds
    }
    
    alert('Confetti launched! If you don\'t see confetti, check the console for errors.');
    
    setTimeout(() => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }, 6000); // Slightly longer than the longest possible animation
}

/**
 * Test function to manually trigger confetti
 */
function testConfetti() {
    console.log('Testing confetti animation...');
    launchConfetti();
}

// Export functions
window.launchConfetti = launchConfetti;
window.testConfetti = testConfetti;

// trigger
console.log('Confetti.js loaded successfully!');

// Add a global function to test if confetti is working
function testConfettiOnWin() {
    console.log('Testing confetti from browser console');
    launchConfetti();
}

// Make it available globally
window.testConfettiOnWin = testConfettiOnWin;
