/**
 * @brief Prize configuration for the wheel
 */
const basePrizes = [
    { text: 'Pet de Yago', weight: 3, icon: '/assets/images/petyago.svg' },
    { text: 'Seringue utilisée', weight: 3, icon: '/assets/images/seringue.svg' },
    { text: 'Cheveu de Yago', weight: 3, icon: '/assets/images/scissors.svg' },
    { text: 'Rhumberto Blanc', weight: 1, special: true, icon: '/assets/images/rhum.svg' },
    { text: 'RomeroDiMery', weight: 2, icon: '/assets/images/rhum.svg' },
];

/**
 * @brief Duplicate prizes if there aren't enough for good wheel distribution
 */
export const prizesConfig = (() => {
    const minPrizeCount = 9;
    if (basePrizes.length >= minPrizeCount) {
        return basePrizes;
    } else {
        // If we have fewer than minimum required prizes, duplicate the list
        return [...basePrizes, ...basePrizes.map(prize => ({...prize}))];
    }
})();

/**
 * @brief Creates a flat array of prizes based on weights
 */
export const weightedPrizes = prizesConfig.flatMap(prize => 
    Array(prize.weight).fill({ text: prize.text, special: prize.special, icon: prize.icon })
);

/**
 * @brief Preloads all SVG icons used in the wheel
 */
export const iconsCache = {};

/**
 * @brief Center image for the wheel
 */
export const centerImage = new Image();
centerImage.src = '/assets/images/roulette-center.png';
