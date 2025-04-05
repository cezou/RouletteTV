/** @brief Audio elements for sound effects */
const specialSound = new Audio('/assets/sounds/special_anim.mp3');
const looseSound = new Audio('/assets/sounds/loose.mp3');

// Set volume to 50%
specialSound.volume = 0.5;
looseSound.volume = 0.5;


/** @brief Audio playback permission state */
let canPlayAudio = false;


/** @brief Enables audio playback after user interaction */
export function enableAudio() {
  canPlayAudio = true;
  const silentSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADQgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAQAAAAAAAAAAABSAJAJAQgAAgAAAA0JkciNSAAAAAAAAAAAAAAAAAAAA//sUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZCQP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZEoP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
  silentSound.play().catch(e => console.log('Silent sound failed to play'));
}


/** @brief Plays the appropriate sound based on prize type */
export function playSound(isSpecial) {
  if (!canPlayAudio) {
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
