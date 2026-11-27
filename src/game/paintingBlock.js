import { paintingBlockIcon } from './paintingBlockIcon.js';
import { bindPaintingHeading } from '../cardIcons.js';

export function paintingBlock(kind, content, description, explain = false) {
    const row = document.createElement('div'); row.className = 'PaintingBlock ' + kind;
    const label = paintingBlockIcon(kind, description);
    if (explain) bindPaintingHeading(label, kind);
    row.append(label, content);
    return row;
}
