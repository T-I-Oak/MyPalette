export function createIconPopovers({ createPopup, releasePopup }) {
    const entries = [];
    function closeFrom(index) {
        for (const entry of entries.splice(index).reverse()) {
            entry.anchor.setAttribute('aria-expanded', 'false');
            releasePopup(entry.popup); entry.popup.remove();
        }
    }
    function show(anchor, value, pinned) {
        const parentIndex = entries.findLastIndex(entry => entry.popup.contains(anchor));
        const index = parentIndex + 1;
        const current = entries[index];
        if (current?.anchor === anchor) {
            if (pinned) { current.pinned = true; current.popup.classList.add('is-pinned'); }
            return;
        }
        if (!pinned && current?.pinned) return;
        closeFrom(index);
        const popup = createPopup(value);
        popup.classList.toggle('is-pinned', pinned);
        (entries[parentIndex]?.popup || anchor.closest('dialog') || anchor.ownerDocument.body).append(popup);
        entries.push({ anchor, popup, pinned });
        anchor.setAttribute('aria-expanded', 'true');
        const rect = anchor.getBoundingClientRect();
        popup.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - popup.offsetWidth - 8))}px`;
        popup.style.top = `${Math.max(8, rect.bottom + popup.offsetHeight + 12 < innerHeight ? rect.bottom + 6 : rect.top - popup.offsetHeight - 6)}px`;
    }
    return {
        bind(anchor, value) {
            anchor.setAttribute('role', 'button'); anchor.tabIndex = 0;
            anchor.setAttribute('aria-expanded', 'false');
            const tap = () => {
                const index = entries.findIndex(entry => entry.anchor === anchor);
                if (index >= 0 && entries[index].pinned) closeFrom(index);
                else show(anchor, value, true);
            };
            anchor.addEventListener('mouseenter', () => show(anchor, value, false));
            anchor.addEventListener('mouseleave', () => {
                const index = entries.findIndex(entry => entry.anchor === anchor);
                if (index >= 0 && !entries[index].pinned) closeFrom(index);
            });
            anchor.addEventListener('click', event => { event.stopPropagation(); tap(); });
            anchor.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); tap(); }
                if (event.key === 'Escape') {
                    const index = entries.findIndex(entry => entry.anchor === anchor);
                    if (index >= 0) closeFrom(index);
                }
            });
        },
        outside(target) {
            const index = entries.findLastIndex(entry => entry.anchor.contains(target) || entry.popup.contains(target));
            closeFrom(index + 1);
        },
        clearHover() {
            const index = entries.findIndex(entry => !entry.pinned);
            if (index >= 0) closeFrom(index);
        },
        release(root) {
            const index = entries.findIndex(entry => root.contains(entry.anchor));
            if (index >= 0) closeFrom(index);
        },
    };
}
