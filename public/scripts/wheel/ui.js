import { drawWheel } from './renderer.js';
import { spinWheel } from './animation.js';
import { centerImage } from './config.js';
import { playInsertSound } from './utils.js';

/**
 * @brief Initializes the wheel UI and event listeners
 * @returns {Object} State object containing various properties and methods
 */
export function initWheelUI() {
    const state = {
        canvas: null,
        ctx: null,
        wheel: null,
        username: '',
        isSpinning: false,
        hasSpun: false
    };

    // Ajouter l'événement click avec lecture du son d'insertion
    document.querySelector('.submit-arrow').addEventListener('click', () => {
        // Jouer le son d'insertion au moment du clic
        playInsertSound();

        // Continuer avec la soumission du nom d'utilisateur
        handleUsernameSubmit(state);
    });

    centerImage.onload = function () {
        console.log('Image du centre chargée avec succès');
        if (state.ctx) drawWheel(state.ctx, state.wheel);
    };

    centerImage.onerror = function () {
        console.error('Erreur lors du chargement de l\'image du centre');
    };

    return state;
}

/**
 * @brief Handles the username submission and initializes the wheel
 */
function handleUsernameSubmit(state) {
    const usernameInput = document.getElementById('username');
    if (!usernameInput.value.trim()) {
        return;
    }

    const insertSound = new Audio('/assets/sounds/insert.mp3');
    insertSound.volume = 0.5; // Set volume to 50%
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

    state.username = usernameInput.value;
    document.querySelector('.welcome-screen').style.display = 'none';
    document.querySelector('.pointer').classList.add('active');
    const wheelContainer = document.querySelector('.wheel-container');
    const wheelElement = document.querySelector('.wheel');
    wheelElement.style.display = 'block';
    state.canvas = document.createElement('canvas');
    state.canvas.width = 650;
    state.canvas.height = 650;
    state.canvas.className = 'wheel active';
    state.canvas.style.cursor = 'pointer';
    wheelContainer.replaceChild(state.canvas, wheelElement);
    state.canvas.addEventListener('click', () => handleWheelClick(state));
    state.ctx = state.canvas.getContext('2d');
    state.wheel = {
        angle: 0,
        spinTime: 0,
        spinTimeTotal: 0,
        isSpinning: false,
        centerImageAngle: 0
    };
    drawWheel(state.ctx, state.wheel);
}

/**
 * @brief Handles click on the wheel to start spinning
 */
function handleWheelClick(state) {
    if (state.isSpinning || state.hasSpun) return;
    state.isSpinning = true;
    state.wheel.isSpinning = true;
    state.canvas.style.cursor = 'not-allowed';
    state.canvas.style.opacity = '0.7';
    spinWheel(state.wheel, state.ctx, state.username, () => {
        state.isSpinning = false;
        state.wheel.isSpinning = false;
        state.hasSpun = true;
    });
}
