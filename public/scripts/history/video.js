/** @brief Video playback permission state */
let canPlayVideo = false;


/** @brief Video overlay elements references */
let videoOverlay;
let prizeVideo;
let prizeTextOverlay;


/** @brief Initializes video elements and event handlers */
export function initVideo() {
  videoOverlay = document.getElementById('videoOverlay');
  if (!videoOverlay) {
    console.error('Video overlay element not found');
    return;
  }
  
  prizeVideo = document.getElementById('prizeVideo');
  if (!prizeVideo) {
    console.error('Prize video element not found');
    return;
  }
  
  prizeTextOverlay = document.querySelector('.prize-text-overlay');
  
  console.log('Video elements initialized');
  prizeVideo.addEventListener('ended', closeFadeVideo);
  closeVideo();
}


/** @brief Enables video playback after user interaction */
export function enableVideo() {
  console.log('Video playback enabled');
  canPlayVideo = true;
}


/** @brief Displays and plays prize video with text overlay with fade-in effect */
export function playPrizeVideo(username, prize) {
  if (!videoOverlay || !prizeVideo) {
    console.error('Video elements not initialized');
    return;
  }
  
  if (!canPlayVideo) {
    console.log('Cannot play video: waiting for user interaction');
    return;
  }
  
  console.log('Playing prize video for', username, prize);
  prizeVideo.pause();
  prizeVideo.currentTime = 0;
  
  const usernameElement = document.getElementById('winnerUsername');
  const prizeElement = document.getElementById('prizeName');
  
  if (usernameElement) usernameElement.textContent = username;
  if (prizeElement) prizeElement.textContent = prize;
  
  // Setup for fade-in effect
  if (prizeVideo) prizeVideo.style.opacity = '0';
  if (prizeTextOverlay) prizeTextOverlay.style.opacity = '0';
  
  // Show overlay first (still transparent due to opacity)
  videoOverlay.classList.add('active');
  
  // Small delay to ensure elements are in DOM before animating
  setTimeout(() => {
    if (prizeVideo) prizeVideo.style.opacity = '1';
    
    // Start video playback
    try {
      prizeVideo.muted = false;
      const playPromise = prizeVideo.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Video playing successfully');
          // Show text overlay with slight delay after video starts
          setTimeout(() => {
            if (prizeTextOverlay) prizeTextOverlay.style.opacity = '1';
          }, 300);
        }).catch(error => {
          console.error('Failed to play video:', error);
          closeVideo();
        });
      }
    } catch (error) {
      console.error('Error playing video:', error);
      closeVideo();
    }
  }, 50);
}


/** @brief Creates a fade-out transition before closing video */
function closeFadeVideo() {
  if (!videoOverlay || !prizeVideo) {
    console.error('Video elements not initialized');
    return;
  }
  
  prizeVideo.pause();
  
  // Fade out video and text
  console.log('Starting fade-out transition');
  
  // First fade out the text
  if (prizeTextOverlay) {
    prizeTextOverlay.style.opacity = '0';
  }
  
  // Then fade out the video
  prizeVideo.style.opacity = '0';
  
  // Wait for transition to complete before removing from DOM
  setTimeout(() => {
    videoOverlay.classList.remove('active');
    // Reset opacity for next use
    setTimeout(() => {
      if (prizeVideo.style.opacity !== '') prizeVideo.style.opacity = '';
      if (prizeTextOverlay && prizeTextOverlay.style.opacity !== '') prizeTextOverlay.style.opacity = '';
    }, 100);
  }, 800); // Should match the CSS transition time
}


/** @brief Closes the video overlay immediately */
export function closeVideo() {
  if (!videoOverlay || !prizeVideo) {
    console.error('Video elements not initialized');
    return;
  }
  
  prizeVideo.pause();
  videoOverlay.classList.remove('active');
}


/** @brief Sets up auto-close timeout for special prizes */
export function setupSpecialPrizeTimeout() {
  setTimeout(() => {
    if (videoOverlay && videoOverlay.classList.contains('active')) {
      console.log('Auto-closing video overlay after timeout');
      closeFadeVideo();
    }
  }, 10000);
}
