import { escapeHtml } from './api.js';
import { playSound } from './audio.js';
import { playPrizeVideo, setupSpecialPrizeTimeout } from './video.js';


/** @brief List of prizes that are considered special */
const specialPrizes = new Set(['Rhumberto Blanc']);


/** @brief Checks if a prize is considered special */
export function isSpecialPrize(prize) {
  return specialPrizes.has(prize);
}


/** @brief Handles new prize events - plays sounds and shows video */
export function handleNewPrize(entry, isSpecial) {
  if (isSpecial) {
    playSound(true);
    playPrizeVideo(entry.username, entry.prize);
    setupSpecialPrizeTimeout();
  } else {
    playSound(false);
  }
}


/** @brief Displays history data and animates new entries */
export function displayHistory(history, previousEntries, updatePreviousFn) {
  const winnersList = document.getElementById('winners-list');
  if (history.length === 0) {
    winnersList.innerHTML = '<div class="no-winners">No winners yet!</div>';
    return;
  }
  const getEntryId = entry => `${entry.username}-${entry.prize}-${entry.timestamp}`;
  const currentEntries = new Set(history.map(getEntryId));
  const newEntries = history.filter(entry => !previousEntries.has(getEntryId(entry)));
  
  if (newEntries.length > 0) {
    const newestEntry = newEntries[0];
    const isSpecial = isSpecialPrize(newestEntry.prize);
    handleNewPrize(newestEntry, isSpecial);
  }
  
  updatePreviousFn(currentEntries);
  
  let specialCount = 0;
  const historyHTML = history.map((entry, index) => {
    const isNew = newEntries.includes(entry);
    const isSpecial = isSpecialPrize(entry.prize);
    const safeUsername = escapeHtml(entry.username);
    const safePrize = escapeHtml(entry.prize);
    
    const dateObj = new Date(entry.timestamp);
    const dateFormatted = dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
    const timeFormatted = dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const colorIndex = (index + specialCount) % 2;
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
