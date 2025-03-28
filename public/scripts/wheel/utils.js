import { prizesConfig, iconsCache } from './config.js';

/** @brief Audio elements for sound effects */
const spinSound = new Audio('/assets/sounds/wheel.mp3');
const insertSound = new Audio('/assets/sounds/insert.mp3');

/** @brief Preloads all SVG icons used in the wheel */
export function preloadIcons() {
  prizesConfig.forEach(prize => {
    if (prize.icon && !iconsCache[prize.icon]) {
      const img = new Image();
      img.src = prize.icon;
      iconsCache[prize.icon] = img;
    }
  });
}

/** @brief Plays the wheel spinning sound */
export function playSpinSound() {
  spinSound.currentTime = 0;
  spinSound.play().catch(error => {
    console.error('Failed to play spin sound:', error);
  });
}

/** @brief Plays the insert sound when user submits name */
export function playInsertSound() {
  insertSound.currentTime = 0;
  insertSound.play().catch(error => {
    console.error('Failed to play insert sound:', error);
  });
}

/** @brief Shows the win popup with the prize name without playing sounds */
export function showWinPopup(prize) {
  const popup = document.getElementById('winPopup');
  const message = document.getElementById('winMessage');
  
  // Replace \n with <br> to create a line break in HTML
  message.innerHTML = `Vous avez gagné un(e)<br><b>${prize}</b>!`;
  
  // Use 'block' instead of 'flex' to maintain original layout
  popup.style.display = 'block';
  
  // Suppression de la lecture des sons ici car ils sont déjà joués dans history.html
  // Pas besoin de les répéter
}

/** @brief Saves the result to the server */
export async function saveResult(username, prize) {
  try {
    const response = await fetch('/api/save-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, prize })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Save successful:', data);
  } catch (error) {
    console.error('Failed to save result:', error);
  }
}
