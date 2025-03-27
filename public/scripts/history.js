/**
 * @brief Stores previously seen entries to detect new ones
 */
let previousEntries = new Set();

/**
 * @brief Audio elements for sound effects
 */
const specialSound = new Audio('/assets/sounds/special.mp3');
const looseSound = new Audio('/assets/sounds/loose.mp3');

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
 * @brief Plays the appropriate sound based on prize type
 */
function playSound(isSpecial) {
    try {
        if (isSpecial) {
            specialSound.currentTime = 0;
            specialSound.play().catch(e => console.error('Error playing special sound:', e));
        } else {
            looseSound.currentTime = 0;
            looseSound.play().catch(e => console.error('Error playing loose sound:', e));
        }
    } catch (error) {
        console.error('Error playing sound:', error);
    }
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
    
    // Check special prizes
    const specialPrizes = new Set(['Rhumberto Blanc']); // Add special prize names here
    
    // Play sound if there's a new entry
    if (newEntries.length > 0) {
        const newestEntry = newEntries[0];
        const isSpecial = specialPrizes.has(newestEntry.prize);
        playSound(isSpecial);
    }
    
    // Update the previous entries set after checking for new ones
    previousEntries = currentEntries;
    
    // Count special prizes to maintain color alternating pattern
    let specialCount = 0;
    
    const historyHTML = history.map((entry, index) => {
        const isNew = newEntries.includes(entry);
        const isSpecial = specialPrizes.has(entry.prize);
        const safeUsername = escapeHtml(entry.username);
        const safePrize = escapeHtml(entry.prize);
        
        // Format date without year, with different styling for date and time
        const dateObj = new Date(entry.timestamp);
        const dateFormatted = dateObj.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit'
        });
        const timeFormatted = dateObj.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Calculate color index based on entry position and special count
        const colorIndex = (index + specialCount) % 2;
        
        // Apply special color class if needed and increment special count
        let colorClass = '';
        
        if (isSpecial) {
            colorClass = ' special';
            specialCount++;
        } else {
            colorClass = colorIndex === 0 ? ' color-primary' : ' color-secondary';
        }
        
        return `
            <div class="winner-entry${colorClass}${isNew ? ' animate-slide' : ''}">
                <div class="winner-content">
                    <span class="winner-info"><strong>${safeUsername}</strong> <span class="prize-preposition">a remporté un(e)</span> <strong>${safePrize}</strong></span>
                    <span class="winner-date"><span class="date-part">${dateFormatted}</span> <span class="time-part">${timeFormatted}</span></span>
                </div>
            </div>
        `;
    }).join('');
    
    winnersList.innerHTML = historyHTML;
}

// Fetch immediately and refresh every 5 seconds
fetchHistory();
setInterval(fetchHistory, 5000);
