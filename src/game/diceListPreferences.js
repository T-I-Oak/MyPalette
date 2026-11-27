import { DataManager } from '../../../GameWorksOAK/src/lib/core/dataManager.js';

export const DICE_LIST_GAME_ID = 'MyPalette';
export const DICE_LIST_PREFERENCES_KEY = 'ui.diceList';
const point = value => value && ['x','y'].every(key => Number.isFinite(value[key]) && value[key] >= 0);
const dimensions = value => value && ['width','height'].every(key => Number.isFinite(value[key]) && value[key] > 0);
export function diceListPreferences(value) {
    if (value?.version !== 1) return {position:null,size:null};
    return {
        position:point(value.position) ? {x:value.position.x,y:value.position.y} : null,
        size:dimensions(value.size) ? {width:value.size.width,height:value.size.height} : null,
    };
}
export function loadDiceListPreferences() {
    try { return diceListPreferences(new DataManager(DICE_LIST_GAME_ID).getValue(DICE_LIST_PREFERENCES_KEY)); }
    catch { return {position:null,size:null}; }
}
export function saveDiceListPreferences(position,size) {
    const value={version:1,...diceListPreferences({version:1,position,size})};
    try { new DataManager(DICE_LIST_GAME_ID).setValue(DICE_LIST_PREFERENCES_KEY,value); }
    catch { /* Keep the window usable when browser storage is unavailable. */ }
}
