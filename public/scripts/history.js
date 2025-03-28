// Fix import paths by removing the leading slash
import { enableAudio } from './history/audio.js';
import { initVideo, enableVideo, closeVideo } from './history/video.js';
import { fetchHistory } from './history/api.js';
import { displayHistory } from './history/ui.js';


/** @brief User interaction state */
let userHasInteracted = false;


/** @brief Initializes the history page */
function init() {
  initVideo();
  document.addEventListener('click', handleUserInteraction);
  document.addEventListener('keydown', handleUserInteraction);
  document.addEventListener('touchstart', handleUserInteraction);
  
  // Fetch immediately and refresh every 5 seconds
  refreshHistory();
  setInterval(refreshHistory, 5000);
  
  // Debug event listener functionality
  console.log('Event listeners initialized');
}


/** @brief Handles user interaction to enable audio/video playback */
function handleUserInteraction() {
  console.log('User interaction detected');
  if (userHasInteracted) return;
  
  userHasInteracted = true;
  console.log('First user interaction, enabling audio/video');
  
  const overlay = document.getElementById('interactionOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
    console.log('Interaction overlay hidden');
  } else {
    console.error('Interaction overlay element not found');
  }
  
  document.removeEventListener('click', handleUserInteraction);
  document.removeEventListener('keydown', handleUserInteraction);
  document.removeEventListener('touchstart', handleUserInteraction);
  
  enableAudio();
  enableVideo();
}


/** @brief Fetches and displays the latest history */
function refreshHistory() {
  fetchHistory((history, previousEntries, updatePreviousFn) => {
    displayHistory(history, previousEntries, updatePreviousFn);
    
    // Ensure overlay is closed on initial load if user hasn't interacted
    if (!userHasInteracted) {
      closeVideo();
    }
  });
}


// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing history module');
  init();
});
