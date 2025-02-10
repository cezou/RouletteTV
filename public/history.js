async function fetchHistory() {
    try {
        const response = await fetch('/api/get-history');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched history:', data);
        
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

    winnersList.innerHTML = history.map(entry => `
        <div class="winner-entry">
            <strong>${entry.username}</strong> won ${entry.prize}
            <small>${new Date(entry.timestamp).toLocaleString()}</small>
        </div>
    `).join('');
}

// Fetch immediately and refresh every 5 seconds
fetchHistory();
setInterval(fetchHistory, 5000);