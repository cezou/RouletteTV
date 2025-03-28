import { preloadIcons } from './wheel/utils.js';
import { initWheelUI } from './wheel/ui.js';

/** @brief Main entry point for the wheel application */
document.addEventListener('DOMContentLoaded', () => {
  const insertSound = new Audio('/assets/sounds/insert.mp3');
  insertSound.play().catch(error => {
    console.warn('Autoplay prevented for insert sound:', error);
    const playOnInteraction = () => {
      insertSound.play().catch(e => console.error('Failed to play insert sound:', e));
      document.removeEventListener('click', playOnInteraction);
      document.removeEventListener('keydown', playOnInteraction);
      document.removeEventListener('touchstart', playOnInteraction);
    };
    document.addEventListener('click', playOnInteraction);
    document.addEventListener('keydown', playOnInteraction);
    document.addEventListener('touchstart', playOnInteraction);
  });
  preloadIcons();
  initWheelUI();
});
