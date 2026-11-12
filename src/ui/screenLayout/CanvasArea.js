import { MoveArea } from '../areaTransition/MoveArea.js';
import { transformRect } from '../areaTransition/geometry.js';

export class CanvasArea extends MoveArea {
    constructor(id, surface, definition, canvas, fixedLayer = null) {
        super(id, surface);
        if (![definition.width, definition.height].every(value => Number.isFinite(value) && value > 0)) {
            throw new RangeError('Expected positive standard dimensions');
        }
        this.standardWidth = definition.width;
        this.standardHeight = definition.height;
        this.topLeftOffset = definition.topLeftOffset ?? { x: 0, y: 0 };
        this.bottomRightOffset = definition.bottomRightOffset ?? { x: 0, y: 0 };
        this.name = definition.name;
        this.canvas = canvas;
        this.fixedLayer = fixedLayer;
        if (fixedLayer) {
            const label = fixedLayer.ownerDocument.createElement('div');
            label.className = 'LayoutAreaName texture-text-outline';
            label.textContent = this.name;
            fixedLayer.append(label);
        }
        this.logicalWidth = 0;
        this.logicalHeight = 0;
    }

    getLayoutRequirements() {
        return { width: this.standardWidth, height: this.standardHeight,
            topLeftOffset: this.topLeftOffset, bottomRightOffset: this.bottomRightOffset };
    }

    applyLayout(frame, pixelRatio) {
        this.layoutFrame = frame;
        const drawing = frame.drawRect;
        this.logicalWidth = frame.logicalWidth;
        this.logicalHeight = frame.logicalHeight;
        const visible = frame.visible && frame.drawable;
        this.setPresentation({ visible, interactive: visible });
        this.setTransform({ x: drawing.x, y: drawing.y, scale: frame.scale });
        const { canvas } = this;
        Object.assign(canvas.style, {
            left: `${drawing.x}px`, top: `${drawing.y}px`,
            width: `${drawing.width}px`, height: `${drawing.height}px`,
        });
        canvas.hidden = !visible;
        if (this.fixedLayer) {
            Object.assign(this.fixedLayer.style, {
                left: `${frame.rect.x}px`, top: `${frame.rect.y}px`,
                width: `${frame.rect.width / frame.fixedScale}px`, height: `${frame.rect.height / frame.fixedScale}px`,
                transform: `scale(${frame.fixedScale})`, transformOrigin: 'top left',
            });
            this.fixedLayer.hidden = !frame.visible;
            this.fixedLayer.inert = !frame.visible;
        }
        if (!frame.drawable) return;
        const width = Math.max(1, Math.round(drawing.width * pixelRatio));
        const height = Math.max(1, Math.round(drawing.height * pixelRatio));
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
    }
}
