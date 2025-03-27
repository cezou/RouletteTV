import { preloadIcons } from './wheel/utils.js';
import { initWheelUI } from './wheel/ui.js';

/**
 * @brief Main entry point for the wheel application
 */
document.addEventListener('DOMContentLoaded', () => {
    preloadIcons();
    initWheelUI();
});

const prizesConfig = [
    { text: 'Pet de Yago', weight: 3, icon: '../assets/images/petyago.svg' },
    { text: 'Seringue utilisée', weight: 3, icon: '../assets/images/seringue.svg' },
    { text: 'Cheveu de Yago', weight: 3, icon: '../assets/images/scissors.svg' },
    { text: 'Rhumberto Blanc', weight: 1, special: true, icon: '../assets/images/rhum.svg' },
    { text: 'RomeroDiMery', weight: 2, icon: '../assets/images/rhum.svg' }, // Utiliser une icône par défaut
];

// Créer un tableau plat basé sur les poids
const weightedPrizes = prizesConfig.flatMap(prize => 
    Array(prize.weight).fill({ text: prize.text, special: prize.special, icon: prize.icon })
);

// Précharger toutes les icônes SVG
const iconsCache = {};
prizesConfig.forEach(prize => {
    if (prize.icon && !iconsCache[prize.icon]) {
        const img = new Image();
        img.src = prize.icon;
        iconsCache[prize.icon] = img;
    }
});

let isSpinning = false;
let username = '';
let hasSpun = false;
let canvas, ctx, wheel;
let centerImage = new Image(); // Image du centre de la roue

// Charger l'image du centre
centerImage.src = '../assets/images/roulette-center.png';
centerImage.onload = function() {
    console.log('Image du centre chargée avec succès');
};
centerImage.onerror = function() {
    console.error('Erreur lors du chargement de l\'image du centre');
};

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
    canvas.width = 650;  // Augmenté de 500px à 650px
    canvas.height = 650; // Augmenté de 500px à 650px
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
        isSpinning: false,
        centerImageAngle: 0 // Nouvel attribut pour la rotation de l'image centrale
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
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = canvas.width / 2 - 5;
    const innerRadius = outerRadius - 240;
    
    // MODIFIÉ: Augmenter la largeur du cercle extérieur pour plus de visibilité
    const middleRadius = outerRadius - 25; // Augmenté de 11px à 25px pour plus de visibilité
    
    // Calculer la somme totale des poids pour déterminer les proportions
    const totalWeight = prizesConfig.reduce((sum, prize) => sum + prize.weight, 0);
    const effectiveTotal = totalWeight === 0 ? prizesConfig.length : totalWeight;

    // Étape 1: Dessiner les segments
    currentAngle = wheel.angle;
    for (let i = 0; i < prizesConfig.length; i++) {
        // Calculer l'angle de ce segment basé sur son poids
        let segmentAngle;
        if (totalWeight === 0) {
            segmentAngle = 2 * Math.PI / prizesConfig.length;
        } else if (prizesConfig[i].weight === 0) {
            segmentAngle = Math.PI / 180; // 1 degré en radians
        } else {
            segmentAngle = (prizesConfig[i].weight / effectiveTotal) * (2 * Math.PI);
        }
        
        const startAngle = currentAngle;
        const endAngle = startAngle + segmentAngle;
        
        // 2. Dessiner d'abord la partie INTÉRIEURE du segment (avec dégradé)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, middleRadius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        
        // Créer un dégradé pour la partie intérieure
        const gradient = ctx.createRadialGradient(
            centerX, centerY, innerRadius,
            centerX, centerY, middleRadius
        );
        
        // Utiliser les bonnes couleurs pour le dégradé
        if (i % 2 === 0) {
            gradient.addColorStop(0, '#7bb0cf'); // Couleur intérieure
            gradient.addColorStop(1, '#345775'); // Couleur extérieure
        } else {
            gradient.addColorStop(0, '#8daac0'); // Couleur intérieure
            gradient.addColorStop(1, '#253747'); // Couleur extérieure
        }
        
        // Pour les segments spéciaux, ajuster le gradient
        if (prizesConfig[i].special) {
            if (i % 2 === 0) {
                gradient.addColorStop(0, '#ffffcc');
                gradient.addColorStop(1, '#916f13');
            } else {
                gradient.addColorStop(0, '#ffffcc');
                gradient.addColorStop(1, '#7d5f0f');
            }
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 1. Dessiner ENSUITE la partie EXTÉRIEURE du segment (couleur solide)
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(startAngle) * middleRadius, centerY + Math.sin(startAngle) * middleRadius);
        ctx.arc(centerX, centerY, middleRadius, startAngle, endAngle);
        ctx.lineTo(centerX + Math.cos(endAngle) * outerRadius, centerY + Math.sin(endAngle) * outerRadius);
        ctx.arc(centerX, centerY, outerRadius, endAngle, startAngle, true);
        ctx.closePath();
        
        // Couleur solide pour la partie extérieure - utiliser une couleur distincte et vive
        ctx.fillStyle = '#0A4B77'; // Bleu plus foncé et plus vibrant
        ctx.fill();
        
        currentAngle = endAngle;
    }
    
    
    
    // Étape 2: Dessiner les textes ET LES ICÔNES
    currentAngle = wheel.angle;
    for (let i = 0; i < prizesConfig.length; i++) {
        if (prizesConfig[i].weight !== 0) {
            let segmentAngle;
            if (totalWeight === 0) {
                segmentAngle = 2 * Math.PI / prizesConfig.length;
            } else if (prizesConfig[i].weight === 0) {
                segmentAngle = Math.PI / 180;
            } else {
                segmentAngle = (prizesConfig[i].weight / effectiveTotal) * (2 * Math.PI);
            }
            
            // Calculer la position du texte
            const textAngle = currentAngle + segmentAngle / 2;
            
            // Position du texte: intérieur du segment
            const textRadius = innerRadius + 10;
            
            // NOUVELLE position de l'icône: proche du texte mais côté extérieur du segment
            const iconRadius = innerRadius + (middleRadius - innerRadius) * 0.7; // 70% entre innerRadius et middleRadius
            const iconSize = 60; // Taille ajustée
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(textAngle);
            
            // Dessiner le texte (vers l'intérieur)
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = '22px NavigatorHand, Arial, sans-serif';
            ctx.fillText(prizesConfig[i].text, textRadius, 0);
            
            // Dessiner l'icône (vers l'extérieur dans la même zone)
            const icon = iconsCache[prizesConfig[i].icon];
            if (icon && icon.complete) {
                // Sauvegarder le contexte pour colorer et orienter l'icône
                ctx.save();
                
                // Positionner au bon endroit pour l'icône
                ctx.translate(iconRadius, 0);
                
                // CORRIGÉ: Rotation dans le sens horaire
                ctx.rotate(Math.PI/2); // 90 degrés (sens horaire)
                
                // Dessiner l'icône en blanc, centrée sur sa nouvelle origine
                ctx.filter = 'brightness(0) invert(1)'; // Transforme l'icône en blanc
                ctx.drawImage(icon, -iconSize/2, -iconSize/2, iconSize, iconSize);
                
                ctx.restore(); // Restaurer le contexte après avoir dessiné l'icône
            }
            
            ctx.restore();
            
            currentAngle += segmentAngle;
        } else {
            // Avancer l'angle même pour les segments avec poids 0
            if (totalWeight === 0) {
                currentAngle += 2 * Math.PI / prizesConfig.length;
            } else {
                currentAngle += Math.PI / 180;
            }
        }
    }
    
    
    // Étape 3: Dessiner les cercles extérieurs
    // Cercle extérieur avec dégradé
    const outerRingGradient = ctx.createRadialGradient(
        centerX, centerY, outerRadius - 5,
        centerX, centerY, outerRadius + 20
    );
    outerRingGradient.addColorStop(0, '#e3e3e4');
    outerRingGradient.addColorStop(1, '#4c4d4d');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = outerRingGradient;
    ctx.lineWidth = 16;
    ctx.stroke();
    
    // Dessiner l'anneau intérieur du bord (cercle noir)
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius - 16, 0, 2 * Math.PI);
    ctx.strokeStyle = '#151616';
    ctx.lineWidth = 32;
    ctx.stroke();
    
    // AJOUTÉ: Dessiner le cercle bleu juste à l'intérieur du cercle noir
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius - 32, 0, 2 * Math.PI);
    ctx.strokeStyle = '#283a4b';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Étape 4: Redessiner les traits séparateurs PAR-DESSUS les segments
    currentAngle = wheel.angle;
    for (let i = 0; i < prizesConfig.length; i++) {
        let segmentAngle;
        if (totalWeight === 0) {
            segmentAngle = 2 * Math.PI / prizesConfig.length;
        } else if (prizesConfig[i].weight === 0) {
            segmentAngle = Math.PI / 180;
        } else {
            segmentAngle = (prizesConfig[i].weight / effectiveTotal) * (2 * Math.PI);
        }
        
        const endAngle = currentAngle + segmentAngle;
        
        // MODIFIÉ: Dessiner le séparateur avec extension au-delà du cercle gris
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        // Extension légère de 5px au-delà du cercle extérieur
        const extendedRadius = outerRadius + 5;
        ctx.lineTo(centerX + Math.cos(endAngle) * extendedRadius, 
                 centerY + Math.sin(endAngle) * extendedRadius);
        ctx.strokeStyle = '#1d1f1d';
        ctx.lineWidth = 10; // MODIFIÉ: Réduit de 12 à 10
        ctx.stroke();
        
        currentAngle = endAngle;
    }
    
    // Étape 5: Dessiner l'image du centre EN DERNIER (AU-DESSUS de tout) avec rotation
    if (centerImage.complete && centerImage.naturalWidth !== 0) {
        // Calculer les dimensions pour ajuster l'image au cercle intérieur
        const imageSize = innerRadius * 2;
        const imageX = centerX - innerRadius;
        const imageY = centerY - innerRadius;
        
        // Sauvegarder le contexte avant rotation
        ctx.save();
        
        // Déplacer le point d'origine au centre de l'image
        ctx.translate(centerX, centerY);
        
        // Appliquer la rotation
        ctx.rotate(wheel.centerImageAngle);
        
        // Dessiner l'image au centre (avec origine déplacée)
        ctx.drawImage(centerImage, -innerRadius, -innerRadius, imageSize, imageSize);
        
        // Restaurer le contexte
        ctx.restore();
    } else {
        // Fallback si l'image n'est pas chargée
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#242424';
        ctx.fill();
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
        
        // Mise à jour de l'angle de la roue
        wheel.angle = easeOut * finalAngle;
        
        // MODIFIÉ: L'image tourne exactement comme le reste de la roue
        wheel.centerImageAngle = wheel.angle; // Même sens et même vitesse
        
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
    message.textContent = `Vous avez gagné un(e) ${prize}!`;
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
