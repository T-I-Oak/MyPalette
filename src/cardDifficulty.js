export function cardDifficulty(probabilities) {
    if (probabilities.includes(null)) return null;
    return probabilities.reduce((total, probability) => total + 1 / probability, 0);
}
