import { preloadIcons } from './wheel/utils.js';
import { initWheelUI } from './wheel/ui.js';

/** @brief Main entry point for the wheel application */
document.addEventListener('DOMContentLoaded', () => {

  preloadIcons();
  initWheelUI();
});
