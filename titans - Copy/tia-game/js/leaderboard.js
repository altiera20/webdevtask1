/**
 * leaderboard.js
 * Manages the game's leaderboard functionality using local storage
 */

// Leaderboard configuration
const LEADERBOARD_CONFIG = {
    storageKey: 'titans_leaderboard',
    maxEntries: 10, // Maximum number of entries to store
    defaultName: 'Player' // Default name for unnamed players
};

/**
 * Represents the leaderboard data structure
 */
class Leaderboard {
    constructor() {
        this.entries = [];
        this.loadFromStorage();
    }
    
    /**
     * Loads leaderboard data from local storage
     */
    loadFromStorage() {
        try {
            const storedData = localStorage.getItem(LEADERBOARD_CONFIG.storageKey);
            if (storedData) {
                this.entries = JSON.parse(storedData);
                console.log('Leaderboard loaded from storage:', this.entries);
            } else {
                console.log('No leaderboard data found in storage');
                this.entries = [];
            }
        } catch (error) {
            console.error('Error loading leaderboard from storage:', error);
            this.entries = [];
        }
    }
    
    /**
     * Saves leaderboard data to local storage
     */
    saveToStorage() {
        try {
            localStorage.setItem(LEADERBOARD_CONFIG.storageKey, JSON.stringify(this.entries));
            console.log('Leaderboard saved to storage');
        } catch (error) {
            console.error('Error saving leaderboard to storage:', error);
        }
    }
    
    /**
     * Adds a new entry to the leaderboard
     * @param {string} playerName - Name of the player
     * @param {string} playerColor - Color of the player ('red' or 'blue')
     * @param {number} score - Player's score
     * @param {string} date - Date of the game
     * @returns {boolean} - True if the entry was added to the top scores
     */
    addEntry(playerName, playerColor, score, date) {
        // Create new entry
        const newEntry = {
            playerName: playerName || LEADERBOARD_CONFIG.defaultName,
            playerColor: playerColor,
            score: score,
            date: date || new Date().toLocaleDateString()
        };
        
        // Add to entries
        this.entries.push(newEntry);
        
        // Sort entries by score (highest first)
        this.entries.sort((a, b) => b.score - a.score);
        
        // Trim to max entries
        if (this.entries.length > LEADERBOARD_CONFIG.maxEntries) {
            this.entries = this.entries.slice(0, LEADERBOARD_CONFIG.maxEntries);
        }
        
        // Save updated leaderboard
        this.saveToStorage();
        
        // Return true if the new entry made it to the leaderboard
        return this.entries.some(entry => 
            entry.playerName === newEntry.playerName && 
            entry.score === newEntry.score && 
            entry.date === newEntry.date
        );
    }
    
    /**
     * Gets the top N entries from the leaderboard
     * @param {number} count - Number of entries to retrieve (default: all)
     * @returns {Array} - Array of leaderboard entries
     */
    getTopEntries(count = this.entries.length) {
        return this.entries.slice(0, count);
    }
    
    /**
     * Clears all leaderboard entries
     */
    clearLeaderboard() {
        this.entries = [];
        this.saveToStorage();
    }
    
    /**
     * Checks if a score would make it onto the leaderboard
     * @param {number} score - Score to check
     * @returns {boolean} - True if the score would make it onto the leaderboard
     */
    isHighScore(score) {
        if (this.entries.length < LEADERBOARD_CONFIG.maxEntries) {
            return true;
        }
        
        const lowestScore = this.entries[this.entries.length - 1].score;
        return score > lowestScore;
    }
}

// Create global leaderboard instance
const leaderboard = new Leaderboard();

/**
 * Shows the leaderboard UI
 */
function showLeaderboard() {
    // Create leaderboard container if it doesn't exist
    let leaderboardContainer = document.getElementById('leaderboard-container');
    
    if (!leaderboardContainer) {
        leaderboardContainer = document.createElement('div');
        leaderboardContainer.id = 'leaderboard-container';
        document.body.appendChild(leaderboardContainer);
    }
    
    // Style the container
    leaderboardContainer.style.position = 'fixed';
    leaderboardContainer.style.top = '50%';
    leaderboardContainer.style.left = '50%';
    leaderboardContainer.style.transform = 'translate(-50%, -50%)';
    leaderboardContainer.style.backgroundColor = '#34495e';
    leaderboardContainer.style.color = '#ecf0f1';
    leaderboardContainer.style.padding = '20px';
    leaderboardContainer.style.borderRadius = '10px';
    leaderboardContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    leaderboardContainer.style.zIndex = '1000';
    leaderboardContainer.style.minWidth = '300px';
    leaderboardContainer.style.maxWidth = '500px';
    leaderboardContainer.style.width = '80%';
    leaderboardContainer.style.maxHeight = '80vh';
    leaderboardContainer.style.overflowY = 'auto';
    
    // Create content
    const entries = leaderboard.getTopEntries();
    
    leaderboardContainer.innerHTML = `
        <h2 style="text-align: center; margin-top: 0; color: #f1c40f;">Leaderboard</h2>
        ${entries.length === 0 ? 
            '<p style="text-align: center;">No scores yet. Play a game to set a record!</p>' : 
            `<table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 8px; text-align: center; border-bottom: 1px solid #7f8c8d;">Rank</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #7f8c8d;">Player</th>
                        <th style="padding: 8px; text-align: center; border-bottom: 1px solid #7f8c8d;">Score</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #7f8c8d;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map((entry, index) => `
                        <tr>
                            <td style="padding: 8px; text-align: center;">${index + 1}</td>
                            <td style="padding: 8px; text-align: left; color: ${entry.playerColor === 'red' ? '#e74c3c' : '#3498db'};">
                                ${entry.playerName}
                            </td>
                            <td style="padding: 8px; text-align: center; font-weight: bold;">${entry.score}</td>
                            <td style="padding: 8px; text-align: right; color: #95a5a6;">${entry.date}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`
        }
        <div style="margin-top: 20px; text-align: center;">
            <button id="close-leaderboard" style="padding: 8px 16px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
    `;
    
    // Add event listener to close button
    document.getElementById('close-leaderboard').addEventListener('click', hideLeaderboard);
}

/**
 * Hides the leaderboard UI
 */
function hideLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (leaderboardContainer) {
        leaderboardContainer.remove();
    }
}

/**
 * Shows a form to enter player name for the leaderboard
 * @param {string} winner - The winning player ('red' or 'blue')
 * @param {number} score - The winning player's score
 * @param {Function} callback - Function to call after name is submitted
 */
function showNameEntryForm(winner, score, callback) {
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.id = 'name-entry-form';
    document.body.appendChild(formContainer);
    
    // Style the container
    formContainer.style.position = 'fixed';
    formContainer.style.top = '50%';
    formContainer.style.left = '50%';
    formContainer.style.transform = 'translate(-50%, -50%)';
    formContainer.style.backgroundColor = '#34495e';
    formContainer.style.color = '#ecf0f1';
    formContainer.style.padding = '20px';
    formContainer.style.borderRadius = '10px';
    formContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    formContainer.style.zIndex = '1000';
    formContainer.style.textAlign = 'center';
    
    // Create form content
    formContainer.innerHTML = `
        <h2 style="margin-top: 0; color: ${winner === 'red' ? '#e74c3c' : '#3498db'};">New High Score!</h2>
        <p>You scored ${score} points.</p>
        <form id="player-name-form">
            <input type="text" id="player-name" placeholder="Enter your name" style="padding: 8px; width: 100%; margin-bottom: 15px; border-radius: 4px; border: none;">
            <button type="submit" style="padding: 8px 16px; background-color: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
        </form>
    `;
    
    // Add event listener to form
    document.getElementById('player-name-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const playerName = document.getElementById('player-name').value.trim();
        formContainer.remove();
        
        // Add to leaderboard
        leaderboard.addEntry(playerName, winner, score);
        
        // Call callback if provided
        if (typeof callback === 'function') {
            callback();
        }
    });
}

// Export functions
window.leaderboard = leaderboard;
window.showLeaderboard = showLeaderboard;
window.hideLeaderboard = hideLeaderboard;
window.showNameEntryForm = showNameEntryForm;
