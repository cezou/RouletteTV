const prizesConfig = [
    { text: 'Pet de Yago en bouteille', weight: 3 },
    { text: 'Seringue utilisée', weight: 3 },
    { text: 'Cheveu de Yago', weight: 3 },
    { text: 'Rhumberto Blanc', weight: 1, special: true },
    { text: 'Un RomeroDiMery', weight: 2 },
    { text: 'Un tank', weight: 0, special: true }
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
    
    // Changer le curseur en "non autorisé"
    canvas.style.cursor = 'not-allowed';
    canvas.style.opacity = '0.7';
    
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
    
    // Calculer la somme totale des poids pour déterminer les proportions
    const totalWeight = prizesConfig.reduce((sum, prize) => sum + prize.weight, 0);
    
    // Gestion spéciale si tous les poids sont à 0
    const effectiveTotal = totalWeight === 0 ? prizesConfig.length : totalWeight;
    
    const radius = canvas.width / 2 - 10;
    let currentAngle = wheel.angle;
    
    // Dessiner les segments
    for (let i = 0; i < prizesConfig.length; i++) {
        // Calculer l'angle de ce segment basé sur son poids
        // Si le poids est 0 et le total est 0, attribution d'une taille égale
        // Sinon, si le poids est 0, on donne un segment minimal
        let segmentAngle;
        if (totalWeight === 0) {
            // Si tous les poids sont à 0, on divise le cercle équitablement
            segmentAngle = 2 * Math.PI / prizesConfig.length;
        } else if (prizesConfig[i].weight === 0) {
            // Pour les segments de poids 0, on leur donne une taille minimale
            segmentAngle = Math.PI / 180; // 1 degré en radians
        } else {
            // Taille proportionnelle au poids
            segmentAngle = (prizesConfig[i].weight / effectiveTotal) * (2 * Math.PI);
        }
        
        const startAngle = currentAngle;
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
        
        // Ajouter le texte seulement si le poids n'est pas zéro
        if (prizesConfig[i].weight !== 0) {
            // Ajuster la position du texte en fonction de la taille du segment
            // Plus le segment est petit, plus le texte doit être proche du centre
            let textDistance = radius - 20;
            
            // Si le segment est très petit, on rapproche davantage le texte du centre
            if (segmentAngle < Math.PI / 18) { // moins de 10 degrés
                textDistance = radius / 2;
            }
            
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
            
            // Adaptation supplémentaire du texte pour les petits segments
            if (segmentAngle < Math.PI / 9) { // moins de 20 degrés
                const shrinkFactor = Math.max(0.5, segmentAngle / (Math.PI / 9));
                const fontSize = Math.max(10, Math.floor(18 * shrinkFactor));
                ctx.font = ctx.font.replace(/\d+px/, `${fontSize}px`);
            }
            
            ctx.fillText(prizesConfig[i].text, textDistance, 5);
            ctx.restore();
        }
        
        // Mettre à jour l'angle pour le prochain segment
        currentAngle = endAngle;
    }
}

function spinWheel() {
    // Effacer les animations précédentes
    if (wheel.spinTime) {
        clearTimeout(wheel.spinTimer);
    }
    
    // Sélectionner un prix au hasard en tenant compte des poids
    const prize = weightedPrizes[Math.floor(Math.random() * weightedPrizes.length)];
    
    // Calculer la position angulaire de ce prix sur la roue
    const totalWeight = prizesConfig.reduce((sum, prize) => sum + prize.weight, 0);
    const effectiveTotal = totalWeight === 0 ? prizesConfig.length : totalWeight;
    
    let targetAngle = 0;
    let currentAngle = 0;
    
    // Trouver le segment correspondant au prix
    for (let i = 0; i < prizesConfig.length; i++) {
        let segmentAngle;
        
        if (totalWeight === 0) {
            segmentAngle = 2 * Math.PI / prizesConfig.length;
        } else if (prizesConfig[i].weight === 0) {
            segmentAngle = Math.PI / 180; // 1 degré
        } else {
            segmentAngle = (prizesConfig[i].weight / effectiveTotal) * (2 * Math.PI);
        }
        
        if (prizesConfig[i].text === prize.text) {
            // Prendre le milieu du segment comme cible
            targetAngle = currentAngle + segmentAngle / 2;
            break;
        }
        
        currentAngle += segmentAngle;
    }
    
    // Paramètres de rotation
    const spinTimeTotal = 4000; // ms
    const spinRevolutions = 10;
    
    // Correction du calcul de l'angle final
    // Dans un canvas, 0 est à droite (3h) et le haut est à -Math.PI/2 (ou 3*Math.PI/2)
    // Donc pour placer le segment en haut, nous voulons que targetAngle + wheel.angle = -Math.PI/2
    // Ce qui donne wheel.angle = -Math.PI/2 - targetAngle
    // Puis on ajoute nos tours complets
    const topPosition = 3 * Math.PI / 2; // Le sommet de la roue (là où est le pointeur)
    const finalAngle = 2 * Math.PI * spinRevolutions + (topPosition - targetAngle);
    
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
