const shapes = {
    goal: '<path d="M5 21V3m0 1h13l-3 4 3 4H5m-3 9h7"/>',
    play: '<path d="M11 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7m-8-8h12m-4-4 4 4-4 4"/>',
    reward: '<circle cx="12" cy="9" r="6.5"/><path d="m9.5 9 1.7 1.7 3.4-3.4M7.5 14l-2 7 4.5-2 2 2 2-2 4.5 2-2-7"/>',
    special: '<path d="m12 2 3 6.5 7 1-5 5 1.2 7-6.2-3.4L5.8 22 7 14.5 2 9.5l7-1Z"/>',
};

export function paintingBlock(kind, content, description) {
    const row = document.createElement('div'); row.className = 'PaintingBlock ' + kind;
    const label = document.createElement('span'); label.className = 'PaintingBlockLabel';
    label.innerHTML = `<svg viewBox="0 0 24 24" role="img" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes[kind]}</svg>`;
    label.firstElementChild.setAttribute('aria-label', description);
    row.append(label, content);
    return row;
}
