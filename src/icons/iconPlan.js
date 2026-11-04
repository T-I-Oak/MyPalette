import { MATERIALS, COLORS, SPECIAL_FACE_EFFECTS } from '../effectCatalog.js';
import { ICON_EFFECTS } from './catalog.js';

export function effectIconPlan(input) {
    const definition = ICON_EFFECTS.find(item => item.type === input?.type);
    if (!definition) throw new Error('Unknown effect type');
    const effect = { type: input.type };
    for (const field of definition.fields) {
        const value = input[field.name];
        if (field.options ? !field.options.includes(value) : !Number.isSafeInteger(value) || (field.min !== undefined && value < field.min) || (field.nonzero && value === 0)) {
            throw new Error(`Invalid ${field.name} for ${input.type}`);
        }
        effect[field.name] = value;
    }
    let nodes;
    switch (effect.type) {
        case 'gainNormalDice': case 'gainColorDice': case 'gainMaterialDice':
            nodes = [{ kind: 'die', lifetime: effect.lifetime, colors: effect.colors, material: effect.material }]; break;
        case 'gainRerolls': nodes = [{ kind: 'ticket' }]; break;
        case 'refreshDice': nodes = [{kind:'refreshedDie',role:'main'}]; break;
        case 'reroll': nodes = [{ kind: 'reroll' }, { kind: 'lightning' }]; break;
        case 'changeColor': nodes = [{ kind: 'pen' }, { kind: 'face', color: effect.color }]; break;
        case 'changeMaterial': nodes = [{ kind: 'pen' }, { kind: 'face', material: effect.material }]; break;
        case 'changeSpecialFace': nodes = [{ kind: 'pen' }, { kind: 'face', effect: { ...SPECIAL_FACE_EFFECTS[effect.face] } }]; break;
        case 'discardDice': nodes = [{ kind: 'die' }, { kind: 'trash' }]; break;
        case 'changeFame': nodes = [{ kind: 'fame', amount: effect.amount }]; break;
        case 'drawCards': nodes = [{ kind: 'hand', role: 'main' }, { kind: 'arrowQuantity', arrows: ['←'], value: `+${effect.count}` }]; break;
        case 'gainStockCards': nodes = [{ kind: 'arrowQuantity', arrows: ['←'], value: `×${effect.count}` }, { kind: 'stock', role: 'main' }]; break;
        case 'changeCardStep': nodes = [{ kind: 'pen' }, { kind: 'card', step: effect.step }]; break;
        case 'exchangeCards': nodes = [{ kind: 'hand', role: 'main' }, { kind: 'arrowQuantity', arrows: ['→', '←'], value: `×${effect.count}` }, { kind: 'stock', role: 'main' }]; break;
        case 'activateSpecialFaces': nodes = [{ kind: 'face', star: true }, { kind: 'lightning' }]; break;
    }
    if (['changeColor','changeMaterial','changeSpecialFace','changeCardStep','discardDice','reroll','activateSpecialFaces'].includes(effect.type)) {
        nodes = nodes.map(node => ({...node, role: ['pen','trash','lightning'].includes(node.kind) ? 'sub' : 'main'}));
    }
    const acquisition = ['gainNormalDice','gainColorDice','gainMaterialDice','gainRerolls'].includes(effect.type);
    if ((effect.count > 1 || acquisition) && !['drawCards', 'exchangeCards', 'gainStockCards'].includes(effect.type)) nodes.push({ kind: 'quantity', value: `×${effect.count}` });
    return { effect, nodes };
}

export function goalIconPlan(input) {
    if (!input || Object.keys(input).some(key => !['material', 'color'].includes(key)) ||
        (!input.material && !input.color) || (input.material !== undefined && !MATERIALS.includes(input.material)) ||
        (input.color !== undefined && !COLORS.includes(input.color))) throw new Error('Invalid goal condition');
    return { condition: { ...input }, nodes: [{ kind: 'goal', ...input }] };
}

// Applies to actual die faces and face previews inside card effects alike.
export function faceEffectIconPlan(effect) {
    const plan=effectIconPlan(effect);
    return {...plan,nodes:plan.nodes.filter(node=>!(plan.effect.count===1&&node.kind==='quantity'&&node.value==='×1'))};
}
