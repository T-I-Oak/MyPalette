export class MoveObject {
    #area = null;
    #id;

    constructor(id, element = null) {
        this.#id = id;
        this.element = element;
        this.interactive = true;
    }

    get id() {
        return this.#id;
    }

    get area() {
        return this.#area;
    }

    setArea(area) {
        this.#area = area;
    }

    onMoveFrame() {}

    render() {}
}
