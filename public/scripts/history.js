/**
 * @brief Stores previously seen entries to detect new ones
 */
let previousEntries = new Set();

/**
 * @brief Track if user has interacted with the page
 */
let userHasInteracted = false;

/**
 * @brief Audio elements for sound effects
 */
const specialSound = new Audio('/assets/sounds/special_anim.mp3');
const looseSound = new Audio('/assets/sounds/loose.mp3');

// Add event listeners to detect user interaction
document.addEventListener('click', handleUserInteraction);
document.addEventListener('keydown', handleUserInteraction);
document.addEventListener('touchstart', handleUserInteraction);

function handleUserInteraction() {
    userHasInteracted = true;
    // Hide the interaction overlay
    document.getElementById('interactionOverlay').classList.add('hidden');
    // Remove event listeners once interaction is detected
    document.removeEventListener('click', handleUserInteraction);
    document.removeEventListener('keydown', handleUserInteraction);
    document.removeEventListener('touchstart', handleUserInteraction);
    
    // Try to play a silent sound to fully enable audio
    const silentSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADQgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAQAAAAAAAAAAABSAJAJAQgAAgAAAA0JkciNSAAAAAAAAAAAAAAAAAAAA//sUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZCQP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZEoP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
    silentSound.play().catch(e => console.log('Silent sound failed to play'));
}

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
    // Only attempt to play sounds if user has interacted with the page
    if (!userHasInteracted) {
        console.log('Cannot play sound: waiting for user interaction');
        return;
    }
    
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
 * @brief Gère la lecture vidéo pour les prix non-spéciaux
 */
const videoOverlay = document.getElementById('videoOverlay');
const prizeVideo = document.getElementById('prizeVideo');

// Fermer la vidéo quand elle est terminée
prizeVideo.addEventListener('ended', () => {
    closeVideo();
});

function playPrizeVideo(username, prize) {
    // Only attempt to play video if user has interacted with the page
    if (!userHasInteracted) {
        console.log('Cannot play video: waiting for user interaction');
        // Show the text overlay with prize info anyway
        document.getElementById('winnerUsername').textContent = username;
        document.getElementById('prizeName').textContent = prize;
        videoOverlay.classList.add('active');
        return;
    }
    
    // Réinitialiser la vidéo et s'assurer qu'elle est prête
    prizeVideo.pause();
    prizeVideo.currentTime = 0;
    
    // Définir le texte du gagnant
    document.getElementById('winnerUsername').textContent = username;
    document.getElementById('prizeName').textContent = prize;
    
    // Afficher l'overlay
    videoOverlay.classList.add('active');
    
    // Ajouter un court délai avant de lancer la vidéo pour éviter des problèmes de timing
    setTimeout(() => {
        try {
            prizeVideo.muted = false; // S'assurer que le son est activé
            const playPromise = prizeVideo.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Failed to play video:', error);
                    // Même en cas d'erreur, laisser l'overlay visible
                });
            }
        } catch (error) {
            console.error('Error playing video:', error);
        }
    }, 50);
}

function closeVideo() {
    prizeVideo.pause();
    videoOverlay.classList.remove('active');
}

/**
 * @brief Joue le son approprié et/ou la vidéo
 */
function handleNewPrize(entry, isSpecial) {
    if (isSpecial) {
        playSound(true);
        playPrizeVideo(entry.username, entry.prize);
    } else {
        playSound(false);
        // Ne pas jouer la vidéo pour les prix non-spéciaux
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
        handleNewPrize(newestEntry, isSpecial);
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
