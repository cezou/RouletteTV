import { prizesConfig, iconsCache, centerImage } from './config.js';

/**
 * @brief Draws the entire wheel with all components
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} wheel - Wheel properties
 * @param {number} wheel.angle - Current rotation angle
 * @param {number} wheel.centerImageAngle - Rotation angle for center image
 */
export function drawWheel(ctx, wheel) {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = canvas.width / 2 - 5;
    const innerRadius = outerRadius - 240;
    const middleRadius = outerRadius - 25;
    const totalWeight = prizesConfig.reduce((sum, prize) => sum + prize.weight, 0);
    const effectiveTotal = totalWeight === 0 ? prizesConfig.length : totalWeight;

    drawSegments(ctx, wheel, centerX, centerY, outerRadius, middleRadius, innerRadius, totalWeight, effectiveTotal);
    drawTextsAndIcons(ctx, wheel, centerX, centerY, outerRadius, middleRadius, innerRadius, totalWeight, effectiveTotal);
    drawCircles(ctx, centerX, centerY, outerRadius);
    drawSeparators(ctx, wheel, centerX, centerY, outerRadius, totalWeight, effectiveTotal);
    drawCenterImage(ctx, wheel, centerX, centerY, innerRadius);
}

/**
 * @brief Draws all wheel segments with gradients
 */
function drawSegments(ctx, wheel, centerX, centerY, outerRadius, middleRadius, innerRadius, totalWeight, effectiveTotal) {
    let currentAngle = wheel.angle;
    let specialCount = 0;
    
    for (let i = 0; i < prizesConfig.length; i++) {
        let segmentAngle;
        if (totalWeight === 0) {
            segmentAngle = 2 * Math.PI / prizesConfig.length;
        } else if (prizesConfig[i].weight === 0) {
            segmentAngle = Math.PI / 180;
        } else {
            segmentAngle = (prizesConfig[i].weight / effectiveTotal) * (2 * Math.PI);
        }
        const startAngle = currentAngle;
        const endAngle = startAngle + segmentAngle;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, middleRadius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        const gradient = ctx.createRadialGradient(
            centerX, centerY, innerRadius,
            centerX, centerY, middleRadius
        );
        const colorIndex = (i + specialCount) % 2;
        if (colorIndex === 0) {
            gradient.addColorStop(0, '#7bb0cf');
            gradient.addColorStop(1, '#345775');
        } else {
            gradient.addColorStop(0, '#8daac0');
            gradient.addColorStop(1, '#253747');
        }
        if (prizesConfig[i].special) {
            if (colorIndex === 0) {
                gradient.addColorStop(0, '#ffffcc');
                gradient.addColorStop(1, '#916f13');
            } else {
                gradient.addColorStop(0, '#ffffcc');
                gradient.addColorStop(1, '#7d5f0f');
            }
            specialCount++;
        }
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(startAngle) * middleRadius, centerY + Math.sin(startAngle) * middleRadius);
        ctx.arc(centerX, centerY, middleRadius, startAngle, endAngle);
        ctx.lineTo(centerX + Math.cos(endAngle) * outerRadius, centerY + Math.sin(endAngle) * outerRadius);
        ctx.arc(centerX, centerY, outerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = '#0A4B77';
        ctx.fill();
        currentAngle = endAngle;
    }
}

/**
 * @brief Draws the texts and icons for each segment
 */
function drawTextsAndIcons(ctx, wheel, centerX, centerY, outerRadius, middleRadius, innerRadius, totalWeight, effectiveTotal) {
    let currentAngle = wheel.angle;
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
            const startAngle = currentAngle;
            const textAngle = currentAngle + segmentAngle / 2 - 0.02;
            const textRadius = innerRadius + 10;
            const iconRadius = innerRadius + (middleRadius - innerRadius) * 0.7;
            const iconSize = 60;
            const oddsPercentage = Math.round((prizesConfig[i].weight / totalWeight) * 100);
            const segmentWidth = innerRadius * Math.sin(segmentAngle / 2) * 1.5;
            const icon = iconsCache[prizesConfig[i].icon];
            const iconPresent = icon && icon.complete;
            let fontSize = 24;
            let textWidth = 0;
            ctx.save();
            do {
                ctx.font = `${fontSize}px NavigatorHand, Arial, sans-serif`;
                textWidth = ctx.measureText(prizesConfig[i].text).width;
                const availableSpace = iconPresent ? 
                    iconRadius - textRadius - iconSize / 4 :
                    middleRadius - textRadius - iconSize / 4;
                if (textWidth < availableSpace || fontSize <= 14) {
                    break;
                }
                fontSize -= 1;
            } while (fontSize > 14);
            ctx.restore();
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(textAngle);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `${fontSize}px NavigatorHand, Arial, sans-serif`;
            ctx.fillText(prizesConfig[i].text, textRadius, 0);
            ctx.restore();
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + 0.08);
            const oddsRadius = middleRadius - 13;
            ctx.font = 'bold 24px NavigatorHand, Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(`${oddsPercentage}%`, oddsRadius, -20);
            ctx.restore();
            if (iconPresent) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(textAngle);
                ctx.save();
                ctx.translate(iconRadius, 0);
                ctx.rotate(Math.PI/2);
                ctx.filter = 'brightness(0) invert(1)';
                ctx.drawImage(icon, -iconSize/2+5, -iconSize/2-15, iconSize, iconSize);
                ctx.restore();
                ctx.restore();
            }
            currentAngle += segmentAngle;
        } else {
            if (totalWeight === 0) {
                currentAngle += 2 * Math.PI / prizesConfig.length;
            } else {
                currentAngle += Math.PI / 180;
            }
        }
    }
}

/**
 * @brief Draws the outer and inner circles of the wheel
 */
function drawCircles(ctx, centerX, centerY, outerRadius) {
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
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius - 16, 0, 2 * Math.PI);
    ctx.strokeStyle = '#151616';
    ctx.lineWidth = 32;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius - 32, 0, 2 * Math.PI);
    ctx.strokeStyle = '#283a4b';
    ctx.lineWidth = 10;
    ctx.stroke();
}

/**
 * @brief Draws the separator lines between segments
 */
function drawSeparators(ctx, wheel, centerX, centerY, outerRadius, totalWeight, effectiveTotal) {
    let currentAngle = wheel.angle;
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
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const extendedRadius = outerRadius + 5;
        ctx.lineTo(centerX + Math.cos(endAngle) * extendedRadius, 
                   centerY + Math.sin(endAngle) * extendedRadius);
        ctx.strokeStyle = '#1d1f1d';
        ctx.lineWidth = 10;
        ctx.stroke();
        currentAngle = endAngle;
    }
}

/**
 * @brief Draws the center image with rotation
 */
function drawCenterImage(ctx, wheel, centerX, centerY, innerRadius) {
    if (centerImage.complete && centerImage.naturalWidth !== 0) {
        const imageSize = innerRadius * 2;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(wheel.centerImageAngle);
        ctx.drawImage(centerImage, -innerRadius, -innerRadius, imageSize, imageSize);
        ctx.restore();
    } else {
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#242424';
        ctx.fill();
    }
}
