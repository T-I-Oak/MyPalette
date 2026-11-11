import { cardSceneSnapshot, locateSceneCards, cardZones } from './cardSceneLayout.js';

export function relocateSceneCards(display, actual, ids) {
    const result = cardSceneSnapshot(display), destinations = locateSceneCards(actual);
    const moving = new Set(ids);
    for (const area of cardZones) result[area] = result[area].filter(card => !moving.has(card.id));
    for (const grade of Object.keys(result.stocks)) result.stocks[grade] = result.stocks[grade].filter(card => !moving.has(card.id));
    for (const id of ids) {
        const location = destinations.get(id), card = { id, step: location.step };
        const list = location.area === 'stock' ? result.stocks[location.grade] : result[location.area];
        list.push(card);
        const ordered = location.area === 'stock' ? actual.stocks[location.grade] : actual[location.area];
        list.sort((a, b) => ordered.findIndex(item => item.id === a.id) - ordered.findIndex(item => item.id === b.id));
    }
    for (const grade of Object.keys(result.public)) {
        if (!result.stocks[grade].some(card => card.id === result.public[grade])) result.public[grade] = null;
    }
    return result;
}

export function sceneChanges(display, actual) {
    const from = locateSceneCards(display), to = locateSceneCards(actual);
    return [...to].flatMap(([id, card]) => {
        const old = from.get(id);
        return old.area === card.area ? [] : [{ id, from: old.area, to: card.area }];
    });
}

export function closingStockCards(display, actual) {
    return Object.entries(display.stocks).flatMap(([grade, cards]) => {
        const orderChanged = cards.map(card => card.id).join() !== actual.stocks[grade].map(card => card.id).join();
        const closes = display.public[grade] && !actual.public[grade];
        return cards.length && (orderChanged || closes) ? [{ id: cards[0].id, grade }] : [];
    });
}
