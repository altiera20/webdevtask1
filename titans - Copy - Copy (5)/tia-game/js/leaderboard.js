
const LEADERBOARD_CONFIG = {
    storageKey: 'titans_leaderboard',
    maxEntries: 10, 
    defaultName: 'Player' 
};


class Leaderboard {
    constructor() {
        this.entries = [];
        this.loadFromStorage();
    }
    

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
    

    saveToStorage() {
        try {
            localStorage.setItem(LEADERBOARD_CONFIG.storageKey, JSON.stringify(this.entries));
            console.log('Leaderboard saved to storage');
        } catch (error) {
            console.error('Error saving leaderboard to storage:', error);
        }
    }

    addEntry(playerName, playerColor, score, date) {
        
        const newEntry = {
            playerName: playerName || LEADERBOARD_CONFIG.defaultName,
            playerColor: playerColor,
            score: score,
            date: date || new Date().toLocaleDateString()
        };
        
        
        this.entries.push(newEntry);
        
        
        this.entries.sort((a, b) => b.score - a.score);
        
        
        if (this.entries.length > LEADERBOARD_CONFIG.maxEntries) {
            this.entries = this.entries.slice(0, LEADERBOARD_CONFIG.maxEntries);
        }
        
        
        this.saveToStorage();
        
        
        return this.entries.some(entry => 
            entry.playerName === newEntry.playerName && 
            entry.score === newEntry.score && 
            entry.date === newEntry.date
        );
    }
    

    getTopEntries(count = this.entries.length) {
        return this.entries.slice(0, count);
    }

    clearLeaderboard() {
        this.entries = [];
        this.saveToStorage();
    }

    isHighScore(score) {
        if (this.entries.length < LEADERBOARD_CONFIG.maxEntries) {
            return true;
        }
        
        const lowestScore = this.entries[this.entries.length - 1].score;
        return score > lowestScore;
    }
}


const leaderboard = new Leaderboard();

function showLeaderboard() {
    
    let leaderboardContainer = document.getElementById('leaderboard-container');
    
    if (!leaderboardContainer) {
        leaderboardContainer = document.createElement('div');
        leaderboardContainer.id = 'leaderboard-container';
        document.body.appendChild(leaderboardContainer);
    }
    
    
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
    
    
    document.getElementById('close-leaderboard').addEventListener('click', hideLeaderboard);
}

function hideLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (leaderboardContainer) {
        leaderboardContainer.remove();
    }
}

function showNameEntryForm(winner, score, callback) {
    
    const formContainer = document.createElement('div');
    formContainer.id = 'name-entry-form';
    document.body.appendChild(formContainer);
    
    
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
    
    
    formContainer.innerHTML = `
        <h2 style="margin-top: 0; color: ${winner === 'red' ? '#e74c3c' : '#3498db'};">New High Score!</h2>
        <p>You scored ${score} points.</p>
        <form id="player-name-form">
            <input type="text" id="player-name" placeholder="Enter your name" style="padding: 8px; width: 100%; margin-bottom: 15px; border-radius: 4px; border: none;">
            <button type="submit" style="padding: 8px 16px; background-color: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
        </form>
    `;
    
    
    document.getElementById('player-name-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const playerName = document.getElementById('player-name').value.trim();
        formContainer.remove();
        
        
        leaderboard.addEntry(playerName, winner, score);
        
        
        if (typeof callback === 'function') {
            callback();
        }
    });
}


window.leaderboard = leaderboard;
window.showLeaderboard = showLeaderboard;
window.hideLeaderboard = hideLeaderboard;
window.showNameEntryForm = showNameEntryForm;
