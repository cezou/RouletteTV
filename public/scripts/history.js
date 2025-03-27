/**
 * @brief Stores previously seen entries to detect new ones
 */
let previousEntries = new Set();

/**
 * @brief Helper function to escape HTML and prevent XSS
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * @brief Fetches history data from the API
 */
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

/**
 * @brief Displays history data and animates new entries
 */
function displayHistory(history) {
    const winnersList = document.getElementById('winners-list');
    if (history.length === 0) {
        winnersList.innerHTML = '<div class="no-winners">No winners yet!</div>';
        return;
    }
    const getEntryId = entry => `${entry.username}-${entry.prize}-${entry.timestamp}`;
    const currentEntries = new Set(history.map(getEntryId));
    const newEntries = history.filter(entry => !previousEntries.has(getEntryId(entry)));
    previousEntries = currentEntries;
    winnersList.innerHTML = history.map(entry => {
        const isNew = newEntries.includes(entry);
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
