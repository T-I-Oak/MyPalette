import { goalProbability } from './goalProbability.js';

self.onmessage = ({ data: { key, goals, diceCount } }) => {
    try { self.postMessage({ key, probability: goalProbability(goals, diceCount) }); }
    catch (error) { self.postMessage({ key, error: error.message }); }
};
