const prizesConfig = [
    { text: 'Pet de Yago en bouteille', weight: 3 },
    { text: 'Seringue utilisée', weight: 3 },
    { text: 'Cheveu de Yago', weight: 3 },
    { text: 'Rhumberto Blanc', weight: 1, special: true },

];

// Créer un tableau plat basé sur les poids
const weightedPrizes = prizesConfig.flatMap(prize => 
    Array(prize.weight).fill({ text: prize.text, special: prize.special })
);

let isSpinning = false;
let username = '';
let hasSpun = false;
let canvas, ctx, wheel;

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
    
    // Remplacer la div wheel par un canvas
    const wheelContainer = document.querySelector('.wheel-container');
    const wheelElement = document.querySelector('.wheel');
    wheelElement.style.display = 'block';
    
    // Créer le canvas pour la roue
    canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    canvas.className = 'wheel active';
    canvas.style.cursor = 'pointer';
    wheelContainer.replaceChild(canvas, wheelElement);
    
    // Ajouter l'event listener au canvas
    canvas.addEventListener('click', handleWheelClick);
    
    // Dessiner la roue
    ctx = canvas.getContext('2d');
    wheel = {
        angle: 0,
        spinTime: 0,
        spinTimeTotal: 0,
        isSpinning: false
    };
    
    drawWheel();
});

function handleWheelClick() {
    if (isSpinning || hasSpun) return;
    
    isSpinning = true;
    wheel.isSpinning = true;
    spinWheel();
}

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner le cercle extérieur
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    const numSegments = prizesConfig.length;
    const segmentAngle = 2 * Math.PI / numSegments;
    const radius = canvas.width / 2 - 10;
    
    // Dessiner les segments
    for (let i = 0; i < numSegments; i++) {
        const startAngle = wheel.angle + i * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, startAngle, endAngle);
        ctx.closePath();
        
        // Couleur du segment
        if (prizesConfig[i].special) {
            ctx.fillStyle = '#FFD700';
        } else {
            ctx.fillStyle = i % 2 === 0 ? '#FF0000' : '#000000';
        }
        
        ctx.fill();
        ctx.stroke();
        
        // Ajouter le texte
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(startAngle + segmentAngle / 2);
        
        // Texte
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.font = '18px LovingCaress, Arial, sans-serif';
        
        // Ajuster la taille du texte si nécessaire
        const maxLength = 20;
        if (prizesConfig[i].text.length > maxLength) {
            const scale = Math.min(1, maxLength / prizesConfig[i].text.length);
            ctx.font = `${18 * scale}px LovingCaress, Arial, sans-serif`;
        }
        
        ctx.fillText(prizesConfig[i].text, radius - 20, 5);
        ctx.restore();
    }
}

function spinWheel() {
    // Effacer les animations précédentes
    if (wheel.spinTime) {
        clearTimeout(wheel.spinTimer);
    }
    
    // Sélectionner un prix au hasard en tenant compte des poids
    const prize = weightedPrizes[Math.floor(Math.random() * weightedPrizes.length)];
    // Trouver l'index dans le tableau original pour la rotation
    const prizeIndex = prizesConfig.findIndex(p => p.text === prize.text);
    
    // Paramètres de rotation
    const spinTimeTotal = 4000; // ms
    const spinRevolutions = 10;
    
    // Calculer l'angle de rotation en ajoutant plusieurs tours complets pour l'effet
    const segmentAngle = 2 * Math.PI / prizesConfig.length;
    const targetAngle = 2 * Math.PI - (prizeIndex * segmentAngle); // inversion pour que ça s'arrête au bon segment
    const finalAngle = 2 * Math.PI * spinRevolutions + targetAngle + 180;
    
    // Paramètres de l'animation
    const startTime = performance.now();
    
    function rotate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinTimeTotal, 1);
        
        // Fonction d'easing pour ralentir vers la fin
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // Mise à jour de l'angle
        wheel.angle = easeOut * finalAngle;
        
        // Dessiner la roue mise à jour
        drawWheel();
        
        if (progress < 1) {
            // Continuer l'animation
            requestAnimationFrame(rotate);
        } else {
            // Animation terminée
            isSpinning = false;
            wheel.isSpinning = false;
            hasSpun = true;
            
            // Afficher le message de victoire
            showWinPopup(prize.text);
            
            // Sauvegarder le résultat
            saveResult(username, prize.text);
        }
    }
    
    // Démarrer l'animation
    requestAnimationFrame(rotate);
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
