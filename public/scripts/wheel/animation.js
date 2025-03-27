import { prizesConfig, weightedPrizes } from './config.js';
import { drawWheel } from './renderer.js';
import { showWinPopup, saveResult, playSpinSound } from './utils.js';

/**
 * @brief Spins the wheel to a randomly selected prize
 * @param {Object} wheel - Wheel properties object
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {string} username - Player's username
 * @param {Function} onSpinEnd - Callback when spinning ends
 */
export function spinWheel(wheel, ctx, username, onSpinEnd) {
    if (wheel.spinTime) {
        clearTimeout(wheel.spinTimer);
    }
    playSpinSound();
    const prize = weightedPrizes[Math.floor(Math.random() * weightedPrizes.length)];
    const totalWeight = prizesConfig.reduce((sum, prize) => sum + prize.weight, 0);
    const effectiveTotal = totalWeight === 0 ? prizesConfig.length : totalWeight;
    let segmentStartAngle = 0;
    let segmentSize = 0;
    let currentAngle = 0;
    
    for (let i = 0; i < prizesConfig.length; i++) {
        let segmentAngle;
        if (totalWeight === 0) {
            segmentAngle = 2 * Math.PI / prizesConfig.length;
        } else if (prizesConfig[i].weight === 0) {
            segmentAngle = Math.PI / 180;
        } else {
            segmentAngle = (prizesConfig[i].weight / effectiveTotal) * (2 * Math.PI);
        }
        if (prizesConfig[i].text === prize.text) {
            segmentStartAngle = currentAngle;
            segmentSize = segmentAngle;
            break;
        }
        currentAngle += segmentAngle;
    }
    
    const randomPosition = segmentStartAngle + (Math.random() * 0.8 + 0.1) * segmentSize;
    const spinTimeTotal = 4000;
    const spinRevolutions = 10;
    const topPosition = 3 * Math.PI / 2;
    const selectedTargetAngle = randomPosition;
    
    preSpinWheel(wheel, ctx, () => {
        const finalAngle = 2 * Math.PI * spinRevolutions + 
                         (topPosition - selectedTargetAngle - wheel.angle);
        animateWheel(wheel, ctx, finalAngle, spinTimeTotal, () => {
            showWinPopup(prize.text);
            saveResult(username, prize.text);
            if (onSpinEnd) onSpinEnd();
        });
    });
}

/**
 * @brief Performs a small rotation to the left before the main spin
 */
function preSpinWheel(wheel, ctx, onComplete) {
    const preSpin = {
        startAngle: wheel.angle,
        targetAngle: wheel.angle - Math.PI / 6,
        duration: 1200,
        startTime: performance.now()
    };
    
    function animatePreSpin(currentTime) {
        const elapsed = currentTime - preSpin.startTime;
        const progress = Math.min(elapsed / preSpin.duration, 1);
        const easing = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        wheel.angle = preSpin.startAngle + (preSpin.targetAngle - preSpin.startAngle) * easing;
        wheel.centerImageAngle = wheel.angle;
        drawWheel(ctx, wheel);
        if (progress < 1) {
            requestAnimationFrame(animatePreSpin);
        } else {
            if (onComplete) onComplete();
        }
    }
    requestAnimationFrame(animatePreSpin);
}

/**
 * @brief Animates the wheel rotation using requestAnimationFrame
 */
function animateWheel(wheel, ctx, finalAngle, duration, onComplete) {
    const startAngle = wheel.angle;
    const startTime = performance.now();
    
    function rotate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        wheel.angle = startAngle + easeOut * finalAngle;
        wheel.centerImageAngle = wheel.angle;
        drawWheel(ctx, wheel);
        if (progress < 1) {
            requestAnimationFrame(rotate);
        } else {
            if (onComplete) onComplete();
        }
    }
    requestAnimationFrame(rotate);
}
