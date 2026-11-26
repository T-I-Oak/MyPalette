const translated = (ja, en) => ({ 'lang-store': { ja, en } });

export const iconDescriptionResources = {
    material: translated('いずれかの色の{material}。', '{material} of any color.'),
    color: translated('いずれかの{color}の画材。', 'Any {color} painting material.'),
    face: translated('{color}の{material}。', '{color} {material}.'),
    goal: translated('カードの目標。', 'The card’s goal.'),
    play: translated('カード着手時に発動する効果。', 'Effects triggered when starting the card.'),
    reward: translated('ステップ達成時に発動する効果。', 'Effects triggered when completing the step.'),
    colors: Object.fromEntries(Object.entries({ orange: '橙色', yellow: '黄色', green: '緑色', blue: '青色', purple: '紫色', red: '赤色' })
        .map(([key, ja]) => [key, translated(ja, key)])),
};

export function describeNormalFace(face, text, label) {
    const template = face.material && face.color ? text.face : face.material ? text.material : text.color;
    return template.replace(/\{(material|color)\}/g, (_, key) => key === 'color' ? text.colors[face.color] : label(face.material));
}
