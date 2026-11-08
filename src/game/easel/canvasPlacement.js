export const CANVAS_BOTTOM = .7375;
export const CANVAS_BACK = .2525;

export function canvasPlacement(imageWidth, imageHeight) {
    const width = 1.3;
    const height = width * imageHeight / imageWidth;
    const depth = .05;
    return {
        width, height, depth,
        center: [0, CANVAS_BOTTOM + height / 2, CANVAS_BACK + depth / 2],
        top: CANVAS_BOTTOM + height,
    };
}
