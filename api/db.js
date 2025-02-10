const fs = require('fs');
const path = require('path');

const DB_PATH = path.join('/tmp', 'roulette-history.json');

function readHistory() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Error reading history:', error);
        return [];
    }
}

function saveHistory(history) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

// Simple in-memory storage
let history = readHistory();

module.exports = {
    addResult: (username, prize) => {
        const result = {
            username,
            prize,
            timestamp: new Date().toISOString()
        };
        history.unshift(result); // Add to start of array
        if (history.length > 100) history.pop(); // Keep only last 100 results
        saveHistory(history);
        return result;
    },
    
    getHistory: () => history
};