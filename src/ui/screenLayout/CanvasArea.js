import { MoveArea } from '../areaTransition/MoveArea.js';
import { transformRect } from '../areaTransition/geometry.js';

export class CanvasArea extends MoveArea {
    constructor(id, surface, definition, canvas) {
        super(id, surface);
        if (![definition.width, definition.height].every(value => Number.isFinite(value) && value > 0)) {
            throw new RangeError('Expected positive standard dimensions');
        }
        this.standardWidth = definition.width;
        this.standardHeight = definition.height;
        this.name = definition.name;
        this.canvas = canvas;
        this.logicalWidth = 0;
        this.logicalHeight = 0;
    }

    applyLayout(frame, pixelRatio) {
        this.logicalWidth = frame.logicalWidth;
        this.logicalHeight = frame.logicalHeight;
        this.setTransform({ x: frame.rect.x, y: frame.rect.y, scale: frame.scale });
        this.setPresentation({ visible: frame.visible, interactive: frame.visible });
        const { canvas } = this;
        Object.assign(canvas.style, {
            left: `${frame.rect.x}px`, top: `${frame.rect.y}px`,
            width: `${frame.rect.width}px`, height: `${frame.rect.height}px`,
        });
        canvas.hidden = !frame.visible;
        const width = Math.max(1, Math.round(frame.rect.width * pixelRatio));
        const height = Math.max(1, Math.round(frame.rect.height * pixelRatio));
        const changed = canvas.width !== width || canvas.height !== height
            || this.drawWidth !== this.logicalWidth || this.drawHeight !== this.logicalHeight;
        if (changed) {
            canvas.width = width;
            canvas.height = height;
            this.drawWidth = this.logicalWidth;
            this.drawHeight = this.logicalHeight;
            this.draw();
        }
    }

    readScreenRect(localRect) {
        return transformRect(localRect, this.readTransform());
    }

    draw() {
        const context = this.canvas.getContext('2d');
        const width = this.logicalWidth;
        const height = this.logicalHeight;
        context.setTransform(this.canvas.width / width, 0, 0, this.canvas.height / height, 0, 0);
        context.clearRect(0, 0, width, height);
        const colors = getComputedStyle(this.canvas);
        context.fillStyle = colors.getPropertyValue('--area-fill');
        context.fillRect(0, 0, width, height);
        context.strokeStyle = colors.getPropertyValue('--area-border');
        context.lineWidth = 2;
        context.strokeRect(1, 1, width - 2, height - 2);
        context.fillStyle = colors.color;
        context.font = '24px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.name, width / 2, height / 2);
    }
}
