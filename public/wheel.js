const prizesConfig = [
    { text: 'Eau des chiottes du casino', weight: 5 },
    { text: '10 000$', weight: 1 },
    { text: 'Pet de Yago en bouteille', weight: 3 },
    { text: 'Seringue utilisée', weight: 3 },
    { text: 'Cheveu de Yago', weight: 3 },
    { text: 'Rhumberto Blanc', weight: 1, special: true }
];

// Créer un tableau plat basé sur les poids
const weightedPrizes = prizesConfig.flatMap(prize => 
    Array(prize.weight).fill({ text: prize.text, special: prize.special })
);

let isSpinning = false;
let username = '';
let hasSpun = false;

// Add event listener for the arrow button
document.querySelector('.submit-arrow').addEventListener('click', () => {
    const usernameInput = document.getElementById('username');
    if (!usernameInput.value.trim()) {
        alert('Please enter your name first!');
        return;
    }

    username = usernameInput.value;
    document.querySelector('.welcome-screen').style.display = 'none';
    document.querySelector('.pointer').classList.add('active');
    const wheelElement = document.querySelector('.wheel');
    wheelElement.classList.add('active');
    createWheel();
});

// Modify wheel click handler
document.querySelector('.wheel').addEventListener('click', async () => {
    if (isSpinning || hasSpun) return;
    
    isSpinning = true;
    const wheelElement = document.querySelector('.wheel');
    wheelElement.classList.add('disabled');
    
    const prize = await spinWheel();
    await saveResult(username, prize);
    
    isSpinning = false;
    hasSpun = true; // Prevent further spins
});

// Remove the original spin button event listener

function createWheel() {
    const wheel = document.querySelector('.wheel');
    const segmentAngle = 360 / prizesConfig.length;
    
    prizesConfig.forEach((prize, index) => {
        const segment = document.createElement('div');
        segment.className = 'wheel-segment';
        
        const content = document.createElement('div');
        content.className = 'segment-content';
        content.textContent = prize.text;
        
        segment.style.transform = `rotate(${index * segmentAngle}deg)`;
        
        if (prize.special) {
            segment.style.color = '#FFD700';
        } else {
            segment.style.color = index % 2 === 0 ? '#FF0000' : '#000000';
        }
        
        // Ajuster la taille du texte si nécessaire
        const maxLength = 20;
        if (prize.text.length > maxLength) {
            const scale = Math.min(1, maxLength / prize.text.length);
            content.style.fontSize = `${30 * scale}px`;
        }
        
        content.style.transform = `rotate(90deg)`;
        
        segment.appendChild(content);
        wheel.appendChild(segment);
    });
}

async function spinWheel() {
    const wheel = document.querySelector('.wheel');
    // Sélectionner un prix au hasard en tenant compte des poids
    const prize = weightedPrizes[Math.floor(Math.random() * weightedPrizes.length)];
    // Trouver l'index dans le tableau original pour la rotation
    const prizeIndex = prizesConfig.findIndex(p => p.text === prize.text);
    
    const rotations = 5;
    const segmentAngle = 360 / prizesConfig.length;
    const finalAngle = -(rotations * 360 + (prizeIndex * segmentAngle) + 180);
    
    wheel.style.transform = `rotate(${finalAngle}deg)`;
    
    return new Promise((resolve) => {
        setTimeout(() => {
            showWinPopup(prize.text);
            resolve(prize.text);
        }, 4000);
    });
}

function showWinPopup(prize) {
    const popup = document.getElementById('winPopup');
    const message = document.getElementById('winMessage');
    message.textContent = `Vous avez gagné ${prize}!`;
    popup.style.display = 'block';
    
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}

async function saveResult(username, prize) {
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
