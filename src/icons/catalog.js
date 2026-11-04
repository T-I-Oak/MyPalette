// Icon-only proposals stay separate from playable effects until their rules are defined.
import { EFFECTS } from '../effectCatalog.js';
export const ICON_EFFECTS = [...EFFECTS, {type:'refreshDice',label:'使用済みダイスの再利用',fields:[]}];
