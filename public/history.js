// Garder en mémoire les entrées précédentes avec leurs IDs uniques
let previousEntries = new Set();

// Helper function to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function fetchHistory() {
    try {
        const response = await fetch('/api/get-history');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.history)) {
            displayHistory(data.history);
        }
    } catch (error) {
        console.error('Failed to fetch history:', error);
        document.getElementById('winners-list').innerHTML = 
            '<div class="error">Failed to load history</div>';
    }
}

function displayHistory(history) {
    const winnersList = document.getElementById('winners-list');
    if (history.length === 0) {
        winnersList.innerHTML = '<div class="no-winners">No winners yet!</div>';
        return;
    }

    // Créer un ID unique pour chaque entrée
    const getEntryId = entry => `${entry.username}-${entry.prize}-${entry.timestamp}`;
    
    // Identifier les nouvelles entrées
    const currentEntries = new Set(history.map(getEntryId));
    const newEntries = history.filter(entry => !previousEntries.has(getEntryId(entry)));

    // Mettre à jour la liste des entrées précédentes
    previousEntries = currentEntries;

    winnersList.innerHTML = history.map(entry => {
        const isNew = newEntries.includes(entry);
        // Sanitize user-generated content to prevent XSS
        const safeUsername = escapeHtml(entry.username);
        const safePrize = escapeHtml(entry.prize);
        
        return `
            <div class="winner-entry ${isNew ? 'animate-slide' : ''}">
                <strong>${safeUsername}</strong> a remporté: <strong>${safePrize}</strong>
                <small>${new Date(entry.timestamp).toLocaleString()}</small>
            </div>
        `;
    }).join('');
}

// Fetch immediately and refresh every 5 seconds
fetchHistory();
setInterval(fetchHistory, 5000);